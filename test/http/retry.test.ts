import { describe, expect, it } from "vitest";
import { DEFAULT_RETRY, type RetryConfig } from "../../src/config";
import {
  backoffDelayMs,
  isRetryableStatus,
  retryDelayMs,
  shouldRetry,
} from "../../src/http/retry";

const retry: RetryConfig = { ...DEFAULT_RETRY };

describe("isRetryableStatus", () => {
  it("treats 429 and 5xx as retryable", () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
  });
  it("treats 4xx (except 429) and 2xx as non-retryable", () => {
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
    expect(isRetryableStatus(200)).toBe(false);
  });
});

describe("shouldRetry", () => {
  it("retries GET on network errors and retryable statuses", () => {
    expect(
      shouldRetry({ method: "GET", attempt: 0, retry, status: null }),
    ).toBe(true);
    expect(shouldRetry({ method: "GET", attempt: 0, retry, status: 500 })).toBe(
      true,
    );
    expect(shouldRetry({ method: "GET", attempt: 0, retry, status: 429 })).toBe(
      true,
    );
  });

  it("does not retry POST by default", () => {
    expect(
      shouldRetry({ method: "POST", attempt: 0, retry, status: 500 }),
    ).toBe(false);
    expect(
      shouldRetry({ method: "POST", attempt: 0, retry, status: null }),
    ).toBe(false);
  });

  it("stops once max retries are reached", () => {
    expect(shouldRetry({ method: "GET", attempt: 2, retry, status: 500 })).toBe(
      false,
    );
  });

  it("does not retry non-retryable statuses", () => {
    expect(shouldRetry({ method: "GET", attempt: 0, retry, status: 404 })).toBe(
      false,
    );
  });
});

describe("backoffDelayMs", () => {
  it("uses full jitter bounded by base * 2^attempt", () => {
    const cfg: RetryConfig = { ...retry, baseDelayMs: 100, maxDelayMs: 10_000 };
    expect(backoffDelayMs(0, cfg, () => 1)).toBe(100);
    expect(backoffDelayMs(1, cfg, () => 1)).toBe(200);
    expect(backoffDelayMs(2, cfg, () => 0)).toBe(0);
  });

  it("clamps to maxDelayMs", () => {
    const cfg: RetryConfig = { ...retry, baseDelayMs: 1000, maxDelayMs: 1500 };
    expect(backoffDelayMs(5, cfg, () => 1)).toBe(1500);
  });
});

describe("retryDelayMs", () => {
  it("honors Retry-After clamped to maxDelayMs", () => {
    const cfg: RetryConfig = { ...retry, maxDelayMs: 5000 };
    expect(retryDelayMs({ attempt: 0, retry: cfg, retryAfterSeconds: 2 })).toBe(
      2000,
    );
    expect(
      retryDelayMs({ attempt: 0, retry: cfg, retryAfterSeconds: 30 }),
    ).toBe(5000);
  });

  it("falls back to backoff when Retry-After is absent", () => {
    const cfg: RetryConfig = { ...retry, baseDelayMs: 100, maxDelayMs: 10_000 };
    expect(
      retryDelayMs({
        attempt: 1,
        retry: cfg,
        retryAfterSeconds: null,
        rng: () => 1,
      }),
    ).toBe(200);
  });

  it("ignores Retry-After when respectRetryAfter is false", () => {
    const cfg: RetryConfig = {
      ...retry,
      respectRetryAfter: false,
      baseDelayMs: 50,
      maxDelayMs: 10_000,
    };
    expect(
      retryDelayMs({
        attempt: 0,
        retry: cfg,
        retryAfterSeconds: 99,
        rng: () => 1,
      }),
    ).toBe(50);
  });
});
