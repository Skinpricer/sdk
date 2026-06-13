import type { RequestOptions } from "../http/http-client";
import type {
  AttributeHistoryParams,
  AttributeHistoryResponse,
  AttributeLatestParams,
  AttributeLatestResponse,
  AttributePriceItem,
} from "../types/attribute-prices";
import { BaseResource } from "./resource";

/** Cross-market attribute (float/fade/tag) bucket prices. */
export class AttributePricesResource extends BaseResource {
  /** GET /v1/attribute-prices/latest — latest attribute buckets across markets. */
  latest(
    params: AttributeLatestParams = {},
    options?: RequestOptions,
  ): Promise<AttributeLatestResponse> {
    return this.call<AttributeLatestResponse>(
      {
        method: "GET",
        path: "/attribute-prices/latest",
        query: {
          canonicalItemId: params.canonicalItemId,
          marketHashName: params.marketHashName,
          attributes: params.attributes,
          limit: params.limit,
          cursor: params.cursor,
          markets: params.markets,
        },
      },
      options,
    );
  }

  /** GET /v1/attribute-prices/history — OHLC attribute bucket history. */
  history(
    params: AttributeHistoryParams = {},
    options?: RequestOptions,
  ): Promise<AttributeHistoryResponse> {
    return this.call<AttributeHistoryResponse>(
      {
        method: "GET",
        path: "/attribute-prices/history",
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
          markets: params.markets,
        },
      },
      options,
    );
  }

  /** Async iterator over every latest attribute item, following `nextCursor`. */
  async *latestEach(
    params: AttributeLatestParams = {},
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
