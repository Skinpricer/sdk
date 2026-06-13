import type { RequestOptions } from "../http/http-client";
import type {
  CurrentPriceParams,
  CurrentPriceResponse,
  PricingListingsParams,
  PricingListingsResponse,
} from "../types/pricing";
import { encodePathSegment } from "../utils/url";
import { BaseResource } from "./resource";

/** Current cross-market pricing for a single item. */
export class PricingResource extends BaseResource {
  /** `GET /v1/pricing/:marketHashName` — full cross-market pricing snapshot. */
  get(
    marketHashName: string,
    params: CurrentPriceParams = {},
    options?: RequestOptions,
  ): Promise<CurrentPriceResponse> {
    return this.call<CurrentPriceResponse>(
      {
        method: "GET",
        path: `/pricing/${encodePathSegment(marketHashName)}`,
        query: { markets: params.markets },
      },
      options,
    );
  }

  /** `GET /v1/pricing/:marketHashName/listings` — individual listing samples. */
  listings(
    marketHashName: string,
    params: PricingListingsParams = {},
    options?: RequestOptions,
  ): Promise<PricingListingsResponse> {
    return this.call<PricingListingsResponse>(
      {
        method: "GET",
        path: `/pricing/${encodePathSegment(marketHashName)}/listings`,
        query: { limit: params.limit, markets: params.markets },
      },
      options,
    );
  }
}
