import type { Game } from "./games";
import type {
  Cents,
  IsoDateString,
  NbboBestPrice,
  SourceTimeKind,
} from "./shared";

export interface LatestPricesParams {
  game: Game;
  /** ETag from the preceding snapshot. HTTP 304 returns null. */
  ifNoneMatch?: string;
}

/** Fields shared by every quote in the all-item snapshot. */
export interface LatestPricePoint {
  market: string;
  price: Cents;
  /** When the price was last read or confirmed still current. Not the age of the data. */
  fetchedAt: IsoDateString;
  /** Whether the quote was older than 30 minutes when the snapshot was built. */
  isStale: boolean;
  /** Source price in minor units of `originalCurrency`, before conversion and fees. */
  originalPriceCents?: number;
  originalCurrency?: string;
  /** When the source produced this data. Absent when unknown. */
  sourceUpdatedAt?: IsoDateString;
}

export interface LatestPriceAskPoint extends LatestPricePoint {
  quoteSize: number;
  /** True for a placeholder ask far above the corroborated cheaper asks. It is still a real listing. */
  outlier?: boolean;
}

export interface LatestPriceBidPoint extends LatestPricePoint {
  /** Null when unknown, which is not zero. */
  quoteSize: number | null;
  /** Quantity across bid price levels. Null when unknown. */
  totalQuantity: number | null;
  totalOrdersCount?: number;
  /** False when the source's book was read only in part, so quantities are lower bounds. */
  orderBookComplete?: boolean;
  sourceTimeKind?: SourceTimeKind;
  /** Age of the source's data when it was read, in seconds. */
  sourceAgeSeconds?: number;
  /** Whether the source's data was older than 30 minutes when the snapshot was built. */
  isSourceStale?: boolean;
}

export interface LatestPriceItem {
  /** Market hash name. */
  name: string;
  canonicalItemId: string;
  bestAsk: NbboBestPrice | null;
  /** Best bid among markets that pay out in cash. */
  bestBid: NbboBestPrice | null;
  markets: LatestPriceAskPoint[];
  buyOrders: LatestPriceBidPoint[];
}

/** `GET /v2/prices/latest`: every item of one game that has a servable quote. */
export interface LatestPricesResponse {
  /** When the oldest read in the snapshot started. A quote's `fetchedAt` can be later. */
  generatedAt: IsoDateString;
  game: Game;
  currency: "USD";
  /** Ordered by `canonicalItemId`. */
  items: LatestPriceItem[];
  itemCount: number;
}
