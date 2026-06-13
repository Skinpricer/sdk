import { describe, expect, it } from "vitest";
import { centsToUsd, formatUsd } from "../src/utils/money";
import { parseIsoDate } from "../src/utils/dates";
import { encodePathSegment, joinUrl } from "../src/utils/url";

describe("money", () => {
  it("converts cents to USD", () => {
    expect(centsToUsd(1550)).toBe(15.5);
    expect(centsToUsd(0)).toBe(0);
  });

  it("formats cents as currency", () => {
    expect(formatUsd(1550)).toBe("$15.50");
    expect(formatUsd(100000)).toBe("$1,000.00");
  });
});

describe("dates", () => {
  it("parses ISO strings to Date", () => {
    const date = parseIsoDate("2026-04-20T00:00:00.000Z");
    expect(date.getTime()).toBe(Date.parse("2026-04-20T00:00:00.000Z"));
  });
});

describe("url", () => {
  it("encodes path segments", () => {
    expect(encodePathSegment("AK-47 | Redline (Field-Tested)")).toBe(
      "AK-47%20%7C%20Redline%20(Field-Tested)",
    );
  });

  it("joins base url and path", () => {
    expect(joinUrl("https://x.com/v1", "/nbbo")).toBe("https://x.com/v1/nbbo");
    expect(joinUrl("https://x.com/v1", "nbbo")).toBe("https://x.com/v1/nbbo");
  });
});
