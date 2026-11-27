import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString, SellBasis, ValueKind } from "./shared";

export interface MarketAnalyticsParams {
  markets?: KnownMarket[];
  /** Historical analytics window in hours (1–168, default 24). */
  windowHours?: number;
}

/** Per-market analytics row. */
export interface MarketAnalyticsPoint {
  market: string;
  currentAsk: Cents | null;
  currentBid: Cents | null;
  spreadBps: number | null;
  askIsStale: boolean | null;
  bidIsStale: boolean | null;
  currentListingCount: number | null;
  currentBuyOrderCount: number | null;
  currentBidQuantity: number | null;
  sellAvgPrice: Cents | null;
  sellMinPrice: Cents | null;
  sellMaxPrice: Cents | null;
  sellAvgListingCount: number | null;
  buyAvgPrice: Cents | null;
  buyMaxPrice: Cents | null;
  buyAvgOrderCount: number | null;
  buyAvgTotalQuantity: number | null;
  /** True only when you can buy at `currentAsk` now. */
  askPurchasable?: boolean | null;
  /** Basis of `sellAvgPrice` and `sellMaxPrice`. */
  sellBasis?: SellBasis;
  /** Settlement kind of this market's bids: `currentBid`, `buyAvgPrice` and `buyMaxPrice`. */
  valueKind?: ValueKind;
  /** @deprecated Use `currentAsk`. The API stops sending it on 2027-01-15. */
  current_ask: Cents | null;
  /** @deprecated Use `currentBid`. The API stops sending it on 2027-01-15. */
  current_bid: Cents | null;
  /** @deprecated Use `spreadBps`. The API stops sending it on 2027-01-15. */
  spread_bps: number | null;
  /** @deprecated Use `askIsStale`. The API stops sending it on 2027-01-15. */
  ask_is_stale: boolean | null;
  /** @deprecated Use `bidIsStale`. The API stops sending it on 2027-01-15. */
  bid_is_stale: boolean | null;
  /** @deprecated Use `currentListingCount`. The API stops sending it on 2027-01-15. */
  current_listing_count: number | null;
  /** @deprecated Use `currentBuyOrderCount`. The API stops sending it on 2027-01-15. */
  current_buy_order_count: number | null;
  /** @deprecated Use `currentBidQuantity`. The API stops sending it on 2027-01-15. */
  current_bid_quantity: number | null;
  /** @deprecated Use `sellAvgPrice`. The API stops sending it on 2027-01-15. */
  sell_avg_price: Cents | null;
  /** @deprecated Use `sellMinPrice`. The API stops sending it on 2027-01-15. */
  sell_min_price: Cents | null;
  /** @deprecated Use `sellMaxPrice`. The API stops sending it on 2027-01-15. */
  sell_max_price: Cents | null;
  /** @deprecated Use `sellAvgListingCount`. The API stops sending it on 2027-01-15. */
  sell_avg_listing_count: number | null;
  /** @deprecated Use `buyAvgPrice`. The API stops sending it on 2027-01-15. */
  buy_avg_price: Cents | null;
  /** @deprecated Use `buyMaxPrice`. The API stops sending it on 2027-01-15. */
  buy_max_price: Cents | null;
  /** @deprecated Use `buyAvgOrderCount`. The API stops sending it on 2027-01-15. */
  buy_avg_order_count: number | null;
  /** @deprecated Use `buyAvgTotalQuantity`. The API stops sending it on 2027-01-15. */
  buy_avg_total_quantity: number | null;
}

/** `GET /v1/market-analytics/:marketHashName`. */
export interface MarketAnalyticsResponse {
  canonicalItemId: string;
  marketHashName: string;
  windowHours: number;
  markets: MarketAnalyticsPoint[];
  calculatedAt: IsoDateString;
  /** @deprecated Use `canonicalItemId`. The API stops sending it on 2027-01-15. */
  canonical_item_id: string;
  /** @deprecated Use `marketHashName`. The API stops sending it on 2027-01-15. */
  market_hash_name: string;
  /** @deprecated Use `windowHours`. The API stops sending it on 2027-01-15. */
  window_hours: number;
  /** @deprecated Use `calculatedAt`. The API stops sending it on 2027-01-15. */
  calculated_at: IsoDateString;
}
