import type { RequestOptions } from "../http/http-client";
import type {
  AttributePriceItem,
  Buff163AttributeHistoryResponse,
  Buff163AttributeLatestResponse,
  Buff163HistoryParams,
  Buff163LatestParams,
} from "../types/attribute-prices";
import { BaseResource } from "./resource";

/** Buff163-specific attribute bucket prices. */
export class Buff163Resource extends BaseResource {
  /** GET /v1/markets/buff163/latest — latest Buff163 attribute buckets. */
  latest(
    params: Buff163LatestParams = {},
    options?: RequestOptions,
  ): Promise<Buff163AttributeLatestResponse> {
    return this.call<Buff163AttributeLatestResponse>(
      {
        method: "GET",
        path: "/markets/buff163/latest",
        query: {
          canonicalItemId: params.canonicalItemId,
          marketHashName: params.marketHashName,
          attributes: params.attributes,
          limit: params.limit,
          cursor: params.cursor,
        },
      },
      options,
    );
  }

  /** GET /v1/markets/buff163/history — OHLC Buff163 attribute bucket history. */
  history(
    params: Buff163HistoryParams = {},
    options?: RequestOptions,
  ): Promise<Buff163AttributeHistoryResponse> {
    return this.call<Buff163AttributeHistoryResponse>(
      {
        method: "GET",
        path: "/markets/buff163/history",
        query: {
          canonicalItemId: params.canonicalItemId,
          marketHashName: params.marketHashName,
          bucketId: params.bucketId,
          bucketIds: params.bucketIds,
          attributes: params.attributes,
          from: params.from,
          to: params.to,
          granularity: params.granularity,
          limit: params.limit,
        },
      },
      options,
    );
  }

  /** Async iterator over every latest Buff163 attribute item, following `nextCursor`. */
  async *latestEach(
    params: Buff163LatestParams = {},
    options?: RequestOptions,
  ): AsyncGenerator<AttributePriceItem> {
    let cursor = params.cursor;
    for (;;) {
      const res = await this.latest({ ...params, cursor }, options);
      for (const item of res.items) {
        yield item;
      }
      const next = res.nextCursor;
      if (next === null || next === cursor) return;
      cursor = next;
    }
  }
}
