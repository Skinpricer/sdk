import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString, ValueKind } from "./shared";

export interface AggregationsParams {
  /** Canonical item ids (1–100). Provide this or {@link AggregationsParams.marketHashNames}. */
  ids?: string[];
  /** Market hash names (1–100). Provide this or {@link AggregationsParams.ids}. */
  marketHashNames?: string[];
  markets?: KnownMarket[];
}

/** Per-market minimum sell price. */
export interface MarketMinPrice {
  marketName: string;
  offers: number;
  price: Cents;
  updatedAt: IsoDateString;
  isStale?: boolean;
  ingestedAt?: IsoDateString;
  ingestLatencyMs?: number;
  priceKind?: "ask";
  /** True only when you can buy at this price now. */
  purchasable?: boolean;
  /** @deprecated Use `marketName`. The API stops sending it on 2027-01-15. */
  market_name: string;
  /** @deprecated Use `updatedAt`. The API stops sending it on 2027-01-15. */
  updated_at: IsoDateString;
  /** @deprecated Use `isStale`. The API stops sending it on 2027-01-15. */
  is_stale?: boolean;
  /** @deprecated Use `ingestedAt`. The API stops sending it on 2027-01-15. */
  ingested_at?: IsoDateString;
  /** @deprecated Use `ingestLatencyMs`. The API stops sending it on 2027-01-15. */
  ingest_latency_ms?: number;
}

export interface ItemMinPrices {
  canonicalItemId: string;
  marketHashName: string;
  prices: MarketMinPrice[];
  /** @deprecated Use `canonicalItemId`. The API stops sending it on 2027-01-15. */
  canonical_item_id: string;
  /** @deprecated Use `marketHashName`. The API stops sending it on 2027-01-15. */
  market_hash_name: string;
}

/** `GET /v1/aggregations/min-prices`. */
export interface MinPricesResponse {
  items: ItemMinPrices[];
}

/** Per-market maximum buy order. */
export interface MarketMaxOrder {
  marketName: string;
  offers: number;
  price: Cents;
  updatedAt: IsoDateString;
  isStale: boolean;
  totalQuantity?: number;
  ingestedAt?: IsoDateString;
  ingestLatencyMs?: number;
  valueKind?: ValueKind;
  priceKind?: "bid";
  purchasable?: false;
  /** @deprecated Use `marketName`. The API stops sending it on 2027-01-15. */
  market_name: string;
  /** @deprecated Use `updatedAt`. The API stops sending it on 2027-01-15. */
  updated_at: IsoDateString;
  /** @deprecated Use `isStale`. The API stops sending it on 2027-01-15. */
  is_stale: boolean;
  /** @deprecated Use `totalQuantity`. The API stops sending it on 2027-01-15. */
  total_quantity?: number;
  /** @deprecated Use `ingestedAt`. The API stops sending it on 2027-01-15. */
  ingested_at?: IsoDateString;
  /** @deprecated Use `ingestLatencyMs`. The API stops sending it on 2027-01-15. */
  ingest_latency_ms?: number;
}

export interface ItemMaxOrders {
  canonicalItemId: string;
  marketHashName: string;
  orders: MarketMaxOrder[];
  /** @deprecated Use `canonicalItemId`. The API stops sending it on 2027-01-15. */
  canonical_item_id: string;
  /** @deprecated Use `marketHashName`. The API stops sending it on 2027-01-15. */
  market_hash_name: string;
}

/** `GET /v1/aggregations/max-orders`. */
export interface MaxOrdersResponse {
  items: ItemMaxOrders[];
}
