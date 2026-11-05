/** An ISO-8601 timestamp string. */
export type IsoDateString = string;

/** A monetary value in integer USD cents. */
export type Cents = number;

/** Evidence for a source time: the payload's own timestamp, a `Last-Modified` header, or CDN cache age. */
export type SourceTimeKind = "payload" | "last_modified" | "cdn_age" | "none";

export interface MarketPricePoint {
  market: string;
  price: Cents;
  currency: string;
  /** Source price in minor units of `originalCurrency`, before conversion and fees. */
  originalPriceCents?: number | null;
  originalCurrency?: string | null;
  /** When the price was last read or confirmed still current. Not the age of the data. */
  fetchedAt: IsoDateString;
  ingestedAt?: IsoDateString;
  /** Count the source reports for this quote. Null when unknown, which is not zero. */
  quoteSize?: number | null;
  /** Quantity across bid price levels. Null when unknown. */
  totalQuantity?: number | null;
  /** Order count across bid price levels, where the source reports one. */
  totalOrdersCount?: number | null;
  /** False when the source's book was read only in part, so quantities are lower bounds. */
  orderBookComplete?: boolean | null;
  ingestLatencyMs?: number;
  isStale?: boolean;
  /** When the source produced this data. Absent or null when unknown. */
  sourceUpdatedAt?: IsoDateString | null;
  sourceTimeKind?: SourceTimeKind;
  /** Age of the source's data when it was read, in seconds. */
  sourceAgeSeconds?: number | null;
  /** Whether the source's data is older than 30 minutes. Absent when its age is unknown. */
  isSourceStale?: boolean;
  /** True for a placeholder ask left out of the aggregate's average, median and deviation. It is still a real listing. */
  outlier?: boolean;
}

export interface AggregatePriceData {
  minPrice: Cents | null;
  maxPrice: Cents | null;
  avgPrice: Cents | null;
  medianPrice: Cents | null;
  stdDev: number | null;
  /** `corroborated_low_cluster` when placeholder asks were left out of the average, median and deviation. */
  basis?: "all_venues" | "corroborated_low_cluster";
  marketCount?: number;
  freshMarketCount?: number;
  listingCount?: number;
  updatedAt: IsoDateString;
}

export interface NbboBestPrice {
  market: string;
  price: Cents;
  updatedAt: IsoDateString;
  isStale: boolean;
}

export interface BestPrice {
  market: string;
  price: Cents;
  updated_at: IsoDateString;
  is_stale: boolean;
}

export interface PaginationMeta {
  perPage: number;
  currentPage: number;
  from: number;
  to: number;
  total: number;
  lastPage: number;
  prevPage: number | null;
  nextPage: number | null;
}
