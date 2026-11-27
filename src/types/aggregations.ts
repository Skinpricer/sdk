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
}

export interface ItemMinPrices {
  canonicalItemId: string;
  marketHashName: string;
  prices: MarketMinPrice[];
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
}

export interface ItemMaxOrders {
  canonicalItemId: string;
  marketHashName: string;
  orders: MarketMaxOrder[];
}

/** `GET /v1/aggregations/max-orders`. */
export interface MaxOrdersResponse {
  items: ItemMaxOrders[];
}
