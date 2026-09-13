import { describe, expect, it } from "vitest";
import { SkinpricerClient, TimeoutError } from "../../src";

describe("response body cancellation", () => {
  it("keeps the timeout active after headers arrive", async () => {
    const fetch = async (
      _input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          init?.signal?.addEventListener(
            "abort",
            () => controller.error(init.signal?.reason),
            { once: true },
          );
          controller.enqueue(new TextEncoder().encode('{"data":'));
        },
      });
      return new Response(stream, {
        headers: { "content-type": "application/json" },
      });
    };
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch,
      timeoutMs: 15,
      retry: false,
    });
    await expect(client.items.search()).rejects.toBeInstanceOf(TimeoutError);
  }, 1000);

  it("preserves caller cancellation while reading a response body", async () => {
    const caller = new AbortController();
    const fetch = async (
      _input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          init?.signal?.addEventListener(
            "abort",
            () => controller.error(init.signal?.reason),
            { once: true },
          );
          setTimeout(() => caller.abort(), 10);
        },
      });
      return new Response(stream);
    };
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch,
      retry: false,
    });
    await expect(
      client.items.search({}, { signal: caller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
  }, 1000);
});

describe("response body retry policy", () => {
  it("retries a GET after the body times out", async () => {
    let attempts = 0;
    const fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
      attempts += 1;
      if (attempts > 1) return Response.json({ data: [], pagination: {} });
      return new Response(
        new ReadableStream({
          start(controller) {
            init?.signal?.addEventListener(
              "abort",
              () => controller.error(init.signal?.reason),
              { once: true },
            );
          },
        }),
      );
    };
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch,
      timeoutMs: 15,
      retry: { maxRetries: 1, baseDelayMs: 0, maxDelayMs: 0 },
    });
    await expect(client.items.search()).resolves.toMatchObject({ data: [] });
    expect(attempts).toBe(2);
  });

  it("wraps exhausted body transport failures as NetworkError", async () => {
    let attempts = 0;
    const fetch = async () => {
      attempts += 1;
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.error(new TypeError("connection reset"));
          },
        }),
      );
    };
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch,
      retry: { maxRetries: 1, baseDelayMs: 0, maxDelayMs: 0 },
    });
    await expect(client.items.search()).rejects.toMatchObject({
      name: "NetworkError",
    });
    expect(attempts).toBe(2);
  });

  it("does not retry caller cancellation while reading the body", async () => {
    const caller = new AbortController();
    let attempts = 0;
    const fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
      attempts += 1;
      return new Response(
        new ReadableStream({
          start(controller) {
            init?.signal?.addEventListener(
              "abort",
              () => controller.error(init.signal?.reason),
              { once: true },
            );
            setTimeout(() => caller.abort(), 10);
          },
        }),
      );
    };
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch,
      retry: { maxRetries: 2 },
    });
    await expect(
      client.items.search({}, { signal: caller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(attempts).toBe(1);
  });
});
