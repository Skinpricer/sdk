import { describe, expect, it } from "vitest";
import {
  attachMeta,
  getMeta,
  RESPONSE_META,
  type ResponseMeta,
} from "../src/meta";
import { parseRateLimit } from "../src/http/rate-limit";

const meta: ResponseMeta = {
  status: 200,
  requestId: "req-1",
  rateLimit: parseRateLimit(new Headers({ "x-ratelimit-remaining": "10" })),
  headers: new Headers(),
};

describe("meta", () => {
  it("attaches metadata as a non-enumerable symbol", () => {
    const data = attachMeta({ value: 1 }, meta);
    expect(getMeta(data)).toBe(meta);
    expect(Object.keys(data)).toEqual(["value"]);
    expect(JSON.stringify(data)).toBe('{"value":1}');
    expect(
      Object.getOwnPropertyDescriptor(data, RESPONSE_META)?.enumerable,
    ).toBe(false);
  });

  it("attaches metadata to arrays", () => {
    const data = attachMeta([{ a: 1 }], meta);
    expect(getMeta(data)?.rateLimit.remaining).toBe(10);
    expect(Array.isArray(data)).toBe(true);
  });

  it("is a no-op for non-object values", () => {
    expect(attachMeta(42 as unknown as object, meta)).toBe(42);
    expect(getMeta(42)).toBeUndefined();
    expect(getMeta(null)).toBeUndefined();
    expect(getMeta({})).toBeUndefined();
  });
});
