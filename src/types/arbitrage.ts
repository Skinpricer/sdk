import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString } from "./shared";

/** Sorting by spreadBps ranks opportunities by netSpreadBps after seller commission. */
export type ArbitrageSort = "estimatedNetCents" | "spreadBps";

export interface ArbitrageParams {
  /** Max opportunities to return (1–100, default 50). */
  limit?: number;
  /** Minimum spread after estimated seller commission, in basis points (default 200). */
  minSpreadBps?: number;
  /**
   * Minimum verified buy-side notional in integer USD cents (default 1000).
   * Positive values require verified capacity; 0 also includes indicative price pairs.
   */
  minNotionalCents?: number;
  /** @deprecated Alias for {@link ArbitrageParams.minNotionalCents}. */
  minNotional?: number;
  sort?: ArbitrageSort;
  markets?: KnownMarket[];
  /** Maximum candidate items to consider (50–2000, default 500). */
  candidateLimit?: number;
}

export interface ArbitrageQuote {
  market: string;
  price: Cents;
  /** Aggregate quantity reported by the market; it does not verify availability at this price. */
  quoteSize: number;
  /** Verified observed quantity at this quote's price; null when unavailable. */
  priceLevelQuantity: number | null;
  updatedAt: IsoDateString;
  isStale: boolean;
}

export interface ArbitrageFreshness {
  buyAgeMs: number;
  sellAgeMs: number;
}

export interface ArbitrageOpportunity {
  canonicalItemId: string;
  marketHashName: string;
  slug: string;
  imageUrl: string | null;
  buy: ArbitrageQuote;
  sell: ArbitrageQuote;
  /** Gross spread relative to the buy price, in basis points, before seller fees. */
  spreadBps: number;
  /** Gross per-unit sell price minus buy price, before seller fees. */
  spreadCents: Cents;
  /** Spread after estimated seller commission, relative to the buy price, in basis points. */
  netSpreadBps: number;
  /** Estimated per-unit proceeds after seller commission minus the buy price; excludes withdrawal and transfer costs. */
  estimatedNetCents: Cents;
  /** Estimated seller commission applied to the sell quote, in basis points. */
  sellerFeeBps: number;
  /** Version identifier of the estimated fee model. */
  feeModelVersion: string;
  /** Whether the seller commission uses an assumed default rate. */
  assumedFees?: boolean;
  /** Matched capacity at the displayed buy and sell prices; null when either leg is unverified. */
  maxTradableQuantity: number | null;
  /** Buy-side notional for verified capacity in USD cents; null when unknown. */
  estimatedNotionalCents: Cents | null;
  feeNotes: string;
  freshness: ArbitrageFreshness;
  calculatedAt: IsoDateString;
}

/** `GET /v1/arbitrage/opportunities` (camelCase). */
export interface ArbitrageOpportunitiesResponse {
  opportunities: ArbitrageOpportunity[];
  totalCandidates: number;
  calculatedAt: IsoDateString;
}
