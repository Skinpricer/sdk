export interface RateLimitWindow {
  limit: number | null;
  remaining: number | null;
  resetSeconds: number | null;
}

export interface RateLimitInfo {
  limit: number | null;
  remaining: number | null;
  resetSeconds: number | null;
  month: RateLimitWindow;
  retryAfterSeconds: number | null;
}

function readInt(headers: Headers, name: string): number | null {
  const raw = headers.get(name);
  if (raw === null) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
}

export function parseRateLimit(headers: Headers): RateLimitInfo {
  return {
    limit: readInt(headers, "x-ratelimit-limit"),
    remaining: readInt(headers, "x-ratelimit-remaining"),
    resetSeconds: readInt(headers, "x-ratelimit-reset"),
    month: {
      limit: readInt(headers, "x-ratelimit-limit-month"),
      remaining: readInt(headers, "x-ratelimit-remaining-month"),
      resetSeconds: readInt(headers, "x-ratelimit-reset-month"),
    },
    retryAfterSeconds: readInt(headers, "retry-after"),
  };
}
