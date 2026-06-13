import { describe, expect, it } from "vitest";
import { parseRateLimit } from "../../src/http/rate-limit";

describe("parseRateLimit", () => {
  it("parses minute and month windows plus retry-after", () => {
    const headers = new Headers({
      "X-RateLimit-Limit": "60",
      "X-RateLimit-Remaining": "59",
      "X-RateLimit-Reset": "42",
      "X-RateLimit-Limit-Month": "10000",
      "X-RateLimit-Remaining-Month": "9999",
      "X-RateLimit-Reset-Month": "123456",
      "Retry-After": "30",
    });

    expect(parseRateLimit(headers)).toEqual({
      limit: 60,
      remaining: 59,
      resetSeconds: 42,
      month: { limit: 10000, remaining: 9999, resetSeconds: 123456 },
      retryAfterSeconds: 30,
    });
  });

  it("returns null for missing headers", () => {
    const info = parseRateLimit(new Headers());
    expect(info.limit).toBeNull();
    expect(info.remaining).toBeNull();
    expect(info.month.limit).toBeNull();
    expect(info.retryAfterSeconds).toBeNull();
  });

  it("returns null for non-numeric header values", () => {
    const info = parseRateLimit(new Headers({ "X-RateLimit-Limit": "nope" }));
    expect(info.limit).toBeNull();
  });
});
