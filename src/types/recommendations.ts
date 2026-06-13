import type { KnownMarket } from "./markets";
import type { BestPrice, Cents, IsoDateString } from "./shared";

export interface RecommendationParams {
  markets?: KnownMarket[];
}

/** `GET /v1/recommendations/:marketHashName` (snake_case). */
export interface RecommendationResponse {
  canonical_item_id: string;
  market_hash_name: string;
  suggested_price: Cents | null;
  strategy: string;
  confidence: number;
  liquidity_score: number;
  unstable_reasons: string[];
  best_ask: BestPrice | null;
  best_bid: BestPrice | null;
  spread_bps: number | null;
  market_count: number;
  fresh_market_count: number;
  listing_count: number;
  buy_order_count: number;
  total_bid_quantity: number;
  calculated_at: IsoDateString;
}
