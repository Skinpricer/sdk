import type { KnownMarket } from "./markets";
import type { Cents, IsoDateString } from "./shared";

export interface AggregationsParams {
  /** Canonical item ids (1–100). Provide this or {@link AggregationsParams.marketHashNames}. */
  ids?: string[];
  /** Market hash names (1–100). Provide this or {@link AggregationsParams.ids}. */
  marketHashNames?: string[];
  markets?: KnownMarket[];
}

/** Per-market minimum sell price (snake_case). */
export interface MarketMinPrice {
  market_name: string;
  offers: number;
  price: Cents;
  updated_at: IsoDateString;
  is_stale?: boolean;
  ingested_at?: IsoDateString;
  ingest_latency_ms?: number;
}

export interface ItemMinPrices {
  canonical_item_id: string;
  market_hash_name: string;
  prices: MarketMinPrice[];
}

/** `GET /v1/aggregations/min-prices` (snake_case). */
export interface MinPricesResponse {
  items: ItemMinPrices[];
}

/** Per-market maximum buy order (snake_case). */
export interface MarketMaxOrder {
  market_name: string;
  offers: number;
  price: Cents;
  updated_at: IsoDateString;
  is_stale: boolean;
  total_quantity?: number;
  ingested_at?: IsoDateString;
  ingest_latency_ms?: number;
}

export interface ItemMaxOrders {
  canonical_item_id: string;
  market_hash_name: string;
  orders: MarketMaxOrder[];
}

/** `GET /v1/aggregations/max-orders` (snake_case). */
export interface MaxOrdersResponse {
  items: ItemMaxOrders[];
}
