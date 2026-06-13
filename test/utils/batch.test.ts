import { describe, expect, it } from "vitest";
import { chunk, mapWithConcurrency } from "../../src/utils/batch";

describe("chunk", () => {
  it("splits into chunks of the given size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it("returns an empty array for empty input", () => {
    expect(chunk([], 3)).toEqual([]);
  });
  it("throws for size <= 0", () => {
    expect(() => chunk([1], 0)).toThrow(RangeError);
  });
});

describe("mapWithConcurrency", () => {
  it("preserves input order", async () => {
    const result = await mapWithConcurrency(
      [1, 2, 3, 4],
      2,
      async (n) => n * 2,
    );
    expect(result).toEqual([2, 4, 6, 8]);
  });

  it("never exceeds the concurrency limit", async () => {
    let active = 0;
    let max = 0;
    await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async () => {
      active += 1;
      max = Math.max(max, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
    });
    expect(max).toBeLessThanOrEqual(2);
  });

  it("handles empty input", async () => {
    expect(await mapWithConcurrency([], 3, async () => 1)).toEqual([]);
  });

  it("rejects for limit <= 0", async () => {
    await expect(
      mapWithConcurrency([1], 0, async () => 1),
    ).rejects.toBeInstanceOf(RangeError);
  });
});
