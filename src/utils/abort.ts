/** Returns the signal's reason if it is an `Error`, otherwise a standard `AbortError`. */
export function abortError(signal?: AbortSignal): Error {
  const reason = signal?.reason;
  if (reason instanceof Error) return reason;
  return new DOMException("The operation was aborted.", "AbortError");
}
