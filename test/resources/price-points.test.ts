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
});
