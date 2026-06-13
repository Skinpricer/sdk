import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString } from "./shared";

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
  salesWindow: SalesHistoryWindow | null;
}

export interface MarketSeries {
  market: string;
  history: PriceHistoryPoint[];
}

/** `GET /v1/pricing/:marketHashName/history/markets` (camelCase). */
export interface PriceHistoryByMarketResponse {
  canonicalItemId: string;
  name: string;
  series: MarketSeries[];
  listingType: HistoryListingType;
  salesWindow: SalesHistoryWindow | null;
}
