import type { RequestOptions } from "../http/http-client";
import type { FreshnessResponse, MarketLatencyResponse } from "../types/status";
import { BaseResource } from "./resource";

/** Pipeline health and latency metrics. */
export class StatusResource extends BaseResource {
  /** `GET /v1/status/freshness` — per-market data freshness and overall health. */
  freshness(options?: RequestOptions): Promise<FreshnessResponse> {
    return this.call<FreshnessResponse>(
      { method: "GET", path: "/status/freshness" },
      options,
    );
  }

  /** `GET /v1/status/market-latency` — fetch-to-ingest latency metrics per market. */
  marketLatency(options?: RequestOptions): Promise<MarketLatencyResponse> {
    return this.call<MarketLatencyResponse>(
      { method: "GET", path: "/status/market-latency" },
      options,
    );
  }
}
