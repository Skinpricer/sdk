/** An ISO-8601 timestamp string. */
export type IsoDateString = string;

/** A monetary value in integer USD cents. */
export type Cents = number;

export interface MarketPricePoint {
  market: string;
  price: Cents;
  currency: string;
  fetchedAt: IsoDateString;
  ingestedAt?: IsoDateString;
  quoteSize?: number;
  totalQuantity?: number;
  ingestLatencyMs?: number;
  isStale?: boolean;
}

export interface AggregatePriceData {
  minPrice: Cents | null;
  maxPrice: Cents | null;
  avgPrice: Cents | null;
  medianPrice: Cents | null;
  stdDev: number | null;
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
