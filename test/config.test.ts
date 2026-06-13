import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  resolveConfig,
} from "../src/config";
import { ConfigurationError } from "../src/errors/network-errors";

const noopFetch = (async () => new Response("{}")) as unknown as typeof fetch;

describe("resolveConfig", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws ConfigurationError when apiKey is missing or empty", () => {
    expect(() => resolveConfig({ apiKey: "" })).toThrow(ConfigurationError);
    expect(() => resolveConfig({ apiKey: "   " })).toThrow(ConfigurationError);
  });

  it("applies sensible defaults", () => {
    const resolved = resolveConfig({ apiKey: "sk_test_x", fetch: noopFetch });
    expect(resolved.baseUrl).toBe(DEFAULT_BASE_URL);
    expect(resolved.timeoutMs).toBe(DEFAULT_TIMEOUT_MS);
    expect(resolved.authScheme).toBe("Bearer");
    expect(resolved.retry).not.toBeNull();
    expect(resolved.userAgent).toMatch(/^skinpricer-sdk\//);
  });

  it("strips trailing slashes from baseUrl", () => {
    const resolved = resolveConfig({
      apiKey: "k",
      baseUrl: "https://example.com/v1///",
      fetch: noopFetch,
    });
    expect(resolved.baseUrl).toBe("https://example.com/v1");
  });

  it("rejects a non-http(s) baseUrl", () => {
    expect(() =>
      resolveConfig({
        apiKey: "k",
        baseUrl: "file:///etc/passwd",
        fetch: noopFetch,
      }),
    ).toThrow(ConfigurationError);
  });

  it("rejects an invalid baseUrl", () => {
    expect(() =>
      resolveConfig({ apiKey: "k", baseUrl: "not a url", fetch: noopFetch }),
    ).toThrow(ConfigurationError);
  });

  it("disables retries when retry is false", () => {
    const resolved = resolveConfig({
      apiKey: "k",
      retry: false,
      fetch: noopFetch,
    });
    expect(resolved.retry).toBeNull();
  });

  it("merges a partial retry config over the defaults", () => {
    const resolved = resolveConfig({
      apiKey: "k",
      retry: { maxRetries: 5 },
      fetch: noopFetch,
    });
    expect(resolved.retry?.maxRetries).toBe(5);
    expect(resolved.retry?.baseDelayMs).toBe(250);
  });

  it("throws when no fetch is available", () => {
    vi.stubGlobal("fetch", undefined);
    expect(() => resolveConfig({ apiKey: "k" })).toThrow(ConfigurationError);
  });
});
