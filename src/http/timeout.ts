import { abortError } from "../utils/abort";

export interface TimeoutHandle {
  signal: AbortSignal;
  cleanup: () => void;
  didTimeout: () => boolean;
}

export function withTimeout(
  timeoutMs: number,
  external?: AbortSignal,
): TimeoutHandle {
  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function onExternalAbort(): void {
    controller.abort(external ? abortError(external) : undefined);
  }

  if (external) {
    if (external.aborted) {
      controller.abort(abortError(external));
    } else {
      external.addEventListener("abort", onExternalAbort, { once: true });
    }
  }

  if (timeoutMs > 0 && !controller.signal.aborted) {
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort(
        new DOMException(
          `Request timed out after ${timeoutMs}ms`,
          "TimeoutError",
        ),
      );
    }, timeoutMs);
  }

  return {
    signal: controller.signal,
    cleanup() {
      if (timer !== undefined) clearTimeout(timer);
      external?.removeEventListener("abort", onExternalAbort);
    },
    didTimeout() {
      return timedOut;
    },
  };
}
