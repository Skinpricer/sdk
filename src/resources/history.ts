import type { RequestOptions } from "../http/http-client";
import type {
  PriceHistoryBatchParams,
  PriceHistoryBatchResponse,
  PriceHistoryByMarketResponse,
  PriceHistoryParams,
  PriceHistoryResponse,
} from "../types/history";
import { encodePathSegment } from "../utils/url";
import { BaseResource } from "./resource";

function historyQuery(params: PriceHistoryParams) {
  return {
    from: params.from,
    to: params.to,
    markets: params.markets,
    listingType: params.listingType,
    salesWindow: params.salesWindow,
    interval: params.interval,
  };
}

/** Historical price series for an item. */
export class HistoryResource extends BaseResource {
  /** `GET /v1/pricing/:marketHashName/history` — aggregated time series. */
  get(
    marketHashName: string,
    params: PriceHistoryParams = {},
    options?: RequestOptions,
  ): Promise<PriceHistoryResponse> {
    return this.call<PriceHistoryResponse>(
      {
        method: "GET",
        path: `/pricing/${encodePathSegment(marketHashName)}/history`,
        query: historyQuery(params),
      },
      options,
    );
  }

  /** `GET /v1/pricing/:marketHashName/history/markets` — per-market series. */
  byMarket(
    marketHashName: string,
    params: PriceHistoryParams = {},
    options?: RequestOptions,
  ): Promise<PriceHistoryByMarketResponse> {
    return this.call<PriceHistoryByMarketResponse>(
      {
        method: "GET",
        path: `/pricing/${encodePathSegment(marketHashName)}/history/markets`,
        query: historyQuery(params),
      },
      options,
    );
  }
}

/** Game-scoped history, which adds the batch read. */
export class GameHistoryResource extends HistoryResource {
  /**
   * `POST /v2/pricing/history/batch` — the aggregate series of {@link get} for
   * up to 100 items. Entries that do not resolve are listed in `errors` and
   * the rest are still served.
   *
   * Items x buckets may not exceed 10,000 points (twice the buckets for
   * `SALE_HISTORY`), and a batch in 10m buckets takes at most 25 items; the
   * API rejects a larger batch with a 400 error. Each distinct item costs 5
   * rate-limit units.
   */
  batch(
    params: PriceHistoryBatchParams,
    options?: RequestOptions,
  ): Promise<PriceHistoryBatchResponse> {
    return this.call<PriceHistoryBatchResponse>(
      {
        method: "POST",
        path: "/pricing/history/batch",
        body: {
          items: params.items,
          from: params.from,
          to: params.to,
          interval: params.interval,
          listingType: params.listingType,
          salesWindow: params.salesWindow,
          basis: params.basis,
          currency: params.currency,
        },
      },
      options,
    );
  }
}
