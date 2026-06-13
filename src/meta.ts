import type { RateLimitInfo } from "./http/rate-limit";

export interface ResponseMeta {
  status: number;
  requestId: string | null;
  rateLimit: RateLimitInfo;
  headers: Headers;
}

export const RESPONSE_META: unique symbol = Symbol("skinpricer.responseMeta");

export type WithMeta<T> = T & { readonly [RESPONSE_META]?: ResponseMeta };

export function attachMeta<T>(data: T, meta: ResponseMeta): T {
  if (data !== null && typeof data === "object") {
    Object.defineProperty(data, RESPONSE_META, {
      value: meta,
      enumerable: false,
      writable: false,
      configurable: true,
    });
  }
  return data;
}

/** Reads the response metadata attached to a result, if present. */
export function getMeta(value: unknown): ResponseMeta | undefined {
  if (value !== null && typeof value === "object") {
    return (value as { [RESPONSE_META]?: ResponseMeta })[RESPONSE_META];
  }
  return undefined;
}
