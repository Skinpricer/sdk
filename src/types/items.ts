import type { KnownMarket } from "./markets";
import type { CurrentPriceResponse } from "./pricing";
import type { Cents, IsoDateString, PaginationMeta } from "./shared";

export interface ItemSearchParams {
  /** Case-insensitive contains match on item name. */
  search?: string;
  markets?: KnownMarket[];
  /** 1-based page number (default 1). */
  page?: number;
  /** Items per page (1–100, default 10). */
  perPage?: number;
}

/** `GET /v1/items` — paginated (camelCase). */
export interface ItemPriceListResponse {
  data: CurrentPriceResponse[];
  pagination: PaginationMeta;
}

export interface AllItemsLatestPrice {
  market: string;
  effectiveUsdCents: Cents;
  fetchedAt: IsoDateString;
  originalCurrency: string;
}

export interface AllItemsPriceAggregates {
  minPrice: Cents | null;
  maxPrice: Cents | null;
  avgPrice: Cents | null;
  medianPrice: Cents | null;
  stdDev: number | null;
  updatedAt: IsoDateString;
}

export interface AllItemsItem {
  id: string;
  name: string;
  latestPrices: AllItemsLatestPrice[];
  priceAggregates: AllItemsPriceAggregates | null;
}

/** `GET /v1/items/all` — a plain array (camelCase). */
export type AllItemsResponse = AllItemsItem[];
