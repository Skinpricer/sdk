import { ParseError } from "../errors/network-errors";
import type { RequestOptions } from "../http/http-client";
import type { ResponseMeta } from "../meta";
import type { Game } from "../types/games";
import type {
  SalesDailyFile,
  SalesDailyParams,
  SalesDailyRow,
} from "../types/sales";
import { BaseResource } from "./resource";

async function ndjsonText(
  response: Response,
  signal: AbortSignal,
): Promise<string> {
  const bytes = new Uint8Array(await response.arrayBuffer());
  // A fetch that honours Content-Encoding has already decompressed the body.
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b)
    return new TextDecoder().decode(bytes);
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"), { signal });
  return new Response(stream).text();
}

async function readSalesDailyFile(
  response: Response,
  meta: ResponseMeta,
  signal: AbortSignal,
): Promise<SalesDailyFile> {
  const text = await ndjsonText(response, signal);
  const rows: SalesDailyRow[] = [];
  for (const line of text.split("\n")) {
    if (line.length === 0) continue;
    try {
      rows.push(JSON.parse(line) as SalesDailyRow);
    } catch (cause) {
      throw new ParseError("Failed to parse a daily sales file line.", {
        status: meta.status,
        responseBody: line,
        cause,
        rateLimit: meta.rateLimit,
        requestId: meta.requestId,
      });
    }
  }
  signal.throwIfAborted();
  return {
    etag: meta.headers.get("etag"),
    final: meta.headers.get("x-sales-final") === "true",
    receivedThrough: meta.headers.get("x-sales-received-through"),
    rows,
  };
}

/** Observed sales archive files. */
export class SalesResource extends BaseResource {
  /**
   * `GET /v2/sales/daily`. Pro and Enterprise: every item's observed sales
   * for one closed UTC day, downloaded and decompressed.
   */
  daily(
    params: { game: Game; date: string; ifNoneMatch?: undefined },
    options?: RequestOptions,
  ): Promise<SalesDailyFile>;
  /** A matching conditional ETag returns null. */
  daily(
    params: SalesDailyParams,
    options?: RequestOptions,
  ): Promise<SalesDailyFile | null>;
  daily(
    params: SalesDailyParams,
    options?: RequestOptions,
  ): Promise<SalesDailyFile | null> {
    return this.call<SalesDailyFile | null>(
      {
        method: "GET",
        path: "/sales/daily",
        baseUrl: this.http.versionedBaseUrl("v2"),
        query: { game: params.game, date: params.date },
        ifNoneMatch: params.ifNoneMatch,
      },
      options,
      readSalesDailyFile,
    );
  }
}
