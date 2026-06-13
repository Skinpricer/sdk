import type { IsoDateString } from "./shared";

export type MarketHealthStatus = "healthy" | "degraded" | "stale";

export interface MarketFreshness {
  market: string;
  delay_seconds: number;
  last_update: IsoDateString;
  status: MarketHealthStatus;
}

/** `GET /v1/status/freshness` (snake_case). */
export interface FreshnessResponse {
  markets: MarketFreshness[];
  overall_status: MarketHealthStatus;
  checked_at: IsoDateString;
}

export interface MarketLatency {
  market: string;
  avg_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  fetch_count: number;
  error_rate: number;
  slo_breach_rate: number;
}

/** `GET /v1/status/market-latency` (snake_case). */
export interface MarketLatencyResponse {
  markets: MarketLatency[];
  window_hours: number;
  measured_at: IsoDateString;
}
