import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString, NbboBestPrice } from "./shared";

export interface NbboParams {
  /** Canonical item id. Provide this or `marketHashName`. */
  id?: string;
  /** Market hash name. Sent as the `market_hash_name` query param. */
  marketHashName?: string;
  markets?: KnownMarket[];
}

/** Fee-aware, executability-ranked best price for one side. Ask `price` is the total a buyer pays; bid `price` is the net a seller receives after fees. */
export interface ExecutionAdjustedBestPrice {
  market: string;
  price: Cents;
  rawPrice: Cents;
  appliedFeeBps: number;
  withdrawalFlatUsdCents?: Cents;
  executability: number;
  updatedAt: IsoDateString;
  isStale: boolean;
  reasons: string[];
}

/** Execution-adjusted NBBO block: fee-aware best bid/ask re-ranked by executability. */
export interface ExecutionAdjustedNbbo {
  bestAsk: ExecutionAdjustedBestPrice | null;
  bestBid: ExecutionAdjustedBestPrice | null;
  spreadBps: number | null;
  locked: boolean;
  crossed: boolean;
  executableConfidence: number;
  reasons: string[];
  feeModelVersion: string;
  calculatedAt: IsoDateString;
}

/** `GET /v1/nbbo` (camelCase). */
export interface NbboResponse {
  marketHashName: string;
  canonicalItemId: string;
  bestAsk: NbboBestPrice | null;
  bestBid: NbboBestPrice | null;
  spreadBps: number | null;
  marketCount: number;
  freshMarketCount: number;
  locked: boolean;
  crossed: boolean;
  confidence: number;
  calculatedAt: IsoDateString;
  /** Execution-adjusted "real best market"; null when no quotes. */
  executionAdjusted: ExecutionAdjustedNbbo | null;
}

export interface NbboDepthParams extends NbboParams {
  /** Aggregated depth levels per side (1–50, default 10). */
  depth?: number;
}

export interface NbboDepthQuote {
  market: string;
  level: number;
  price: Cents;
  quantity: number;
  ordersCount: number;
  updatedAt: IsoDateString;
  isStale: boolean;
}

export interface NbboDepthLevel {
  rank: number;
  price: Cents;
  quantity: number;
  ordersCount: number;
  marketCount: number;
  cumulativeQuantity: number;
  updatedAt: IsoDateString;
  isStale: boolean;
  quotes: NbboDepthQuote[];
}

/** `GET /v1/nbbo/depth` (camelCase). */
export interface NbboDepthResponse {
  marketHashName: string;
  canonicalItemId: string;
  depth: number;
  marketCount: number;
  asks: NbboDepthLevel[];
  bids: NbboDepthLevel[];
  spreadBps: number | null;
  locked: boolean;
  crossed: boolean;
  calculatedAt: IsoDateString;
}
