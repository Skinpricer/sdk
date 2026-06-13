import { vi } from "vitest";
import type { FetchLike } from "../../src/http/types";

export interface MockResponseInit {
  status?: number;
  json?: unknown;
  text?: string;
  headers?: Record<string, string>;
  throw?: unknown;
  delayMs?: number;
}

export interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | undefined;
}

export interface MockFetchResult {
  fetch: FetchLike;
  calls: CapturedRequest[];
}

function headersToObject(init?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!init) return out;
  new Headers(init).forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function toResponse(init: MockResponseInit): Response {
  const status = init.status ?? 200;
  const headers = new Headers(init.headers ?? {});
  let body: string | null = null;
  if (init.text !== undefined) {
    body = init.text;
  } else if (init.json !== undefined) {
    body = JSON.stringify(init.json);
    if (!headers.has("content-type"))
      headers.set("content-type", "application/json");
  }
  return new Response(body, { status, headers });
}

function waitWithAbort(ms: number, signal?: AbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export function createMockFetch(
  responses: MockResponseInit | MockResponseInit[],
): MockFetchResult {
  const queue = Array.isArray(responses) ? [...responses] : [responses];
  if (queue.length === 0) {
    throw new Error("createMockFetch requires at least one response");
  }
  const calls: CapturedRequest[] = [];

  const fetchImpl = async (
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const body = typeof init?.body === "string" ? init.body : undefined;
    calls.push({
      url,
      method: init?.method ?? "GET",
      headers: headersToObject(init?.headers),
      body,
    });

    const next =
      queue.length > 1
        ? (queue.shift() as MockResponseInit)
        : (queue[0] as MockResponseInit);
    const signal = init?.signal ?? undefined;

    if (signal?.aborted) {
      throw signal.reason ?? new DOMException("Aborted", "AbortError");
    }
    if (next.delayMs) {
      await waitWithAbort(next.delayMs, signal);
    }
    if (next.throw !== undefined) {
      throw next.throw;
    }
    return toResponse(next);
  };

  return { fetch: vi.fn(fetchImpl) as unknown as FetchLike, calls };
}
