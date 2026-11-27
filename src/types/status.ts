import type { IsoDateString } from "./shared";

export type MarketHealthStatus = "healthy" | "degraded" | "stale";

export interface MarketFreshness {
  market: string;
  delaySeconds: number;
  lastUpdate: IsoDateString;
  status: MarketHealthStatus;
}

/** `GET /v1/status/freshness`. */
export interface FreshnessResponse {
  markets: MarketFreshness[];
  overallStatus: MarketHealthStatus;
  checkedAt: IsoDateString;
}

export interface MarketLatency {
  market: string;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  fetchCount: number;
  errorRate: number;
  sloBreachRate: number;
}

/** `GET /v1/status/market-latency`. */
export interface MarketLatencyResponse {
  markets: MarketLatency[];
  windowHours: number;
  measuredAt: IsoDateString;
}
