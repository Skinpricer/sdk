import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString } from "./shared";

export type ArbitrageSort = "estimatedNetCents" | "spreadBps";

export interface ArbitrageParams {
  /** Max opportunities to return (1–100, default 50). */
  limit?: number;
  /** Minimum cross-market spread in basis points (default 200). */
  minSpreadBps?: number;
  /** Minimum estimated buy-side notional in integer USD cents (default 1000). */
  minNotionalCents?: number;
  /** @deprecated Alias for {@link ArbitrageParams.minNotionalCents}. */
  minNotional?: number;
  sort?: ArbitrageSort;
  markets?: KnownMarket[];
  /** Internal shortlist size (50–2000, default 500). */
  candidateLimit?: number;
}

export interface ArbitrageQuote {
  market: string;
  price: Cents;
  quoteSize: number;
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
  spreadBps: number;
  spreadCents: Cents;
  estimatedNetCents: Cents;
  maxTradableQuantity: number;
  estimatedNotionalCents: Cents;
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
