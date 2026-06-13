import { abortError } from "./abort";

/** Resolves after `ms`, or rejects with the signal reason if aborted. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError(signal));
      return;
    }

    function cleanup(): void {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }

    function onAbort(): void {
      cleanup();
      reject(abortError(signal));
    }

    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
