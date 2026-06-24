import type { RequestOptions } from "../http/http-client";
import type {
  LiquidityBatchBody,
  LiquidityBatchResponse,
  LiquidityBulkManifest,
  LiquidityBulkResponse,
  LiquidityParams,
  LiquidityResponse,
  LiquiditySummaryResponse,
} from "../types/liquidity";
import { encodePathSegment } from "../utils/url";
import { BaseResource } from "./resource";

/**
 * Liquidity & expected time-to-sell, from cross-market order-book depth and
 * sales velocity. The single + summary + batch endpoints are Pro; the bulk map
 * + manifest are Enterprise.
 */
export class LiquidityResource extends BaseResource {
  /** `GET /v1/liquidity/:marketHashName` — full liquidity model for one item. */
  get(
    marketHashName: string,
    params: LiquidityParams = {},
    options?: RequestOptions,
  ): Promise<LiquidityResponse> {
    return this.call<LiquidityResponse>(
      {
        method: "GET",
        path: `/liquidity/${encodePathSegment(marketHashName)}`,
        query: { askPrice: params.askPrice, market: params.market },
      },
      options,
    );
  }

  /** `GET /v1/liquidity/summary/:marketHashName` — slim badge-only projection. */
  summary(
    marketHashName: string,
    params: LiquidityParams = {},
    options?: RequestOptions,
  ): Promise<LiquiditySummaryResponse> {
    return this.call<LiquiditySummaryResponse>(
      {
        method: "GET",
        path: `/liquidity/summary/${encodePathSegment(marketHashName)}`,
        query: { askPrice: params.askPrice, market: params.market },
      },
      options,
    );
  }

  /** `POST /v1/liquidity/batch` — score up to 100 items in one call. */
  batch(
    body: LiquidityBatchBody,
    options?: RequestOptions,
  ): Promise<LiquidityBatchResponse> {
    return this.call<LiquidityBatchResponse>(
      {
        method: "POST",
        path: "/liquidity/batch",
        body: { marketHashNames: body.marketHashNames, market: body.market },
      },
      options,
    );
  }

  /**
   * `GET /v1/liquidity/items` — Enterprise: the whole-catalog liquidity map,
   * rematerialized every ~10 minutes. Poll {@link manifest} and compare
   * `version` before refetching this heavier payload.
   */
  bulk(options?: RequestOptions): Promise<LiquidityBulkResponse> {
    return this.call<LiquidityBulkResponse>(
      { method: "GET", path: "/liquidity/items" },
      options,
    );
  }

  /**
   * `GET /v1/liquidity/items/manifest` — Enterprise: a cheap change-probe for
   * the {@link bulk} map (`version`, `calculatedAt`, `cadence`, `markets`,
   * `itemCount`). Refetch the bulk map only when `version` changes.
   */
  manifest(options?: RequestOptions): Promise<LiquidityBulkManifest> {
    return this.call<LiquidityBulkManifest>(
      { method: "GET", path: "/liquidity/items/manifest" },
      options,
    );
  }
}
