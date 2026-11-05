import { describe, expect, it, vi } from "vitest";
import { getMeta, ServerError, SkinpricerClient } from "../../src";
import { createMockFetch, type MockResponseInit } from "../helpers/mock-fetch";

const snapshot = {
  generatedAt: "2026-09-28T12:00:00.000Z",
  game: "cs2",
  currency: "USD",
  items: [
    {
      name: "AK-47 | Redline (Field-Tested)",
      canonicalItemId: "cm1",
      bestAsk: {
        market: "buff163",
        price: 1450,
        updatedAt: "2026-09-28T11:59:00.000Z",
        isStale: false,
      },
      bestBid: null,
      markets: [
        {
          market: "csfloat",
          price: 1500,
          fetchedAt: "2026-09-28T11:57:40.112Z",
          isStale: false,
          quoteSize: 3,
          sourceUpdatedAt: "2026-09-28T11:31:09.000Z",
        },
      ],
      buyOrders: [],
    },
  ],
  itemCount: 1,
};

function setup(responses: MockResponseInit | MockResponseInit[]) {
  const mock = createMockFetch(responses);
  const client = new SkinpricerClient({
    apiKey: "test-key",
    fetch: mock.fetch,
    retry: false,
  });
  return { client, mock };
}

describe("prices.latestAll", () => {
  it("requests the selected game's snapshot from the v2 API", async () => {
    const { client, mock } = setup({
      json: snapshot,
      headers: { etag: 'W/"abc"' },
    });
    const result = await client.prices.latestAll({ game: "rust" });
    expect(mock.calls[0]?.url).toBe(
      "https://pricing.skinpricer.com/v2/prices/latest?game=rust",
    );
    expect(mock.calls[0]?.headers.authorization).toBe("Bearer test-key");
    expect(mock.calls[0]?.headers["accept-encoding"]).toBeUndefined();
    expect(result).toEqual(snapshot);
    expect(getMeta(result)?.headers.get("etag")).toBe('W/"abc"');
  });

  it("returns null when the snapshot is unchanged", async () => {
    const { client, mock } = setup({ status: 304 });
    const result = await client.prices.latestAll({
      game: "cs2",
      ifNoneMatch: 'W/"abc"',
    });
    expect(result).toBeNull();
    expect(mock.calls[0]?.headers["if-none-match"]).toBe('W/"abc"');
  });

  it("retries a 503 after its Retry-After, within the retry delay cap", async () => {
    const onRetry = vi.fn();
    const mock = createMockFetch([
      {
        status: 503,
        json: { statusCode: 503, message: "No price snapshot yet." },
        headers: { "retry-after": "60" },
      },
      { json: snapshot },
    ]);
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
      retry: { maxRetries: 1, baseDelayMs: 0, maxDelayMs: 5 },
      hooks: { onRetry },
    });
    await expect(client.prices.latestAll({ game: "cs2" })).resolves.toEqual(
      snapshot,
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry.mock.calls[0]?.[0]).toMatchObject({
      status: 503,
      delayMs: 5,
    });
    expect(mock.calls).toHaveLength(2);
  });

  it("reports Retry-After on the final 503", async () => {
    const { client } = setup({
      status: 503,
      json: { statusCode: 503, message: "No price snapshot yet." },
      headers: { "retry-after": "60" },
    });
    const error = await client.prices
      .latestAll({ game: "cs2" })
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ServerError);
    expect((error as ServerError).rateLimit?.retryAfterSeconds).toBe(60);
  });
});
