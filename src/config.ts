import { ConfigurationError } from "./errors/network-errors";
import type { ClientHooks } from "./hooks";
import type { FetchLike, HttpMethod } from "./http/types";
import { VERSION } from "./version";

export type AuthScheme = "Bearer" | "ApiKey";

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOnMethods: ReadonlyArray<HttpMethod>;
  respectRetryAfter: boolean;
}

export interface ClientConfig {
  /** API key, e.g. `sk_live_...`. */
  apiKey: string;
  /** Base URL including the version prefix. */
  baseUrl?: string;
  /**
   * Base URL (incl. version prefix) for the keyless public-service endpoints
   * that live off the pricing host — currently only `markets.health`. Defaults
   * to deriving the `api.` host from {@link baseUrl} (e.g.
   * `pricing.skinpricer.com` → `api.skinpricer.com`), falling back to
   * `https://api.skinpricer.com/v1`.
   */
  publicBaseUrl?: string;
  /** Custom `fetch` implementation. Defaults to the global `fetch`. */
  fetch?: FetchLike;
  /** Per-request timeout in ms. Defaults to 30000; `0` disables it. */
  timeoutMs?: number;
  /** Retry behavior, or `false` to disable. */
  retry?: Partial<RetryConfig> | false;
  /** Extra headers merged into every request. */
  headers?: Record<string, string>;
  /** Authorization scheme. Defaults to `Bearer`. */
  authScheme?: AuthScheme;
  userAgent?: string;
  /** Wait for the rate-limit window to reset when `remaining` hits 0. Off by default. */
  autoThrottle?: boolean;
  /** Hooks invoked around each request. */
  hooks?: ClientHooks;
}

export interface ResolvedConfig {
  apiKey: string;
  baseUrl: string;
  publicBaseUrl: string;
  fetch: FetchLike;
  timeoutMs: number;
  retry: RetryConfig | null;
  headers: Record<string, string>;
  authScheme: AuthScheme;
  userAgent: string;
  autoThrottle: boolean;
  hooks: ClientHooks;
}

export const DEFAULT_BASE_URL = "https://pricing.skinpricer.com/v1";
export const DEFAULT_PUBLIC_BASE_URL = "https://api.skinpricer.com/v1";
export const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Derives the public-service base from the pricing base by swapping the leading
 * `pricing.` host label for `api.`. Falls back to {@link DEFAULT_PUBLIC_BASE_URL}
 * for any non-`pricing.` base.
 */
function derivePublicBaseUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl);
    if (parsed.hostname.startsWith("pricing.")) {
      parsed.hostname = `api.${parsed.hostname.slice("pricing.".length)}`;
      return parsed.toString().replace(/\/+$/, "");
    }
  } catch {
    // fall through to the default
  }
  return DEFAULT_PUBLIC_BASE_URL;
}

export const DEFAULT_RETRY: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 250,
  maxDelayMs: 8_000,
  retryOnMethods: ["GET"],
  respectRetryAfter: true,
};

function resolveFetch(custom?: FetchLike): FetchLike {
  if (custom) return custom;
  const globalFetch = (globalThis as { fetch?: FetchLike }).fetch;
  if (typeof globalFetch === "function") {
    return globalFetch.bind(globalThis) as FetchLike;
  }
  throw new ConfigurationError(
    "No global `fetch` is available. Provide a `fetch` implementation in the client config " +
      "(required on Node < 18 or non-fetch runtimes).",
  );
}

function resolveRetry(retry: ClientConfig["retry"]): RetryConfig | null {
  if (retry === false) return null;
  if (retry === undefined) return DEFAULT_RETRY;
  return { ...DEFAULT_RETRY, ...retry };
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ConfigurationError(
      `\`baseUrl\` is not a valid URL: "${baseUrl}"`,
    );
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ConfigurationError(
      `\`baseUrl\` must use http: or https: (got "${parsed.protocol}").`,
    );
  }
  return trimmed;
}

export function resolveConfig(config: ClientConfig): ResolvedConfig {
  if (typeof config.apiKey !== "string" || config.apiKey.trim().length === 0) {
    throw new ConfigurationError(
      "A non-empty `apiKey` is required to construct SkinpricerClient.",
    );
  }

  const baseUrl = normalizeBaseUrl(config.baseUrl ?? DEFAULT_BASE_URL);

  return {
    apiKey: config.apiKey,
    baseUrl,
    publicBaseUrl: normalizeBaseUrl(
      config.publicBaseUrl ?? derivePublicBaseUrl(baseUrl),
    ),
    fetch: resolveFetch(config.fetch),
    timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    retry: resolveRetry(config.retry),
    headers: { ...config.headers },
    authScheme: config.authScheme ?? "Bearer",
    userAgent: config.userAgent ?? `skinpricer-sdk/${VERSION}`,
    autoThrottle: config.autoThrottle ?? false,
    hooks: config.hooks ?? {},
  };
}
