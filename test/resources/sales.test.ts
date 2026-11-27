import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  getMeta,
  NotFoundError,
  ParseError,
  SkinpricerClient,
  type SalesDailyRow,
} from "../../src";
import { createMockFetch, type MockResponseInit } from "../helpers/mock-fetch";

const saleRow: SalesDailyRow = {
  date: "2026-11-26",
  game: "cs2",
  itemName: "AK-47 | Redline (Field-Tested)",
  phase: null,
  paintIndex: null,
  itemId: "cm1",
  market: "csfloat",
  lanes: ["sales"],
  evidence: "sales",
  side: "sell",
  statistic: null,
  resolutions: null,
  points: null,
  count: 3,
  countBasis: "sales",
  completeness: "lower_bound",
  economicBasis: "cash",
  currency: "USD",
  priceMin: "14.10",
  priceMax: "15.00",
  priceMedian: "14.50",
  priceMean: "14.53",
  usdCentsMin: 1410,
  usdCentsMax: 1500,
  usdCentsMedian: 1450,
  usdCentsMean: 1453,
  fxDate: "2026-11-26",
  firstAt: "2026-11-26T01:02:03.000Z",
  lastAt: "2026-11-26T22:10:00.000Z",
};

const pointRow: SalesDailyRow = {
  ...saleRow,
  market: "steamcommunity",
  lanes: ["history"],
  evidence: "points",
  side: null,
  statistic: "median",
  resolutions: ["hour"],
  points: 24,
  count: null,
  countBasis: null,
  priceMedian: null,
  priceMean: null,
  usdCentsMedian: null,
  usdCentsMean: null,
};

const fileHeaders = {
  "content-type": "application/gzip",
  etag: '"abc"',
  "x-sales-final": "false",
  "x-sales-received-through": "2026-11-27T06:09:15.000Z",
  "x-sales-rows": "2",
};

const ndjson = (rows: unknown[]) =>
  rows.map((row) => JSON.stringify(row)).join("\n") + "\n";

function setup(responses: MockResponseInit | MockResponseInit[]) {
  const mock = createMockFetch(responses);
  const client = new SkinpricerClient({
    apiKey: "test-key",
    fetch: mock.fetch,
    retry: false,
  });
  return { client, mock };
}

describe("sales.daily", () => {
  it("downloads, decompresses and parses one day's file", async () => {
    const { client, mock } = setup({
      bytes: gzipSync(ndjson([saleRow, pointRow])),
      headers: fileHeaders,
    });
    const file = await client.sales.daily({ game: "cs2", date: "2026-11-26" });
    expect(mock.calls[0]?.url).toBe(
      "https://pricing.skinpricer.com/v2/sales/daily?game=cs2&date=2026-11-26",
    );
    expect(mock.calls[0]?.headers["if-none-match"]).toBeUndefined();
    expect(file).toEqual({
      etag: '"abc"',
      final: false,
      receivedThrough: "2026-11-27T06:09:15.000Z",
      rows: [saleRow, pointRow],
    });
    expect(file.rows[1]?.count).toBeNull();
    expect(getMeta(file)?.headers.get("x-sales-rows")).toBe("2");
  });

  it("reads a body the fetch has already decompressed", async () => {
    const { client } = setup({
      text: ndjson([saleRow]),
      headers: { ...fileHeaders, "x-sales-final": "true" },
    });
    const file = await client.sales.daily({ game: "rust", date: "2026-11-25" });
    expect(file.final).toBe(true);
    expect(file.rows).toEqual([saleRow]);
  });

  it("returns null when the file is unchanged", async () => {
    const { client, mock } = setup({ status: 304, headers: fileHeaders });
    const file = await client.sales.daily({
      game: "cs2",
      date: "2026-11-26",
      ifNoneMatch: '"abc"',
    });
    expect(file).toBeNull();
    expect(mock.calls[0]?.headers["if-none-match"]).toBe('"abc"');
  });

  it("throws a ParseError for a malformed line", async () => {
    const { client } = setup({
      bytes: gzipSync(`${JSON.stringify(saleRow)}\n{"date":`),
      headers: fileHeaders,
    });
    await expect(
      client.sales.daily({ game: "cs2", date: "2026-11-26" }),
    ).rejects.toBeInstanceOf(ParseError);
  });

  it("maps a missing day to NotFoundError", async () => {
    const { client } = setup({
      status: 404,
      json: { statusCode: 404, message: "No daily sales file." },
    });
    await expect(
      client.sales.daily({ game: "cs2", date: "2026-01-01" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
