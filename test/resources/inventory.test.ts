import { describe, expect, it } from "vitest";
import { FeatureNotAvailableError, SkinpricerClient } from "../../src";
import { createMockFetch } from "../helpers/mock-fetch";

const owner = "76561198000000000";

describe("inventory resources", () => {
  it("sends basic and advanced fetch options without changing caller input", async () => {
    const mock = createMockFetch({
      json: { id: "snapshot", status: "COMPLETED", items: [] },
    });
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
    });
    const body = Object.freeze({
      targetSteamId: owner,
      appId: 730,
      contextId: 2,
      tradableOnly: false,
    });
    await client.inventory.fetch(body);
    await client.inventory.fetchAdvanced({ ...body, maxInspections: 5 });
    expect(mock.calls.map((call) => new URL(call.url).pathname)).toEqual([
      "/v1/inventory/fetch",
      "/v1/inventory/fetch/advanced",
    ]);
    expect(mock.calls.every((call) => call.method === "POST")).toBe(true);
    expect(JSON.parse(mock.calls[0]!.body!)).toEqual(body);
    expect(JSON.parse(mock.calls[1]!.body!).maxInspections).toBe(5);
  });

  it("reads existing snapshots, status and history with encoded selectors", async () => {
    const mock = createMockFetch({ json: {} });
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
    });
    await client.inventory.get("snapshot/id");
    await client.inventory.status("snapshot/id");
    await client.inventory.history(owner, { limit: 5, offset: 10 });
    expect(mock.calls.map((call) => new URL(call.url).pathname)).toEqual([
      "/v1/inventory/snapshot/snapshot%2Fid",
      "/v1/inventory/snapshot/snapshot%2Fid/status",
      `/v1/inventory/history/${owner}`,
    ]);
    expect(new URL(mock.calls[2]!.url).searchParams.get("offset")).toBe("10");
    expect(mock.calls.every((call) => call.method === "GET")).toBe(true);
  });

  it.each(["fetch", "fetchAdvanced"] as const)(
    "does not retry %s dispatch, even with client-wide POST retries",
    async (method) => {
      const mock = createMockFetch({
        status: 503,
        json: { message: "Temporarily unavailable" },
      });
      const client = new SkinpricerClient({
        apiKey: "test-key",
        fetch: mock.fetch,
        retry: {
          maxRetries: 3,
          retryOnMethods: ["GET", "POST"],
          baseDelayMs: 0,
        },
      });
      await expect(
        client.inventory[method]({ targetSteamId: owner }),
      ).rejects.toMatchObject({ status: 503 });
      expect(mock.calls).toHaveLength(1);
    },
  );

  it("preserves plan denial as a typed error", async () => {
    const mock = createMockFetch({
      status: 403,
      json: {
        success: false,
        error: {
          code: "FEATURE_NOT_AVAILABLE",
          message: "Your plan does not include this feature",
        },
      },
    });
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
    });
    await expect(
      client.inventory.fetchAdvanced({ targetSteamId: owner }),
    ).rejects.toBeInstanceOf(FeatureNotAvailableError);
    expect(mock.calls).toHaveLength(1);
  });

  it("leaves inventory dispatch absent from game-scoped clients", () => {
    const mock = createMockFetch({ json: {} });
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
    });
    expect(client.forGame("rust")).not.toHaveProperty("inventory");
  });
});
