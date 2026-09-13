import { describe, expect, it } from "vitest";
import { getMeta, SkinpricerClient } from "../../src";
import { createMockFetch } from "../helpers/mock-fetch";

describe("schema", () => {
  it("routes snapshot, lookup and delta operations for the existing CS2 client", async () => {
    const mock = createMockFetch({ json: {} });
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
    });
    await client.schema.snapshot();
    await client.schema.get("AK-47 | Redline (Field-Tested)");
    await client.schema.changes({
      since: new Date("2026-09-01T00:00:00Z"),
      cursor: "next",
      limit: 5,
    });
    expect(mock.calls.map((call) => new URL(call.url).pathname)).toEqual([
      "/v1/schema",
      "/v1/schema/items/AK-47%20%7C%20Redline%20(Field-Tested)",
      "/v1/schema/changes",
    ]);
    expect(new URL(mock.calls[2]!.url).searchParams.get("since")).toBe(
      "2026-09-01T00:00:00.000Z",
    );
    expect(new URL(mock.calls[2]!.url).searchParams.get("cursor")).toBe("next");
  });

  it("retains response metadata and supports an unchanged conditional snapshot", async () => {
    const mock = createMockFetch([
      { json: { schemaVersion: 100, items: {} }, headers: { etag: '"100"' } },
      { status: 304, headers: { etag: '"100"' } },
    ]);
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
    });
    const snapshot = await client.forGame("rust").schema.snapshot();
    expect(getMeta(snapshot)?.headers.get("etag")).toBe('"100"');
    const unchanged = await client
      .forGame("rust")
      .schema.snapshot({ ifNoneMatch: '"100"' });
    expect(unchanged).toBeNull();
    expect(mock.calls[1]?.headers["if-none-match"]).toBe('"100"');
  });

  it("keeps the original since value and game while following delta cursors", async () => {
    const mock = createMockFetch([
      {
        json: {
          schemaVersion: 100,
          items: [{ id: "a" }],
          nextCursor: "page-two",
          hasMore: true,
        },
      },
      {
        json: {
          schemaVersion: 100,
          items: [{ id: "b" }],
          nextCursor: null,
          hasMore: false,
        },
      },
    ]);
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
    });
    const ids = [];
    for await (const item of client
      .forGame("rust")
      .schema.changesEach({ since: 25 }))
      ids.push(item.id);
    expect(ids).toEqual(["a", "b"]);
    expect(new URL(mock.calls[1]!.url).searchParams.get("since")).toBe("25");
    expect(new URL(mock.calls[1]!.url).searchParams.get("cursor")).toBe(
      "page-two",
    );
    expect(new URL(mock.calls[1]!.url).searchParams.get("game")).toBe("rust");
  });

  it("stops when a delta cursor does not advance", async () => {
    const mock = createMockFetch({
      json: { items: [], nextCursor: "same", hasMore: true },
    });
    const client = new SkinpricerClient({
      apiKey: "test-key",
      fetch: mock.fetch,
    });
    for await (const item of client.schema.changesEach({
      since: 0,
      cursor: "same",
    }))
      void item;
    expect(mock.calls).toHaveLength(1);
  });
});
