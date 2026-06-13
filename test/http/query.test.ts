import { describe, expect, it } from "vitest";
import { serializeQuery } from "../../src/http/query";

describe("serializeQuery", () => {
  it("returns an empty string when there is nothing to serialize", () => {
    expect(serializeQuery({})).toBe("");
    expect(serializeQuery({ a: undefined, b: null })).toBe("");
  });

  it("omits undefined and null values", () => {
    expect(serializeQuery({ a: "x", b: undefined, c: null })).toBe("?a=x");
  });

  it("serializes Date values as ISO strings", () => {
    const qs = serializeQuery({ from: new Date("2026-04-20T00:00:00.000Z") });
    expect(qs).toBe("?from=2026-04-20T00%3A00%3A00.000Z");
  });

  it("joins arrays as CSV in a single param", () => {
    expect(serializeQuery({ markets: ["csfloat", "buff163"] })).toBe(
      "?markets=csfloat%2Cbuff163",
    );
  });

  it("omits empty arrays", () => {
    expect(serializeQuery({ markets: [] })).toBe("");
  });

  it("serializes numbers and booleans", () => {
    expect(serializeQuery({ limit: 50, tradableOnly: true })).toBe(
      "?limit=50&tradableOnly=true",
    );
  });

  it("encodes special characters in keys and values", () => {
    expect(serializeQuery({ q: "AK-47 | Redline" })).toBe(
      "?q=AK-47+%7C+Redline",
    );
  });
});
