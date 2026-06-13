import type { RequestOptions } from "../http/http-client";
import type {
  RecommendationParams,
  RecommendationResponse,
} from "../types/recommendations";
import { encodePathSegment } from "../utils/url";
import { BaseResource } from "./resource";

/** Suggested executable price and liquidity signals for an item. */
export class RecommendationsResource extends BaseResource {
  /** `GET /v1/recommendations/:marketHashName` — suggested price + confidence. */
  get(
    marketHashName: string,
    params: RecommendationParams = {},
    options?: RequestOptions,
  ): Promise<RecommendationResponse> {
    return this.call<RecommendationResponse>(
      {
        method: "GET",
        path: `/recommendations/${encodePathSegment(marketHashName)}`,
        query: { markets: params.markets },
      },
      options,
    );
  }
}
