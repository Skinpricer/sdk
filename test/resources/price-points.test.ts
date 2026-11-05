import { describe, expect, it } from "vitest";
import { SkinpricerClient } from "../../src";
import { createMockFetch } from "../helpers/mock-fetch";

function setup(json: unknown) {
  const mock = createMockFetch({ json });
  const client = new SkinpricerClient({
    apiKey: "test-key",
    fetch: mock.fetch,
    retry: false,
  });
  return { client, mock };
}

describe("market price points", () => {
  it("keeps a null bid size distinct from a reported zero", async () => {
    const buyOrders = [
      {
        market: "rustskins",
        price: 84511,
        currency: "USD",
        fetchedAt: "2026-10-05T12:00:00.000Z",
        quoteSize: null,
        totalQuantity: null,
      },
      {
        market: "rusttm",
        price: 82000,
        currency: "USD",
        fetchedAt: "2026-10-05T12:00:00.000Z",
        quoteSize: 0,
        totalQuantity: 0,
      },
    ];
    const { client } = setup({
      canonicalItemId: "rust-big-grin",
      name: "Big Grin",
      markets: [],
      buyOrders,
      calculatedAt: "2026-10-05T12:01:00.000Z",
    });
    const result = await client.forGame("rust").pricing.get("Big Grin");
    expect(result.buyOrders).toEqual(buyOrders);
    expect(result.buyOrders?.[0]?.quoteSize).toBeNull();
    expect(result.buyOrders?.[1]?.quoteSize).toBe(0);
  });

  it("returns source times beside the fetch time", async () => {
    const markets = [
      {
        market: "csfloat",
        price: 1500,
        currency: "USD",
        fetchedAt: "2026-09-28T11:57:40.112Z",
        sourceUpdatedAt: "2026-09-28T11:31:09.000Z",
        sourceTimeKind: "last_modified",
        sourceAgeSeconds: 1591,
        isSourceStale: false,
      },
      {
        market: "buff163",
        price: 1450,
        currency: "USD",
        fetchedAt: "2026-09-28T11:58:00.000Z",
      },
    ];
    const { client } = setup({
      canonicalItemId: "cm1",
      name: "AK-47 | Redline (Field-Tested)",
      markets,
      calculatedAt: "2026-09-28T12:00:00.000Z",
    });
    const result = await client.pricing.get("AK-47 | Redline (Field-Tested)");
    expect(result.markets).toEqual(markets);
    expect(result.markets[1]?.sourceAgeSeconds).toBeUndefined();
  });
});
