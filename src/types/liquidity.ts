import type { Cents, IsoDateString } from "./shared";

// Liquidity & expected time-to-sell types (`/v1/liquidity/*`). Prices are USD cents.

export const LIQUIDITY_BADGES = [
  "EXTREMELY_LIQUID",
  "VERY_LIQUID",
  "LIQUID",
  "ILLIQUID",
  "VERY_ILLIQUID",
  "EXTREMELY_ILLIQUID",
  "UNTRADED",
] as const;
export type LiquidityBadge = (typeof LIQUIDITY_BADGES)[number];

export const LIQUIDITY_CONFIDENCE = [
  "HIGH",
  "MEDIUM",
  "LOW",
  "CRITICAL",
] as const;
export type LiquidityConfidence = (typeof LIQUIDITY_CONFIDENCE)[number];

export type LiquidityCoverage = "full" | "partial" | "none";

/** Lowercase label form of the badge; `UNTRADED` maps to `"unknown"`, no `"moderate"` tier. */
export const LIQUIDITY_LABELS = [
  "extremely_liquid",
  "very_liquid",
  "liquid",
  "illiquid",
  "very_illiquid",
  "extremely_illiquid",
  "unknown",
] as const;
export type LiquidityLabel = (typeof LIQUIDITY_LABELS)[number];

export const SUPPORTED_LIQUIDITY_MARKETS = [
  "skinport",
  "marketcsgo",
  "dmarket",
  "csdeals",
  "csfloat",
] as const;
export type SupportedLiquidityMarket =
  (typeof SUPPORTED_LIQUIDITY_MARKETS)[number];

export interface LiquidityParams {
  /** Hypothetical ask (USD cents) to estimate against; defaults to the best ask. */
  askPrice?: Cents;
  market?: SupportedLiquidityMarket;
}

/** Per-market row; every metric is null when that market has no data. */
export interface LiquidityMarketMetric {
  market: string;
  salesPerDay: number | null;
  activeListings: number | null;
  bestAskUsdCents: Cents | null;
  medianTimeToSellHours: number | null;
  p90TimeToSellHours: number | null;
  salesDataAgeMinutes: number | null;
  listingsDataAgeMinutes: number | null;
}

/** `GET /v1/liquidity/:marketHashName` — full liquidity model for one item. */
export interface LiquidityResponse {
  canonicalItemId: string;
  marketHashName: string;
  liquidityBadge: LiquidityBadge;
  confidence: LiquidityConfidence;
  coverage: LiquidityCoverage;
  medianTimeToSellHours: number | null;
  p90TimeToSellHours: number | null;
  bestMarketToList: string | null;
  salesPerDay: number | null;
  activeListings: number | null;
  referenceAskUsdCents: Cents | null;
  marketWideSalesPerDay: number | null;
  marketWideListings: number | null;
  marketsWithSales: number;
  marketsWithDepth: number;
  /** Whole-market saturation (hours), NOT a per-listing estimate. */
  marketWideMedianTimeToSellHours: number | null;
  marketWideP90TimeToSellHours: number | null;
  metrics: LiquidityMarketMetric[];
  /** Data-quality flags, e.g. `sales_data_stale:marketcsgo`. */
  notes: string[];
  calculatedAt: IsoDateString;
}

/** `GET /v1/liquidity/summary/:marketHashName` — slim badge-only projection. */
export interface LiquiditySummaryResponse {
  marketHashName: string;
  liquidityBadge: LiquidityBadge;
  liquidity: LiquidityLabel;
  /** Human time-to-sell, e.g. `"2 - 6 hours"` (`"No recent sales"` when untraded). */
  estimatedSaleTime: string;
  confidence: LiquidityConfidence;
  /** 0-100, higher sells faster; null when untraded. */
  score: number | null;
  bestMarketToList: string | null;
  calculatedAt: IsoDateString;
}

/** Request body for `POST /v1/liquidity/batch` (1-100 names). */
export interface LiquidityBatchBody {
  marketHashNames: string[];
  market?: SupportedLiquidityMarket;
}

/** `POST /v1/liquidity/batch` — up to 100 full results in one call. */
export interface LiquidityBatchResponse {
  results: LiquidityResponse[];
  notFound: string[];
  requested: number;
  calculatedAt: IsoDateString;
}

/** Bulk-map entry. `market_hash_name` and `estimated_sale_time` are snake_case on the wire. */
export interface LiquidityBulkItem {
  market_hash_name: string;
  liquidity: LiquidityLabel;
  estimated_sale_time: string;
  liquidityBadge: LiquidityBadge;
  confidence: LiquidityConfidence;
  score: number | null;
  bestMarketToList: string | null;
  /** Reserved; always `{}` for now. */
  variants: Record<string, never>;
}

/** `GET /v1/liquidity/items/manifest` — cheap change-probe; compare `version` before refetching. */
export interface LiquidityBulkManifest {
  /** Snapshot version / ETag. */
  version: string;
  calculatedAt: IsoDateString;
  /** Recompute cadence as an ISO-8601 duration, e.g. `"PT10M"`. */
  cadence: string;
  markets: string[];
  itemCount: number;
}

/** `GET /v1/liquidity/items` — Enterprise: whole-catalog map keyed by market_hash_name. */
export interface LiquidityBulkResponse extends LiquidityBulkManifest {
  items: Record<string, LiquidityBulkItem>;
}
