import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString } from "./shared";

export type AttributeType = "float" | "fade" | "tag";
export type AttributeGranularity = "10m" | "1h" | "1d";

export interface AttributeRangeDimension {
  min: number;
  max: number;
  minInclusive: boolean;
  maxInclusive: boolean;
}

export interface AttributeBucketDimensions {
  variant: string | null;
  float: AttributeRangeDimension | null;
  fade: AttributeRangeDimension | null;
  pattern: number | null;
  finishCatalog: number | null;
  paintSeed: number | null;
  charmTemplate: number | null;
  stickerScrape: number | null;
  sourceTagId: number | null;
  sourceTagName: string | null;
  nameTag: string | null;
}

export interface AttributePriceBucket {
  bucketId: string;
  bucketKey: string;
  sourceBucketId: string;
  bucketType: "attribute";
  attributeType: AttributeType;
  attributeTypes: AttributeType[];
  sourceItemId: string;
  dimensions: AttributeBucketDimensions;
  askCents: Cents | null;
  avgAskCents: Cents | null;
  medianAskCents: Cents | null;
  bidCents: Cents | null;
  askListingCount: number | null;
  bidOrderCount: number | null;
  sourceUpdatedAt: IsoDateString;
  collectedAt: IsoDateString;
}

export interface AttributePriceItem {
  canonicalItemId: string;
  marketHashName: string;
  market: string;
  buckets: AttributePriceBucket[];
}

export interface AttributeHistoryPoint {
  bucketStart: IsoDateString;
  openAskCents: Cents | null;
  highAskCents: Cents | null;
  lowAskCents: Cents | null;
  closeAskCents: Cents | null;
  avgAskCents: Cents | null;
  closeBidCents: Cents | null;
  askListingCount: number | null;
  bidOrderCount: number | null;
  firstObservedAt: IsoDateString;
  lastObservedAt: IsoDateString;
}

export interface AttributeHistoryBucket {
  bucketId: string;
  bucketKey: string;
  sourceBucketId: string;
  bucketType: "attribute";
  attributeType: AttributeType;
  attributeTypes: AttributeType[];
  sourceItemId: string;
  dimensions: AttributeBucketDimensions;
  points: AttributeHistoryPoint[];
}

export interface AttributeHistoryItem {
  canonicalItemId: string;
  marketHashName: string;
  market: string;
  buckets: AttributeHistoryBucket[];
}

// --- Multi-market (/attribute-prices) ---

export interface AttributeLatestParams {
  canonicalItemId?: string;
  marketHashName?: string;
  attributes?: AttributeType[];
  /** Max attribute buckets to return (1–1000). */
  limit?: number;
  /** Opaque pagination cursor from a previous `nextCursor`. */
  cursor?: string;
  /** Supported markets to include. */
  markets?: KnownMarket[];
}

export interface AttributeLatestResponse {
  bucketSchemaVersion: 1;
  markets: string[];
  currency: "USD";
  asOf: IsoDateString;
  items: AttributePriceItem[];
  nextCursor: string | null;
  sourceGaps: string[];
}

export interface AttributeHistoryParams {
  canonicalItemId?: string;
  marketHashName?: string;
  bucketId?: string;
  bucketIds?: string[];
  attributes?: AttributeType[];
  from?: Date | string;
  to?: Date | string;
  granularity?: AttributeGranularity;
  /** Max history points across all buckets (1–10000). */
  limit?: number;
  markets?: KnownMarket[];
}

export interface AttributeHistoryResponse {
  bucketSchemaVersion: 1;
  markets: string[];
  currency: "USD";
  granularity: AttributeGranularity;
  items: AttributeHistoryItem[];
  sourceGaps: string[];
}

// --- Buff163-specific (/markets/buff163) ---

export interface Buff163LatestParams {
  canonicalItemId?: string;
  marketHashName?: string;
  attributes?: AttributeType[];
  limit?: number;
  cursor?: string;
}

export interface Buff163AttributeLatestResponse {
  bucketSchemaVersion: 1;
  market: "buff163";
  currency: "USD";
  asOf: IsoDateString;
  items: AttributePriceItem[];
  nextCursor: string | null;
  sourceGaps: string[];
}

export interface Buff163HistoryParams {
  canonicalItemId?: string;
  marketHashName?: string;
  bucketId?: string;
  bucketIds?: string[];
  attributes?: AttributeType[];
  from?: Date | string;
  to?: Date | string;
  granularity?: AttributeGranularity;
  limit?: number;
}

export interface Buff163AttributeHistoryResponse {
  bucketSchemaVersion: 1;
  market: "buff163";
  currency: "USD";
  granularity: AttributeGranularity;
  items: AttributeHistoryItem[];
  sourceGaps: string[];
}
