import type { KnownMarket } from "./markets";
import type { BestPrice, Cents, IsoDateString } from "./shared";

export interface RecommendationParams {
  markets?: KnownMarket[];
}

/** `GET /v1/recommendations/:marketHashName`. */
export interface RecommendationResponse {
  canonicalItemId: string;
  marketHashName: string;
  suggestedPrice: Cents | null;
  /** `suggestedPrice` is a model estimate, not a quote from any market. */
  suggestedPriceKind?: "estimate";
  strategy: string;
  confidence: number;
  liquidityScore: number;
  unstableReasons: string[];
  bestAsk: BestPrice | null;
  bestBid: BestPrice | null;
  spreadBps: number | null;
  marketCount: number;
  freshMarketCount: number;
  listingCount: number;
  buyOrderCount: number;
  totalBidQuantity: number;
  calculatedAt: IsoDateString;
}
