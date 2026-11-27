import type { IsoDateString } from "./shared";

export type MarketHealthStatus = "healthy" | "degraded" | "stale";

export interface MarketFreshness {
  market: string;
  delaySeconds: number;
  lastUpdate: IsoDateString;
  status: MarketHealthStatus;
  /** @deprecated Use `delaySeconds`. The API stops sending it on 2027-01-15. */
  delay_seconds: number;
  /** @deprecated Use `lastUpdate`. The API stops sending it on 2027-01-15. */
  last_update: IsoDateString;
}

/** `GET /v1/status/freshness`. */
export interface FreshnessResponse {
  markets: MarketFreshness[];
  overallStatus: MarketHealthStatus;
  checkedAt: IsoDateString;
  /** @deprecated Use `overallStatus`. The API stops sending it on 2027-01-15. */
  overall_status: MarketHealthStatus;
  /** @deprecated Use `checkedAt`. The API stops sending it on 2027-01-15. */
  checked_at: IsoDateString;
}

export interface MarketLatency {
  market: string;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  fetchCount: number;
  errorRate: number;
  sloBreachRate: number;
  /** @deprecated Use `avgLatencyMs`. The API stops sending it on 2027-01-15. */
  avg_latency_ms: number;
  /** @deprecated Use `p95LatencyMs`. The API stops sending it on 2027-01-15. */
  p95_latency_ms: number;
  /** @deprecated Use `p99LatencyMs`. The API stops sending it on 2027-01-15. */
  p99_latency_ms: number;
  /** @deprecated Use `fetchCount`. The API stops sending it on 2027-01-15. */
  fetch_count: number;
  /** @deprecated Use `errorRate`. The API stops sending it on 2027-01-15. */
  error_rate: number;
  /** @deprecated Use `sloBreachRate`. The API stops sending it on 2027-01-15. */
  slo_breach_rate: number;
}

/** `GET /v1/status/market-latency`. */
export interface MarketLatencyResponse {
  markets: MarketLatency[];
  windowHours: number;
  measuredAt: IsoDateString;
  /** @deprecated Use `windowHours`. The API stops sending it on 2027-01-15. */
  window_hours: number;
  /** @deprecated Use `measuredAt`. The API stops sending it on 2027-01-15. */
  measured_at: IsoDateString;
}
