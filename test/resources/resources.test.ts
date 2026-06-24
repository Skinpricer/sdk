import { describe, expect, it } from "vitest";
import { SkinpricerClient } from "../../src";
import { getMeta } from "../../src/meta";
import { createMockFetch } from "../helpers/mock-fetch";

const BASE = "https://pricing.skinpricer.com/v1";
const MHN = "AK-47 | Redline (Field-Tested)";
const ENCODED_MHN = encodeURIComponent(MHN);

function setup(json: unknown = {}) {
  const mock = createMockFetch({
    json,
    headers: { "x-ratelimit-remaining": "42" },
  });
  const client = new SkinpricerClient({
    apiKey: "sk_test_abc",
    fetch: mock.fetch,
    retry: false,
  });
  return { client, mock };
}

function lastUrl(mock: ReturnType<typeof setup>["mock"]): URL {
  const call = mock.calls[mock.calls.length - 1];
  if (!call) throw new Error("no request recorded");
  return new URL(call.url);
}

describe("resource routing — all 24 endpoints", () => {
  it("pricing.get", async () => {
    const { client, mock } = setup();
    await client.pricing.get(MHN, { markets: ["csfloat", "buff163"] });
    const url = lastUrl(mock);
    expect(mock.calls[0]?.method).toBe("GET");
    expect(url.pathname).toBe(`/v1/pricing/${ENCODED_MHN}`);
    expect(url.searchParams.get("markets")).toBe("csfloat,buff163");
  });

  it("pricing.listings", async () => {
    const { client, mock } = setup();
    await client.pricing.listings(MHN, { limit: 100 });
    const url = lastUrl(mock);
    expect(url.pathname).toBe(`/v1/pricing/${ENCODED_MHN}/listings`);
    expect(url.searchParams.get("limit")).toBe("100");
  });

  it("history.get", async () => {
    const { client, mock } = setup();
    await client.history.get(MHN, {
      interval: "HOUR_1",
      listingType: "SELL_OFFER",
    });
    const url = lastUrl(mock);
    expect(url.pathname).toBe(`/v1/pricing/${ENCODED_MHN}/history`);
    expect(url.searchParams.get("interval")).toBe("HOUR_1");
    expect(url.searchParams.get("listingType")).toBe("SELL_OFFER");
  });

  it("history.byMarket serializes Date range", async () => {
    const { client, mock } = setup();
    await client.history.byMarket(MHN, {
      from: new Date("2026-04-20T00:00:00.000Z"),
    });
    const url = lastUrl(mock);
    expect(url.pathname).toBe(`/v1/pricing/${ENCODED_MHN}/history/markets`);
    expect(url.searchParams.get("from")).toBe("2026-04-20T00:00:00.000Z");
  });

  it("nbbo.get maps marketHashName to market_hash_name", async () => {
    const { client, mock } = setup();
    await client.nbbo.get({ marketHashName: MHN, markets: ["csfloat"] });
    const url = lastUrl(mock);
    expect(url.pathname).toBe("/v1/nbbo");
    expect(url.searchParams.get("market_hash_name")).toBe(MHN);
    expect(url.searchParams.get("markets")).toBe("csfloat");
  });

  it("nbbo.depth", async () => {
    const { client, mock } = setup();
    await client.nbbo.depth({ id: "clx123", depth: 25 });
    const url = lastUrl(mock);
    expect(url.pathname).toBe("/v1/nbbo/depth");
    expect(url.searchParams.get("id")).toBe("clx123");
    expect(url.searchParams.get("depth")).toBe("25");
  });

  it("aggregations.minPrices", async () => {
    const { client, mock } = setup({ items: [] });
    await client.aggregations.minPrices({ ids: ["a", "b"] });
    const url = lastUrl(mock);
    expect(url.pathname).toBe("/v1/aggregations/min-prices");
    expect(url.searchParams.get("ids")).toBe("a,b");
  });

  it("aggregations.maxOrders", async () => {
    const { client, mock } = setup({ items: [] });
    await client.aggregations.maxOrders({ ids: ["a"], markets: ["buff163"] });
    expect(lastUrl(mock).pathname).toBe("/v1/aggregations/max-orders");
  });

  it("items.search", async () => {
    const { client, mock } = setup({ data: [], pagination: {} });
    await client.items.search({ search: "Redline", page: 2, perPage: 50 });
    const url = lastUrl(mock);
    expect(url.pathname).toBe("/v1/items");
    expect(url.searchParams.get("search")).toBe("Redline");
    expect(url.searchParams.get("page")).toBe("2");
  });

  it("items.all returns an array with meta attached", async () => {
    const { client, mock } = setup([
      { id: "x", name: "X", latestPrices: [], priceAggregates: null },
    ]);
    const all = await client.items.all();
    expect(lastUrl(mock).pathname).toBe("/v1/items/all");
    expect(Array.isArray(all)).toBe(true);
    expect(getMeta(all)?.rateLimit.remaining).toBe(42);
  });

  it("status.freshness and status.marketLatency", async () => {
    const { client, mock } = setup({ markets: [] });
    await client.status.freshness();
    expect(lastUrl(mock).pathname).toBe("/v1/status/freshness");
    await client.status.marketLatency();
    expect(lastUrl(mock).pathname).toBe("/v1/status/market-latency");
  });

  it("arbitrage.opportunities", async () => {
    const { client, mock } = setup({ opportunities: [], totalCandidates: 0 });
    await client.arbitrage.opportunities({
      minSpreadBps: 300,
      sort: "spreadBps",
    });
    const url = lastUrl(mock);
    expect(url.pathname).toBe("/v1/arbitrage/opportunities");
    expect(url.searchParams.get("minSpreadBps")).toBe("300");
    expect(url.searchParams.get("sort")).toBe("spreadBps");
  });

  it("recommendations.get", async () => {
    const { client, mock } = setup();
    await client.recommendations.get(MHN);
    expect(lastUrl(mock).pathname).toBe(`/v1/recommendations/${ENCODED_MHN}`);
  });

  it("marketAnalytics.get", async () => {
    const { client, mock } = setup({ markets: [] });
    await client.marketAnalytics.get(MHN, { windowHours: 48 });
    const url = lastUrl(mock);
    expect(url.pathname).toBe(`/v1/market-analytics/${ENCODED_MHN}`);
    expect(url.searchParams.get("windowHours")).toBe("48");
  });

  it("attributePrices.latest and history", async () => {
    const { client, mock } = setup({ items: [] });
    await client.attributePrices.latest({
      attributes: ["float", "fade"],
      limit: 10,
    });
    const latest = lastUrl(mock);
    expect(latest.pathname).toBe("/v1/attribute-prices/latest");
    expect(latest.searchParams.get("attributes")).toBe("float,fade");

    await client.attributePrices.history({
      canonicalItemId: "clx",
      granularity: "1h",
    });
    expect(lastUrl(mock).pathname).toBe("/v1/attribute-prices/history");
  });

  it("buff163.latest and history", async () => {
    const { client, mock } = setup({ items: [] });
    await client.buff163.latest({ marketHashName: MHN });
    expect(lastUrl(mock).pathname).toBe("/v1/markets/buff163/latest");
    await client.buff163.history({ bucketIds: ["b1", "b2"] });
    const url = lastUrl(mock);
    expect(url.pathname).toBe("/v1/markets/buff163/history");
    expect(url.searchParams.get("bucketIds")).toBe("b1,b2");
  });

  it("uses the configured base url", async () => {
    const { mock } = setup();
    const client = new SkinpricerClient({
      apiKey: "sk_test_abc",
      fetch: mock.fetch,
      baseUrl: "https://pricing.example.com/v1",
      retry: false,
    });
    await client.status.freshness();
    expect(
      mock.calls[0]?.url.startsWith("https://pricing.example.com/v1/"),
    ).toBe(true);
    expect(BASE).toContain("skinpricer");
  });
});

describe("resource routing — liquidity, markets, aggregations by name", () => {
  it("aggregations.minPrices by marketHashNames", async () => {
    const { client, mock } = setup({ items: [] });
    await client.aggregations.minPrices({
      marketHashNames: [MHN, "AWP | Asiimov (Field-Tested)"],
    });
    const url = lastUrl(mock);
    expect(url.pathname).toBe("/v1/aggregations/min-prices");
    expect(url.searchParams.get("marketHashNames")).toBe(
      `${MHN},AWP | Asiimov (Field-Tested)`,
    );
    expect(url.searchParams.get("ids")).toBeNull();
  });

  it("aggregations.maxOrders by marketHashNames", async () => {
    const { client, mock } = setup({ items: [] });
    await client.aggregations.maxOrders({ marketHashNames: [MHN] });
    const url = lastUrl(mock);
    expect(url.pathname).toBe("/v1/aggregations/max-orders");
    expect(url.searchParams.get("marketHashNames")).toBe(MHN);
  });

  it("liquidity.get with askPrice + market", async () => {
    const { client, mock } = setup();
    await client.liquidity.get(MHN, { askPrice: 2500, market: "csfloat" });
    const url = lastUrl(mock);
    expect(url.pathname).toBe(`/v1/liquidity/${ENCODED_MHN}`);
    expect(url.searchParams.get("askPrice")).toBe("2500");
    expect(url.searchParams.get("market")).toBe("csfloat");
  });

  it("liquidity.summary", async () => {
    const { client, mock } = setup();
    await client.liquidity.summary(MHN);
    expect(lastUrl(mock).pathname).toBe(`/v1/liquidity/summary/${ENCODED_MHN}`);
  });

  it("liquidity.batch POSTs a marketHashNames body", async () => {
    const { client, mock } = setup({ results: [], notFound: [], requested: 0 });
    await client.liquidity.batch({ marketHashNames: [MHN], market: "skinport" });
    const call = mock.calls[0];
    expect(call?.method).toBe("POST");
    expect(new URL(call!.url).pathname).toBe("/v1/liquidity/batch");
    expect(JSON.parse(call!.body ?? "{}")).toEqual({
      marketHashNames: [MHN],
      market: "skinport",
    });
  });

  it("liquidity.bulk and manifest", async () => {
    const { client, mock } = setup({ version: "1", items: {} });
    await client.liquidity.bulk();
    expect(lastUrl(mock).pathname).toBe("/v1/liquidity/items");
    await client.liquidity.manifest();
    expect(lastUrl(mock).pathname).toBe("/v1/liquidity/items/manifest");
  });

  it("markets.health routes to the public api host", async () => {
    const { client, mock } = setup([]);
    const rows = await client.markets.health();
    const url = lastUrl(mock);
    expect(url.origin).toBe("https://api.skinpricer.com");
    expect(url.pathname).toBe("/v1/markets/health");
    expect(Array.isArray(rows)).toBe(true);
  });

  it("markets.health derives the public host from a custom pricing base", async () => {
    const { mock } = setup([]);
    const client = new SkinpricerClient({
      apiKey: "sk_test_abc",
      fetch: mock.fetch,
      baseUrl: "https://pricing.example.com/v1",
      retry: false,
    });
    await client.markets.health();
    const url = lastUrl(mock);
    expect(url.origin).toBe("https://api.example.com");
    expect(url.pathname).toBe("/v1/markets/health");
  });
});
