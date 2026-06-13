import { describe, expect, it } from "vitest";
import { sleep } from "../../src/utils/sleep";

describe("sleep", () => {
  it("resolves after the delay when not aborted", async () => {
    await expect(sleep(5)).resolves.toBeUndefined();
  });

  it("rejects immediately when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const err = await sleep(1000, controller.signal).catch((e: unknown) => e);
    expect((err as Error).name).toBe("AbortError");
  });

  it("rejects when aborted mid-sleep", async () => {
    const controller = new AbortController();
    const promise = sleep(1000, controller.signal);
    setTimeout(() => controller.abort(), 5);
    const err = await promise.catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).name).toBe("AbortError");
  });

  it("preserves a custom Error abort reason", async () => {
    const controller = new AbortController();
    const reason = new TypeError("custom reason");
    controller.abort(reason);
    const err = await sleep(1000, controller.signal).catch((e: unknown) => e);
    expect(err).toBe(reason);
  });
});
