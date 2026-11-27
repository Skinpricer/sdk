import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString, SellBasis, ValueKind } from "./shared";

/** History values are statistics over asks, bids or sales, never a single quote. */
export type HistoryPriceKind =
  | "ask_statistic"
  | "bid_statistic"
  | "sale_statistic";

export type HistoryListingType = "SELL_OFFER" | "BUY_ORDER" | "SALE_HISTORY";
/** Accepted on input; the backend also normalizes `SELL`/`BUY`/`SALES`. */
export type HistoryListingTypeInput =
  | HistoryListingType
  | "SELL"
  | "BUY"
  | "SALES";
export type SalesHistoryWindow = "24h" | "7d" | "30d" | "90d";
export type PriceHistoryInterval =
  | "MINUTE_5"
  | "MINUTE_15"
  | "HOUR_1"
  | "HOUR_6"
  | "DAY_1";

export interface PriceHistoryParams {
  /** Start of the range (Date or ISO string). */
  from?: Date | string;
  /** End of the range (Date or ISO string). */
  to?: Date | string;
  /** Markets to include; when set, `byMarket` returns per-market series. */
  markets?: KnownMarket[];
  listingType?: HistoryListingTypeInput;
  salesWindow?: SalesHistoryWindow;
  interval?: PriceHistoryInterval;
}

export interface PriceHistoryPoint {
  timestamp: IsoDateString;
  avgPrice: Cents | null;
  medianPrice: Cents | null;
  minPrice: Cents | null;
  maxPrice: Cents | null;
  listingCount: number | null;
  totalQuantity: number | null;
  volume: number | null;
  bestBidCents: Cents | null;
  bestAskCents: Cents | null;
  spreadBps: number | null;
}

/** `GET /v1/pricing/:marketHashName/history` (camelCase). */
export interface PriceHistoryResponse {
  canonicalItemId: string;
  name: string;
  history: PriceHistoryPoint[];
  listingType: HistoryListingType;
  priceKind?: HistoryPriceKind;
  salesWindow: SalesHistoryWindow | null;
  /** Actual returned bucket width, which may differ from the requested interval. */
  effectiveInterval: "10m" | "1h" | "1d";
}

export interface MarketSeries {
  market: string;
  history: PriceHistoryPoint[];
  /** `SELL_OFFER` series only. */
  sellBasis?: SellBasis;
  /** `BUY_ORDER` series only. */
  valueKind?: ValueKind;
}

/** `GET /v1/pricing/:marketHashName/history/markets` (camelCase). */
export interface PriceHistoryByMarketResponse {
  canonicalItemId: string;
  name: string;
  series: MarketSeries[];
  listingType: HistoryListingType;
  priceKind?: HistoryPriceKind;
  salesWindow: SalesHistoryWindow | null;
  /** Actual returned bucket width, which may differ from the requested interval. */
  effectiveInterval: "10m" | "1h" | "1d";
}
