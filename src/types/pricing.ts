import type { KnownMarket } from "./markets";
import type {
  AggregatePriceData,
  Cents,
  IsoDateString,
  MarketPricePoint,
  NbboBestPrice,
} from "./shared";

export interface CurrentPriceParams {
  /** Restrict the response to these market ids. */
  markets?: KnownMarket[];
}

/** `GET /v1/pricing/:marketHashName` (camelCase). */
export interface CurrentPriceResponse {
  canonicalItemId: string;
  name: string;
  aggregate?: AggregatePriceData;
  markets: MarketPricePoint[];
  buyOrders?: MarketPricePoint[];
  bestAsk?: NbboBestPrice | null;
  bestBid?: NbboBestPrice | null;
  spreadBps?: number | null;
  marketCount?: number;
  freshMarketCount?: number;
  calculatedAt: IsoDateString;
}

export interface PricingListingsParams {
  /** Max listing samples to return (1–2000, default 500). */
  limit?: number;
  markets?: KnownMarket[];
}

export interface PricingListing {
  listingId: string | null;
  market: string;
  price: Cents;
  currency: "USD";
  floatValue: number | null;
  paintSeed: number | null;
  paintIndex: number | null;
  inspectLink: string | null;
  stickers: unknown[];
  isStatTrak: boolean;
  fetchedAt: IsoDateString;
}

export interface PricingListingFloatCoverage {
  coverage: "none" | "partial" | "complete";
  sampledListings: number;
  listingsWithFloat: number;
  marketsWithFloat: string[];
  marketsWithoutFloat: string[];
}

export interface PricingListingObservedFloatSource {
  market: string;
  price: Cents;
  fetchedAt: IsoDateString;
}

export interface PricingListingFloatSummary {
  observed: number;
  itemMin: number | null;
  itemMax: number | null;
  observedSource: PricingListingObservedFloatSource;
}

/** `GET /v1/pricing/:marketHashName/listings` (camelCase). */
export interface PricingListingsResponse {
  marketHashName: string;
  canonicalItemId: string;
  totalListings: number;
  sampledListings: number;
  floatCoverage: PricingListingFloatCoverage;
  floatSummary: PricingListingFloatSummary | null;
  listings: PricingListing[];
  calculatedAt: IsoDateString;
}
