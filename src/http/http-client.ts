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

      let response: Response;
      try {
        response = await this.config.fetch(prepared.url, {
          method: prepared.method,
          headers: prepared.headers,
          body: prepared.body,
          signal: handle.signal,
        });
      } catch (error) {
        handle.cleanup();

        if (callerSignal?.aborted && !handle.didTimeout()) {
          throw abortError(callerSignal);
        }

        if (
          retry &&
          shouldRetry({ method: input.method, attempt, retry, status: null })
        ) {
          const delayMs = retryDelayMs({
            attempt,
            retry,
            retryAfterSeconds: null,
          });
          await runHook(hooks.onRetry, {
            method: input.method,
            url: prepared.url,
            attempt,
            delayMs,
            status: null,
          });
          await sleep(delayMs, callerSignal);
          attempt += 1;
          continue;
        }

        if (handle.didTimeout()) {
          throw new TimeoutError(`Request timed out after ${timeoutMs}ms`, {
            cause: error,
          });
        }
        throw new NetworkError(networkMessage(error), { cause: error });
      }

      handle.cleanup();

      try {
        const parsed = await parseResponse<T>(response);
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
        if (error instanceof RateLimitError) {
          this.recordRateLimit(error.rateLimit, error.retryAfterSeconds);
        }
        if (
          error instanceof SkinpricerError &&
          error.status !== undefined &&
          retry &&
          shouldRetry({
            method: input.method,
            attempt,
            retry,
            status: error.status,
          })
        ) {
          const retryAfterSeconds =
            error instanceof RateLimitError
              ? error.retryAfterSeconds
              : (error.rateLimit?.retryAfterSeconds ?? null);
          const delayMs = retryDelayMs({ attempt, retry, retryAfterSeconds });
          await runHook(hooks.onRetry, {
            method: input.method,
            url: prepared.url,
            attempt,
            delayMs,
            status: error.status,
            error,
          });
          await sleep(delayMs, callerSignal);
          attempt += 1;
          continue;
        }
        throw error;
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
