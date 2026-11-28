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

/** Currencies a history batch can be served in. */
export type HistoryCurrency =
  | "USD"
  | "EUR"
  | "GBP"
  | "CHF"
  | "RUB"
  | "PLN"
  | "BRL"
  | "JPY"
  | "NOK"
  | "IDR"
  | "MYR"
  | "PHP"
  | "SGD"
  | "THB"
  | "VND"
  | "KRW"
  | "TRY"
  | "UAH"
  | "MXN"
  | "CAD"
  | "AUD"
  | "NZD"
  | "CNY"
  | "INR"
  | "CLP"
  | "PEN"
  | "COP"
  | "ZAR"
  | "HKD"
  | "TWD"
  | "SAR"
  | "AED"
  | "SEK"
  | "ARS"
  | "ILS"
  | "BYN"
  | "KZT"
  | "KWD"
  | "QAR"
  | "CRC"
  | "UYU"
  | "BGN"
  | "HRK"
  | "CZK"
  | "DKK"
  | "HUF"
  | "RON";

/** Economic basis of combined `SALE_HISTORY`. */
export type SaleHistoryBasis = "cash_venue_windows_v1";

export interface PriceHistoryBatchParams {
  /**
   * 1 to 100 items of the game, each an exact market hash name, a slug or a
   * canonical item id. A repeated entry is read once.
   */
  items: string[];
  /** Start of the range (Date or ISO string). */
  from?: Date | string;
  /** End of the range (Date or ISO string). */
  to?: Date | string;
  interval?: PriceHistoryInterval;
  listingType?: HistoryListingTypeInput;
  salesWindow?: SalesHistoryWindow;
  /** `SALE_HISTORY` only. */
  basis?: SaleHistoryBasis;
  /** Serve prices in this currency instead of USD cents; see {@link HistoryFx}. */
  currency?: HistoryCurrency;
}

/** An entry of a history batch that did not resolve to one item. */
export interface PriceHistoryBatchError {
  /** `ambiguous`: two items share the name or slug; use the canonical item id. */
  error: "not_found" | "ambiguous";
  /** The status a single history read of the entry returns. */
  status: 404 | 409;
  message: string;
}

/** The one rate every converted price in a response uses. */
export interface HistoryFx {
  base: "USD";
  quote: HistoryCurrency;
  /** Units of `quote` per 1 USD. */
  rate: number;
  source: string;
  rateTime: IsoDateString | null;
  /** Converted amounts are integers in this many decimal places of `quote`. */
  minorUnitDigits: number;
  rounding: "half_up";
  fxBasis: "current";
}

/** `POST /v2/pricing/history/batch`. */
export interface PriceHistoryBatchResponse {
  listingType: HistoryListingType;
  priceKind: HistoryPriceKind;
  salesWindow?: SalesHistoryWindow | null;
  effectiveInterval: "10m" | "1h" | "1d";
  from: IsoDateString;
  to: IsoDateString;
  /** Each resolved entry, keyed exactly as sent. */
  items: Record<string, PriceHistoryResponse>;
  /** Each entry that did not resolve, keyed exactly as sent. */
  errors: Record<string, PriceHistoryBatchError>;
  /** Present only when `currency` is not USD. */
  fx?: HistoryFx;
}
