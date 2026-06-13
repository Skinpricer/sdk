import type { RequestOptions } from "../http/http-client";
import type {
  MarketAnalyticsParams,
  MarketAnalyticsResponse,
} from "../types/market-analytics";
import { encodePathSegment } from "../utils/url";
import { BaseResource } from "./resource";

/** Per-market current + historical analytics for an item. */
export class MarketAnalyticsResource extends BaseResource {
  /** `GET /v1/market-analytics/:marketHashName` — per-market analytics rows. */
  get(
    marketHashName: string,
    params: MarketAnalyticsParams = {},
    options?: RequestOptions,
  ): Promise<MarketAnalyticsResponse> {
    return this.call<MarketAnalyticsResponse>(
      {
        method: "GET",
        path: `/market-analytics/${encodePathSegment(marketHashName)}`,
        query: { markets: params.markets, windowHours: params.windowHours },
      },
      options,
    );
  }
}
