import { describe, expect, it } from "vitest";
import { HttpClient } from "../../src/http/http-client";
import { resolveConfig } from "../../src/config";
import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from "../../src/errors/http-errors";
import { NetworkError, TimeoutError } from "../../src/errors/network-errors";
import { createMockFetch, type MockResponseInit } from "../helpers/mock-fetch";

function clientFor(
  responses: MockResponseInit | MockResponseInit[],
  overrides = {},
) {
  const mock = createMockFetch(responses);
  const config = resolveConfig({
    apiKey: "sk_test_abc",
    fetch: mock.fetch,
    retry: false,
    ...overrides,
  });
  return { client: new HttpClient(config), mock };
}

const fastRetry = { retry: { maxRetries: 2, baseDelayMs: 0, maxDelayMs: 0 } };

describe("HttpClient.request", () => {
  it("returns parsed data with response meta attached", async () => {
    const { client } = clientFor({
      json: { canonicalItemId: "abc" },
      headers: { "x-ratelimit-remaining": "59" },
    });
    const result = await client.request<{ canonicalItemId: string }>({
      method: "GET",
      path: "/pricing/x",
    });
    expect(result.data.canonicalItemId).toBe("abc");
    expect(result.meta.rateLimit.remaining).toBe(59);
  });

  it("injects the Authorization header", async () => {
    const { client, mock } = clientFor({ json: {} });
    await client.request({ method: "GET", path: "/nbbo" });
    expect(mock.calls[0]?.headers["authorization"]).toBe("Bearer sk_test_abc");
  });

  it("throws AuthenticationError on 401", async () => {
    const { client } = clientFor({
      status: 401,
      json: { statusCode: 401, message: "bad key" },
    });
    await expect(
      client.request({ method: "GET", path: "/nbbo" }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("throws NotFoundError on 404", async () => {
    const { client } = clientFor({
      status: 404,
      json: { statusCode: 404, message: "nope" },
    });
    await expect(
      client.request({ method: "GET", path: "/nbbo" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws RateLimitError on 429 with retry disabled", async () => {
    const { client } = clientFor({
      status: 429,
      json: { statusCode: 429, message: "slow down" },
      headers: { "retry-after": "12" },
    });
    const err = await client
      .request({ method: "GET", path: "/nbbo" })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfterSeconds).toBe(12);
  });

  it("retries GET on 500 then succeeds", async () => {
    const { client, mock } = clientFor(
      [
        { status: 500, json: { statusCode: 500, message: "boom" } },
        { status: 200, json: { ok: true } },
      ],
      fastRetry,
    );
    const result = await client.request<{ ok: boolean }>({
      method: "GET",
      path: "/nbbo",
    });
    expect(result.data.ok).toBe(true);
    expect(mock.calls).toHaveLength(2);
  });

  it("does not retry POST by default", async () => {
    const { client, mock } = clientFor(
      [
        { status: 500, json: { statusCode: 500, message: "boom" } },
        { status: 200, json: { ok: true } },
      ],
      fastRetry,
    );
    await expect(
      client.request({
        method: "POST",
        path: "/some-write-endpoint",
        body: {},
      }),
    ).rejects.toBeInstanceOf(ServerError);
    expect(mock.calls).toHaveLength(1);
  });

  it("retries network failures then succeeds", async () => {
    const { client, mock } = clientFor(
      [
        { throw: new TypeError("network down") },
        { status: 200, json: { ok: true } },
      ],
      fastRetry,
    );
    const result = await client.request<{ ok: boolean }>({
      method: "GET",
      path: "/nbbo",
    });
    expect(result.data.ok).toBe(true);
    expect(mock.calls).toHaveLength(2);
  });

  it("wraps an exhausted network failure in NetworkError", async () => {
    const { client } = clientFor(
      { throw: new TypeError("network down") },
      { retry: false },
    );
    await expect(
      client.request({ method: "GET", path: "/nbbo" }),
    ).rejects.toBeInstanceOf(NetworkError);
  });

  it("throws TimeoutError when the request exceeds the timeout", async () => {
    const { client } = clientFor(
      { delayMs: 1000, json: {} },
      { timeoutMs: 15, retry: false },
    );
    await expect(
      client.request({ method: "GET", path: "/nbbo" }),
    ).rejects.toBeInstanceOf(TimeoutError);
  });

  it("re-throws caller cancellation unchanged", async () => {
    const { client } = clientFor({ delayMs: 1000, json: {} }, { retry: false });
    const controller = new AbortController();
    controller.abort();
    const err = await client
      .request({ method: "GET", path: "/nbbo" }, { signal: controller.signal })
      .catch((e: unknown) => e);
    expect((err as Error).name).toBe("AbortError");
    expect(err).not.toBeInstanceOf(TimeoutError);
  });
});
