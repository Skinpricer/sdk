import type { SkinpricerError } from "./errors/base";
import type { RateLimitInfo } from "./http/rate-limit";
import type { HttpMethod } from "./http/types";

export interface RequestHookContext {
  method: HttpMethod;
  url: string;
  attempt: number;
}

export interface ResponseHookContext extends RequestHookContext {
  status: number;
  rateLimit: RateLimitInfo;
}

export interface RetryHookContext extends RequestHookContext {
  delayMs: number;
  status: number | null;
  error?: SkinpricerError;
}

export interface ClientHooks {
  onRequest?(ctx: RequestHookContext): void | Promise<void>;
  onResponse?(ctx: ResponseHookContext): void | Promise<void>;
  onRetry?(ctx: RetryHookContext): void | Promise<void>;
}

export async function runHook<C>(
  hook: ((ctx: C) => void | Promise<void>) | undefined,
  ctx: C,
): Promise<void> {
  if (!hook) return;
  try {
    await hook(ctx);
  } catch {
    // ignore
  }
}
