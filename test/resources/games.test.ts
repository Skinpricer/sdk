import { describe, expect, it } from "vitest";
import { ConfigurationError, SkinpricerClient } from "../../src";
import { createMockFetch } from "../helpers/mock-fetch";

function setup() {
  const mock = createMockFetch({ json: {} });
  const client = new SkinpricerClient({
    apiKey: "test-key",
    fetch: mock.fetch,
    retry: false,
  });
  return { client, mock };
}

const selectors = {
  cs2: "AK-47 | Redline (Field-Tested)",
  rust: "Tempered AK47",
} as const;

describe.each(["cs2", "rust"] as const)("%s customer resources", (game) => {
  it("routes every supported paid operation with an explicit game", async () => {
    const { client, mock } = setup();
    const scoped = client.forGame(game);
    const name = selectors[game];
    const encoded = encodeURIComponent(name);
    await scoped.items.search({ search: name, page: 2, perPage: 20 });
    await scoped.pricing.get(name, { markets: ["skinport"] });
    await scoped.pricing.listings(name, { limit: 5 });
    await scoped.history.get(name, { interval: "HOUR_1" });
    await scoped.history.byMarket(name, {
      listingType: "SALE_HISTORY",
      salesWindow: "7d",
    });
    await scoped.nbbo.get({ marketHashName: name });
    await scoped.nbbo.depth({ marketHashName: name, depth: 3 });
    await scoped.liquidity.get(name, { market: "skinport", askPrice: 1200 });
    await scoped.liquidity.summary(name);
    await scoped.liquidity.batch({
      marketHashNames: [name],
      market: "skinport",
    });
    await scoped.schema.snapshot();
    await scoped.schema.get(name);
    await scoped.schema.changes({ since: 0, limit: 1 });
    expect(mock.calls.map((call) => new URL(call.url).pathname)).toEqual([
      "/v2/items",
      `/v2/pricing/${encoded}`,
      `/v2/pricing/${encoded}/listings`,
      `/v2/pricing/${encoded}/history`,
      `/v2/pricing/${encoded}/history/markets`,
      "/v2/nbbo",
      "/v2/nbbo/depth",
      `/v2/liquidity/${encoded}`,
      `/v2/liquidity/summary/${encoded}`,
      "/v2/liquidity/batch",
      "/v2/schema",
      `/v2/schema/items/${encoded}`,
      "/v2/schema/changes",
    ]);
    for (const call of mock.calls) {
      const url = new URL(call.url);
      expect(url.origin).toBe("https://pricing.skinpricer.com");
      expect(url.searchParams.get("game")).toBe(game);
      expect(call.headers.authorization).toBe("Bearer test-key");
    }
    expect(mock.calls[9]?.method).toBe("POST");
    expect(JSON.parse(mock.calls[9]!.body!)).toEqual({
      marketHashNames: [name],
      market: "skinport",
    });
    expect(new URL(mock.calls[0]!.url).searchParams.get("page")).toBe("2");
    expect(new URL(mock.calls[7]!.url).searchParams.get("askPrice")).toBe(
      "1200",
    );
  });

  it("exposes public market health without sending the API key", async () => {
    const { client, mock } = setup();
    await client.forGame(game).markets.health();
    expect(mock.calls[0]?.url).toBe(
      `https://api.skinpricer.com/v2/markets/health?game=${game}`,
    );
    expect(mock.calls[0]?.headers.authorization).toBeUndefined();
  });
});

describe("game scope", () => {
  it("does not change existing CS2 calls or another scoped client", async () => {
    const { client, mock } = setup();
    const rust = client.forGame("rust");
    await rust.pricing.get(selectors.rust);
    await client.pricing.get(selectors.cs2);
    await client.forGame("cs2").pricing.get(selectors.cs2);
    await rust.pricing.get(selectors.rust);
    expect(
      mock.calls.map((call) => new URL(call.url).searchParams.get("game")),
    ).toEqual(["rust", null, "cs2", "rust"]);
    expect(new URL(mock.calls[1]!.url).pathname).toContain("/v1/pricing/");
  });

  it("does not expose unavailable operations on game-scoped resources", () => {
    const { client } = setup();
    const rust = client.forGame("rust");
    expect(rust).not.toHaveProperty("aggregations");
    expect(rust).not.toHaveProperty("attributePrices");
    expect(rust.items).not.toHaveProperty("all");
    expect(rust.liquidity).not.toHaveProperty("bulk");
    expect(rust.liquidity).not.toHaveProperty("manifest");
  });

  it("rejects unsupported games before making a request", () => {
    const { client, mock } = setup();
    // @ts-expect-error Unsupported games are also rejected for JavaScript callers.
    expect(() => client.forGame("tf2")).toThrow(ConfigurationError);
    expect(mock.calls).toEqual([]);
  });

  it("preserves a custom gateway path when switching API versions", async () => {
    const { mock } = setup();
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
      baseUrl: "https://gateway.example.com/pricing/v1/",
      publicBaseUrl: "https://gateway.example.com/public/v1/",
    });
    await client.forGame("rust").items.search();
    await client.forGame("rust").markets.health();
    expect(mock.calls.map((call) => call.url)).toEqual([
      "https://gateway.example.com/pricing/v2/items?game=rust",
      "https://gateway.example.com/public/v2/markets/health?game=rust",
    ]);
  });

  it("keeps game and search filters on every pagination request", async () => {
    const mock = createMockFetch([
      {
        json: {
          data: [{ name: "Tempered AK47" }],
          pagination: { nextPage: 2 },
        },
      },
      {
        json: {
          data: [{ name: "Tempered Mask" }],
          pagination: { nextPage: null },
        },
      },
    ]);
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
    });
    const names = [];
    for await (const item of client
      .forGame("rust")
      .items.searchEach({ search: "Tempered" }))
      names.push(item.name);
    expect(names).toEqual(["Tempered AK47", "Tempered Mask"]);
    expect(
      mock.calls.map((call) => new URL(call.url).searchParams.get("page")),
    ).toEqual(["1", "2"]);
    expect(
      mock.calls.every(
        (call) =>
          call.url.includes("game=rust") &&
          call.url.includes("search=Tempered"),
      ),
    ).toBe(true);
  });
});
