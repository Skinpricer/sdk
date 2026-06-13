import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString } from "./shared";

export interface MarketAnalyticsParams {
  markets?: KnownMarket[];
  /** Historical analytics window in hours (1–168, default 24). */
  windowHours?: number;
}

/** Per-market analytics row (snake_case fields, camelCase `market`). */
export interface MarketAnalyticsPoint {
  market: string;
  current_ask: Cents | null;
  current_bid: Cents | null;
  spread_bps: number | null;
  ask_is_stale: boolean | null;
  bid_is_stale: boolean | null;
  current_listing_count: number | null;
  current_buy_order_count: number | null;
  current_bid_quantity: number | null;
  sell_avg_price: Cents | null;
  sell_min_price: Cents | null;
  sell_max_price: Cents | null;
  sell_avg_listing_count: number | null;
  buy_avg_price: Cents | null;
  buy_max_price: Cents | null;
  buy_avg_order_count: number | null;
  buy_avg_total_quantity: number | null;
}

/** `GET /v1/market-analytics/:marketHashName` (snake_case top-level). */
export interface MarketAnalyticsResponse {
  canonical_item_id: string;
  market_hash_name: string;
  window_hours: number;
  markets: MarketAnalyticsPoint[];
  calculated_at: IsoDateString;
}
