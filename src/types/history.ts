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
  /** `SALE_HISTORY` only. Not accepted by `byMarket`. */
  basis?: SaleHistoryBasis;
}

/** History options of a game-scoped client, which can also convert prices. */
export interface GamePriceHistoryParams extends PriceHistoryParams {
  /** Serve prices in this currency instead of USD cents; see {@link HistoryFx}. */
  currency?: HistoryCurrency;
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
  /** Seller-net cash bid after the venue commission. Null for combined `SALE_HISTORY`. */
  netBestBidCents?: Cents | null;
  /** Spread between `bestAskCents` and `netBestBidCents`. Null for combined `SALE_HISTORY`. */
  netSpreadBps?: number | null;
  /** Combined `SALE_HISTORY` only: the venues contributing to this point. */
  contributingMarkets?: string[];
  /** Combined `SALE_HISTORY` only: each contributing venue's latest snapshot in the bucket. */
  observations?: SaleHistoryObservation[];
  /**
   * Per-market `SELL_OFFER` only: `minPrice` in the venue's own currency and
   * minor units, before conversion and fees.
   */
  originalPriceCents?: number | null;
  /** ISO currency of `originalPriceCents`; null exactly when it is null. */
  originalCurrency?: string | null;
}

/** When one venue's trailing sales window was fetched. */
export interface SaleHistoryObservation {
  market: string;
  observedAt: IsoDateString;
}

/** `GET /v1/pricing/:marketHashName/history` (camelCase). */
export interface PriceHistoryResponse {
  canonicalItemId: string;
  name: string;
  history: PriceHistoryPoint[];
  listingType: HistoryListingType;
  priceKind: HistoryPriceKind;
  salesWindow: SalesHistoryWindow | null;
  /** Actual returned bucket width, which may differ from the requested interval. */
  effectiveInterval: "10m" | "1h" | "1d";
  /** Combined `SALE_HISTORY` only. */
  basis?: SaleHistoryBasis;
  /**
   * Combined `SALE_HISTORY` only: an equally weighted index of venues, so
   * `medianPrice` is the median of venue medians, not of individual sales.
   */
  statistic?: "venue_price_index";
  /**
   * Combined `SALE_HISTORY` only: `volume` sums each venue's latest trailing
   * window, so adding it across buckets counts sales more than once.
   */
  volumeBasis?: "trailing_window_count";
  /** Combined `SALE_HISTORY` only. Steam sales are never part of `history`. */
  steamWallet?: SteamWalletHistory;
  /** Present only when stored history known to be wrong was left out. */
  corrections?: HistoryCorrection[];
  /** Present only when `currency` is not USD. */
  fx?: HistoryFx;
}

/**
 * A range of one market's stored history left out because it is known to be
 * wrong. The market contributes nothing to a point whose bucket overlaps it.
 */
export interface HistoryCorrection {
  market: string;
  /** Inclusive. */
  from: IsoDateString;
  /** Exclusive. */
  to: IsoDateString;
  reason: string;
}

/** Steam Community Market sales in gross wallet value, never converted to cash. */
export interface SteamWalletHistory {
  basis: "steam_wallet_gross";
  history: PriceHistoryPoint[];
}

export interface MarketSeries {
  market: string;
  /**
   * `native`: the market quotes USD. `historical`: each value was converted to
   * USD at the rate when it was observed, so the series also moves with FX.
   */
  fxBasis: "historical" | "native";
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
  priceKind: HistoryPriceKind;
  salesWindow: SalesHistoryWindow | null;
  /** Actual returned bucket width, which may differ from the requested interval. */
  effectiveInterval: "10m" | "1h" | "1d";
  /** Present only when stored history known to be wrong was left out. */
  corrections?: HistoryCorrection[];
  /** Present only when `currency` is not USD. */
  fx?: HistoryFx;
}

/** Currencies game-scoped history can be served in. */
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
