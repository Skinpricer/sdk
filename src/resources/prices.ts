import type { RequestOptions } from "../http/http-client";
import type { Game } from "../types/games";
import type { LatestPricesParams, LatestPricesResponse } from "../types/prices";
import { BaseResource } from "./resource";

/** All-item price snapshots. */
export class PricesResource extends BaseResource {
  /** `GET /v2/prices/latest`. Enterprise: every item of one game with each market's ask and bid. */
  latestAll(
    params: { game: Game; ifNoneMatch?: undefined },
    options?: RequestOptions,
  ): Promise<LatestPricesResponse>;
  /** A matching conditional ETag returns null. */
  latestAll(
    params: LatestPricesParams,
    options?: RequestOptions,
  ): Promise<LatestPricesResponse | null>;
  latestAll(
    params: LatestPricesParams,
    options?: RequestOptions,
  ): Promise<LatestPricesResponse | null> {
    return this.call(
      {
        method: "GET",
        path: "/prices/latest",
        baseUrl: this.http.versionedBaseUrl("v2"),
        query: { game: params.game },
        ifNoneMatch: params.ifNoneMatch,
      },
      options,
    );
  }
}
