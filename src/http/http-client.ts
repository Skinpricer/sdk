import {
  DEFAULT_RETRY,
  type ResolvedConfig,
  type RetryConfig,
} from "../config";
import { SkinpricerError } from "../errors/base";
import { RateLimitError } from "../errors/http-errors";
import { NetworkError, TimeoutError } from "../errors/network-errors";
import { runHook } from "../hooks";
import { abortError } from "../utils/abort";
import { sleep } from "../utils/sleep";
import { parseResponse, type HttpResponse } from "./parse-response";
import type { RateLimitInfo } from "./rate-limit";
import { buildRequest, type BuildRequestInput } from "./request-builder";
import { retryDelayMs, shouldRetry } from "./retry";
import { withTimeout } from "./timeout";

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  retry?: Partial<RetryConfig> | false;
}

const MAX_THROTTLE_WAIT_MS = 60_000;

function resolveRequestRetry(
  base: RetryConfig | null,
  override: RequestOptions["retry"],
): RetryConfig | null {
  if (override === false) return null;
  if (override === undefined) return base;
  return { ...(base ?? DEFAULT_RETRY), ...override };
}

function networkMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Network request failed.";
}

export class HttpClient {
  private throttleUntil = 0;

  constructor(private readonly config: ResolvedConfig) {}

  /** Base URL for keyless public-service endpoints (see {@link ResolvedConfig.publicBaseUrl}). */
  get publicBaseUrl(): string {
    return this.config.publicBaseUrl;
  }

  /** Selects an API version while retaining a configured gateway prefix. */
  versionedBaseUrl(version: "v2", baseUrl = this.config.baseUrl): string {
    const url = new URL(baseUrl);
    url.pathname = /\/v[0-9]+$/.test(url.pathname)
      ? url.pathname.replace(/\/v[0-9]+$/, `/${version}`)
      : `${url.pathname.replace(/\/$/, "")}/${version}`;
    return url.toString().replace(/\/$/, "");
  }

  async request<T>(
    input: BuildRequestInput,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const prepared = buildRequest(this.config, input);
    const retry = resolveRequestRetry(this.config.retry, options.retry);
    const timeoutMs = options.timeoutMs ?? this.config.timeoutMs;
    const callerSignal = options.signal;
    const { hooks } = this.config;

    await this.awaitThrottle(callerSignal);

    let attempt = 0;

    for (;;) {
      const handle = withTimeout(timeoutMs, callerSignal);
      await runHook(hooks.onRequest, {
        method: input.method,
        url: prepared.url,
        attempt,
      });

      try {
        const response = await this.config.fetch(prepared.url, {
          method: prepared.method,
          headers: prepared.headers,
          body: prepared.body,
          signal: handle.signal,
        });
        const parsed = await parseResponse<T>(
          response,
          input.ifNoneMatch !== undefined,
        );
        handle.cleanup();
        this.recordRateLimit(parsed.meta.rateLimit);
        await runHook(hooks.onResponse, {
          method: input.method,
          url: prepared.url,
          attempt,
          status: parsed.meta.status,
          rateLimit: parsed.meta.rateLimit,
        });
        return parsed;
      } catch (error) {
        handle.cleanup();
        if (callerSignal?.aborted && !handle.didTimeout())
          throw abortError(callerSignal);
        const failure = handle.didTimeout()
          ? new TimeoutError(`Request timed out after ${timeoutMs}ms`, {
              cause: error,
            })
          : error instanceof SkinpricerError
            ? error
            : new NetworkError(networkMessage(error), { cause: error });
        if (failure instanceof RateLimitError) {
          this.recordRateLimit(failure.rateLimit, failure.retryAfterSeconds);
        }
        const status = failure.status ?? null;
        if (
          retry &&
          shouldRetry({ method: input.method, attempt, retry, status })
        ) {
          const retryAfterSeconds =
            failure instanceof RateLimitError
              ? failure.retryAfterSeconds
              : (failure.rateLimit?.retryAfterSeconds ?? null);
          const delayMs = retryDelayMs({ attempt, retry, retryAfterSeconds });
          await runHook(hooks.onRetry, {
            method: input.method,
            url: prepared.url,
            attempt,
            delayMs,
            status,
            error: failure,
          });
          await sleep(delayMs, callerSignal);
          attempt += 1;
          continue;
        }
        throw failure;
      }
    }
  }

  private recordRateLimit(
    rateLimit: RateLimitInfo | undefined,
    retryAfterSeconds?: number | null,
  ): void {
    if (!this.config.autoThrottle || !rateLimit) return;
    const waitSeconds =
      retryAfterSeconds ??
      (rateLimit.remaining === 0 ? rateLimit.resetSeconds : null);
    if (waitSeconds === null || waitSeconds <= 0) return;
    const waitMs = Math.min(waitSeconds * 1000, MAX_THROTTLE_WAIT_MS);
    this.throttleUntil = Math.max(this.throttleUntil, Date.now() + waitMs);
  }

  private async awaitThrottle(signal?: AbortSignal): Promise<void> {
    if (!this.config.autoThrottle) return;
    const waitMs = this.throttleUntil - Date.now();
    if (waitMs > 0) {
      await sleep(waitMs, signal);
    }
  }
}
