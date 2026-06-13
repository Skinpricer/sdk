import { describe, expect, it, vi } from "vitest";
import { resolveConfig, type ClientConfig } from "../../src/config";
import { HttpClient } from "../../src/http/http-client";
import { createMockFetch, type MockResponseInit } from "../helpers/mock-fetch";

function clientFor(
  responses: MockResponseInit | MockResponseInit[],
  overrides: Partial<ClientConfig> = {},
) {
  const mock = createMockFetch(responses);
  const client = new HttpClient(
    resolveConfig({
      apiKey: "sk_test_x",
      fetch: mock.fetch,
      retry: false,
      ...overrides,
    }),
  );
  return { client, mock };
}

describe("hooks", () => {
  it("invokes onRequest and onResponse with context", async () => {
    const onRequest = vi.fn();
    const onResponse = vi.fn();
    const { client } = clientFor(
      { json: {}, headers: { "x-ratelimit-remaining": "10" } },
      { hooks: { onRequest, onResponse } },
    );

    await client.request({ method: "GET", path: "/nbbo" });

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest.mock.calls[0]?.[0]).toMatchObject({
      method: "GET",
      attempt: 0,
    });
    expect(onResponse).toHaveBeenCalledTimes(1);
    expect(onResponse.mock.calls[0]?.[0]).toMatchObject({ status: 200 });
  });

  it("invokes onRetry on a retryable failure", async () => {
    const onRetry = vi.fn();
    const { client } = clientFor(
      [
        { status: 500, json: { statusCode: 500, message: "boom" } },
        { json: { ok: true } },
      ],
      {
        retry: { maxRetries: 2, baseDelayMs: 0, maxDelayMs: 0 },
        hooks: { onRetry },
      },
    );

    await client.request({ method: "GET", path: "/nbbo" });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry.mock.calls[0]?.[0]).toMatchObject({
      status: 500,
      attempt: 0,
    });
  });

  it("swallows hook errors so they never break the request", async () => {
    const { client } = clientFor(
      { json: { ok: true } },
      {
        hooks: {
          onResponse: () => {
            throw new Error("hook blew up");
          },
        },
      },
    );
    await expect(
      client.request({ method: "GET", path: "/nbbo" }),
    ).resolves.toBeDefined();
  });
});

describe("autoThrottle", () => {
  it("delays the next request after remaining hits 0", async () => {
    const { client, mock } = clientFor(
      {
        json: {},
        headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1" },
      },
      { autoThrottle: true },
    );

    await client.request({ method: "GET", path: "/a" });
    const pending = client.request({ method: "GET", path: "/b" });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mock.calls).toHaveLength(1);
    await pending;
    expect(mock.calls).toHaveLength(2);
  });

  it("does not throttle when disabled (default)", async () => {
    const { client, mock } = clientFor({
      json: {},
      headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "5" },
    });
    await client.request({ method: "GET", path: "/a" });
    await client.request({ method: "GET", path: "/b" });
    expect(mock.calls).toHaveLength(2);
  });
});
