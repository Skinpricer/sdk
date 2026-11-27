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
}

/** `GET /v1/market-analytics/:marketHashName`. */
export interface MarketAnalyticsResponse {
  canonicalItemId: string;
  marketHashName: string;
  windowHours: number;
  markets: MarketAnalyticsPoint[];
  calculatedAt: IsoDateString;
}
