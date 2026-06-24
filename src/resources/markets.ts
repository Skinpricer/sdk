import type { RequestOptions } from "../http/http-client";
import type { MarketHealthResponse } from "../types/markets";
import { BaseResource } from "./resource";

/** Market registry health & integration status. */
export class MarketsResource extends BaseResource {
  /**
   * `GET /v1/markets/health` — per-market ingest status, last event time, and
   * listing counts for every integrated market. Returns a plain array of
   * {@link import("../types/markets").MarketHealthRow}.
   */
  health(options?: RequestOptions): Promise<MarketHealthResponse> {
    return this.call<MarketHealthResponse>(
      // Keyless: served by the public `api.` host, not the pricing base.
      { method: "GET", path: "/markets/health", baseUrl: this.http.publicBaseUrl },
      options,
    );
  }
}
