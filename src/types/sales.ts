import type { Game } from "./games";
import type { Cents, IsoDateString } from "./shared";

export interface SalesDailyParams {
  game: Game;
  /** A closed UTC day, `YYYY-MM-DD`: yesterday or earlier. */
  date: string;
  /** ETag of a file you already hold. HTTP 304 returns null. */
  ifNoneMatch?: string;
}

/**
 * One line of the daily sales file. Every field is present; null is unknown,
 * never zero. An item or market without a row is unknown for the day.
 */
export interface SalesDailyRow {
  /** The UTC day, `YYYY-MM-DD`. */
  date: string;
  game: Game;
  /** The item's title as the market reported it. */
  itemName: string;
  phase: string | null;
  paintIndex: number | null;
  /** The catalog item id when exactly one item matches `itemName`. */
  itemId: string | null;
  market: string;
  /** The market's lanes in this row. Several when the market's sale feeds are merged. */
  lanes: string[];
  /** `sales`: counted sales. `points`: the market's own statistics for the day. */
  evidence: "sales" | "points";
  /** Set on `sales` rows. */
  side: string | null;
  /** The market's statistic, set on `points` rows. */
  statistic: string | null;
  /** Point resolutions, set on `points` rows. */
  resolutions: string[] | null;
  /** Number of points, set on `points` rows. */
  points: number | null;
  count: number | null;
  /** What `count` counts. Null exactly when `count` is null. */
  countBasis: "sales" | "units" | null;
  /** The count is a lower bound: the source may have more sales that day. */
  completeness: "lower_bound";
  economicBasis: string;
  currency: string;
  /** Native amounts in `currency`, as exact decimal strings. */
  priceMin: string;
  priceMax: string;
  priceMedian: string | null;
  priceMean: string | null;
  /** USD cents at the historical rate of `fxDate`. Null without a rate. */
  usdCentsMin: Cents | null;
  usdCentsMax: Cents | null;
  usdCentsMedian: Cents | null;
  usdCentsMean: Cents | null;
  fxDate: string | null;
  firstAt: IsoDateString;
  lastAt: IsoDateString;
}

export interface SalesDailyFile {
  /** Send it as `ifNoneMatch` to skip an unchanged file. */
  etag: string | null;
  /**
   * False while the day is provisional. The final build adds late sales and
   * changes the ETag.
   */
  final: boolean;
  /** Archive receipts after this time are not in the file. */
  receivedThrough: IsoDateString | null;
  rows: SalesDailyRow[];
}
