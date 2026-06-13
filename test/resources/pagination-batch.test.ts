import { describe, expect, it } from "vitest";
import { SkinpricerClient } from "../../src";
import { createMockFetch, type MockResponseInit } from "../helpers/mock-fetch";

function makeClient(responses: MockResponseInit | MockResponseInit[]) {
  const mock = createMockFetch(responses);
  const client = new SkinpricerClient({
    apiKey: "sk_test_x",
    fetch: mock.fetch,
    retry: false,
  });
  return { client, mock };
}

describe("aggregations auto-batching", () => {
  it("minPricesAll chunks >100 ids into batches and merges results", async () => {
    const { client, mock } = makeClient({
      json: {
        items: [{ canonical_item_id: "x", market_hash_name: "n", prices: [] }],
      },
    });
    const ids = Array.from({ length: 250 }, (_, i) => `id${i}`);

    const res = await client.aggregations.minPricesAll(ids);

    expect(mock.calls).toHaveLength(3);
    expect(res.items).toHaveLength(3);
    expect(
      new URL(mock.calls[0]!.url).searchParams.get("ids")!.split(","),
    ).toHaveLength(100);
    expect(
      new URL(mock.calls[2]!.url).searchParams.get("ids")!.split(","),
    ).toHaveLength(50);
  });

  it("minPricesAll makes no request for an empty id list", async () => {
    const { client, mock } = makeClient({ json: { items: [] } });
    const res = await client.aggregations.minPricesAll([]);
    expect(res.items).toEqual([]);
    expect(mock.calls).toHaveLength(0);
  });

  it("maxOrdersAll batches as well", async () => {
    const { client, mock } = makeClient({
      json: {
        items: [{ canonical_item_id: "x", market_hash_name: "n", orders: [] }],
      },
    });
    const res = await client.aggregations.maxOrdersAll(
      Array.from({ length: 101 }, (_, i) => `id${i}`),
    );
    expect(mock.calls).toHaveLength(2);
    expect(res.items).toHaveLength(2);
  });
});

describe("auto-pagination iterators", () => {
  it("items.searchEach walks every page", async () => {
    const { client, mock } = makeClient([
      {
        json: {
          data: [{ canonicalItemId: "a" }, { canonicalItemId: "b" }],
          pagination: { nextPage: 2, currentPage: 1 },
        },
      },
      {
        json: {
          data: [{ canonicalItemId: "c" }],
          pagination: { nextPage: null, currentPage: 2 },
        },
      },
    ]);

    const ids: string[] = [];
    for await (const item of client.items.searchEach({ search: "x" })) {
      ids.push(item.canonicalItemId);
    }

    expect(ids).toEqual(["a", "b", "c"]);
    expect(mock.calls).toHaveLength(2);
    expect(new URL(mock.calls[0]!.url).searchParams.get("page")).toBe("1");
    expect(new URL(mock.calls[1]!.url).searchParams.get("page")).toBe("2");
  });

  it("attributePrices.latestEach follows the cursor", async () => {
    const { client, mock } = makeClient([
      { json: { items: [{ canonicalItemId: "i1" }], nextCursor: "c1" } },
      { json: { items: [{ canonicalItemId: "i2" }], nextCursor: null } },
    ]);

    const ids: string[] = [];
    for await (const item of client.attributePrices.latestEach({ limit: 1 })) {
      ids.push(item.canonicalItemId);
    }

    expect(ids).toEqual(["i1", "i2"]);
    expect(mock.calls).toHaveLength(2);
    expect(new URL(mock.calls[1]!.url).searchParams.get("cursor")).toBe("c1");
  });

  it("buff163.latestEach follows the cursor", async () => {
    const { client, mock } = makeClient([
      { json: { items: [{ canonicalItemId: "i1" }], nextCursor: "c1" } },
      { json: { items: [{ canonicalItemId: "i2" }], nextCursor: null } },
    ]);

    const ids: string[] = [];
    for await (const item of client.buff163.latestEach()) {
      ids.push(item.canonicalItemId);
    }

    expect(ids).toEqual(["i1", "i2"]);
    expect(mock.calls).toHaveLength(2);
  });
});
