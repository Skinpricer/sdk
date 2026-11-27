import type { KnownMarket } from "./markets";
import type {
  Cents,
  IsoDateString,
  NbboBestPrice,
  QuotePriceKind,
  ValueKind,
} from "./shared";

/** How well the fees on one side of the trade are known. With `unknown`, an ask has no `appliedFeeBps` and a bid assumes a default commission. */
export type FeeStatus = "complete" | "partial" | "unknown";

export interface NbboParams {
  /** Canonical item id. Provide this or `marketHashName`. */
  id?: string;
  /** Market hash name. */
  marketHashName?: string;
  markets?: KnownMarket[];
}

/** Fee-aware, executability-ranked best price for one side. Ask `price` is the total a buyer pays; bid `price` is the net a seller receives after fees. */
export interface ExecutionAdjustedBestPrice {
  market: string;
  price: Cents;
  rawPrice: Cents;
  /** Null on an ask when `feeStatus` is `unknown`. */
  appliedFeeBps: number | null;
  /** Null rather than zero when the market is not in the fee model. */
  withdrawalFlatUsdCents?: Cents | null;
  feeStatus?: FeeStatus;
  feeModelVersion?: string;
  executability: number;
  updatedAt: IsoDateString;
  isStale: boolean;
  reasons: string[];
  priceKind?: QuotePriceKind;
  /** True only for an ask you can buy at now. Always false on a bid. */
  purchasable?: boolean;
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
  priceKind?: QuotePriceKind;
  /** True only for an ask level you can buy at now. Always false on a bid. */
  purchasable?: boolean;
  valueKind?: ValueKind;
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
