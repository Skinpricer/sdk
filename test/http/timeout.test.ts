import { describe, expect, it } from "vitest";
import { withTimeout } from "../../src/http/timeout";

describe("withTimeout", () => {
  it("aborts and flags a timeout after the configured delay", async () => {
    const handle = withTimeout(10);
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(handle.signal.aborted).toBe(true);
    expect(handle.didTimeout()).toBe(true);
    handle.cleanup();
  });

  it("propagates an external abort without flagging a timeout", () => {
    const controller = new AbortController();
    const handle = withTimeout(1000, controller.signal);
    controller.abort();
    expect(handle.signal.aborted).toBe(true);
    expect(handle.didTimeout()).toBe(false);
    handle.cleanup();
  });

  it("is already aborted when the external signal is pre-aborted", () => {
    const controller = new AbortController();
    controller.abort();
    const handle = withTimeout(1000, controller.signal);
    expect(handle.signal.aborted).toBe(true);
    expect(handle.didTimeout()).toBe(false);
    handle.cleanup();
  });

  it("does not abort before the timeout elapses", () => {
    const handle = withTimeout(10_000);
    expect(handle.signal.aborted).toBe(false);
    handle.cleanup();
  });
});
