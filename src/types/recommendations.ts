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
  /** @deprecated Use `canonicalItemId`. The API stops sending it on 2027-01-15. */
  canonical_item_id: string;
  /** @deprecated Use `marketHashName`. The API stops sending it on 2027-01-15. */
  market_hash_name: string;
  /** @deprecated Use `suggestedPrice`. The API stops sending it on 2027-01-15. */
  suggested_price: Cents | null;
  /** @deprecated Use `liquidityScore`. The API stops sending it on 2027-01-15. */
  liquidity_score: number;
  /** @deprecated Use `unstableReasons`. The API stops sending it on 2027-01-15. */
  unstable_reasons: string[];
  /** @deprecated Use `bestAsk`. The API stops sending it on 2027-01-15. */
  best_ask: BestPrice | null;
  /** @deprecated Use `bestBid`. The API stops sending it on 2027-01-15. */
  best_bid: BestPrice | null;
  /** @deprecated Use `spreadBps`. The API stops sending it on 2027-01-15. */
  spread_bps: number | null;
  /** @deprecated Use `marketCount`. The API stops sending it on 2027-01-15. */
  market_count: number;
  /** @deprecated Use `freshMarketCount`. The API stops sending it on 2027-01-15. */
  fresh_market_count: number;
  /** @deprecated Use `listingCount`. The API stops sending it on 2027-01-15. */
  listing_count: number;
  /** @deprecated Use `buyOrderCount`. The API stops sending it on 2027-01-15. */
  buy_order_count: number;
  /** @deprecated Use `totalBidQuantity`. The API stops sending it on 2027-01-15. */
  total_bid_quantity: number;
  /** @deprecated Use `calculatedAt`. The API stops sending it on 2027-01-15. */
  calculated_at: IsoDateString;
}
