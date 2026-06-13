import type { RequestOptions } from "../http/http-client";
import type {
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
