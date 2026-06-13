import { describe, expect, it } from "vitest";
import { errorFromResponse } from "../../src/errors/from-response";
import {
  APIError,
  AuthenticationError,
  FeatureNotAvailableError,
  NotFoundError,
  PermissionError,
  RateLimitError,
  ServerError,
  ValidationError,
} from "../../src/errors/http-errors";
import { parseRateLimit } from "../../src/http/rate-limit";
import type { ResponseMeta } from "../../src/meta";

function meta(headers: Record<string, string> = {}): ResponseMeta {
  const h = new Headers(headers);
  return {
    status: 0,
    requestId: h.get("x-request-id"),
    rateLimit: parseRateLimit(h),
    headers: h,
  };
}

function nest(status: number, message: string | string[], error = "Error") {
  return { statusCode: status, message, error };
}

describe("errorFromResponse — default NestJS shape", () => {
  it("maps 400 to ValidationError and keeps the message array", () => {
    const err = errorFromResponse({
      status: 400,
      body: nest(
        400,
        ["limit must not exceed 2000", "markets must be strings"],
        "Bad Request",
      ),
      meta: meta(),
    });
    expect(err).toBeInstanceOf(ValidationError);
    expect((err as ValidationError).messages).toHaveLength(2);
    expect(err.message).toContain("limit must not exceed 2000");
    expect(err.status).toBe(400);
  });

  it("maps 401 to AuthenticationError", () => {
    const err = errorFromResponse({
      status: 401,
      body: nest(401, "API key invalid or inactive", "Unauthorized"),
      meta: meta(),
    });
    expect(err).toBeInstanceOf(AuthenticationError);
  });

  it("maps a plan/feature 403 to FeatureNotAvailableError", () => {
    const err = errorFromResponse({
      status: 403,
      body: nest(
        403,
        "Your current plan (DEVELOPER) does not include access to this feature (feature:historical_data).",
      ),
      meta: meta(),
    });
    expect(err).toBeInstanceOf(FeatureNotAvailableError);
    expect(err).toBeInstanceOf(PermissionError);
  });

  it("maps a non-feature 403 to PermissionError", () => {
    const err = errorFromResponse({
      status: 403,
      body: nest(403, "Subscription is not active"),
      meta: meta(),
    });
    expect(err).toBeInstanceOf(PermissionError);
    expect(err).not.toBeInstanceOf(FeatureNotAvailableError);
  });

  it("maps 404 to NotFoundError", () => {
    const err = errorFromResponse({
      status: 404,
      body: nest(404, "Not found"),
      meta: meta(),
    });
    expect(err).toBeInstanceOf(NotFoundError);
  });

  it("maps 429 to RateLimitError with rate-limit fields", () => {
    const err = errorFromResponse({
      status: 429,
      body: nest(429, "API key minute rate limit exceeded"),
      meta: meta({
        "retry-after": "30",
        "x-ratelimit-limit": "60",
        "x-ratelimit-remaining": "0",
      }),
    });
    expect(err).toBeInstanceOf(RateLimitError);
    const rate = err as RateLimitError;
    expect(rate.retryAfterSeconds).toBe(30);
    expect(rate.limit).toBe(60);
    expect(rate.remaining).toBe(0);
  });

  it("maps 5xx to ServerError", () => {
    const err = errorFromResponse({
      status: 502,
      body: nest(502, "Bad gateway"),
      meta: meta(),
    });
    expect(err).toBeInstanceOf(ServerError);
  });

  it("falls back to APIError for other statuses", () => {
    const err = errorFromResponse({
      status: 418,
      body: nest(418, "I'm a teapot"),
      meta: meta(),
    });
    expect(err).toBeInstanceOf(APIError);
    expect(err).not.toBeInstanceOf(ServerError);
  });
});

describe("errorFromResponse — custom envelope and odd bodies", () => {
  it("parses the custom { success:false, error:{ code } } envelope", () => {
    const err = errorFromResponse({
      status: 403,
      body: {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "No feature access",
          statusCode: 403,
        },
      },
      meta: meta(),
    });
    expect(err).toBeInstanceOf(FeatureNotAvailableError);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("No feature access");
  });

  it("handles a raw string body", () => {
    const err = errorFromResponse({
      status: 502,
      body: "<html>Bad Gateway</html>",
      meta: meta(),
    });
    expect(err).toBeInstanceOf(ServerError);
    expect(err.message).toContain("Bad Gateway");
  });

  it("handles an empty body with a default message", () => {
    const err = errorFromResponse({
      status: 500,
      body: undefined,
      meta: meta(),
    });
    expect(err.message).toBe("Request failed with status 500");
  });
});
