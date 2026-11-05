/** Market identifiers used in pricing responses. Availability differs by game. */
export const KNOWN_MARKETS = [
  "skinport",
  "skindeck",
  "buff163",
  "csfloat",
  "csdeals",
  "marketcsgo",
  "cstrade",
  "dmarket",
  "itrade",
  "lis-skins",
  "swapgg",
  "whitemarket",
  "waxpeer",
  "lootfarm",
  "rapidskins",
  "avanmarket",
  "tradeit-store",
  "tradeit-trade",
  "steamcommunity",
  "youpin",
  "mannco-store",
  "rusttm",
  "rustskins",
] as const;

/** A known market id, or any other string. */
export type KnownMarket =
  | (typeof KNOWN_MARKETS)[number]
  | (string & Record<never, never>);

/** Markets that expose attribute (float/fade/tag) bucket pricing. */
export const ATTRIBUTE_MARKETS = [
  "buff163",
  "steamcommunity",
  "marketcsgo",
  "csfloat",
  "dmarket",
] as const;

export type AttributeMarket =
  | (typeof ATTRIBUTE_MARKETS)[number]
  | (string & Record<never, never>);

/**
 * Per-market ingest status reported by `GET /v1/markets/health`. Distinct from
 * the freshness endpoint's `MarketHealthStatus` (`healthy | degraded | stale`)
 * in `./status` — the registry uses `live | warn | stale`.
 */
export type MarketRegistryStatus = "live" | "warn" | "stale";

/**
 * One market's health row from `GET /v1/markets/health`. The `id` is the
 * canonical join key used across pricing / nbbo / aggregation responses (see
 * {@link KNOWN_MARKETS}). A market appears here once integrated, at any status.
 */
export interface MarketHealthRow {
  id: string;
  status: MarketRegistryStatus;
  /** ISO timestamp of the latest ingest event from this marketplace. */
  lastEventAt: string | null;
  /** Null when the source does not establish an inventory count. */
  listingsCount: number | null;
  /** Percentage (0-100) of the market's quotes that are fresh. Null when it has none. */
  freshnessCoveragePct: number | null;
  listingsCountBasis?:
    | "observed-listings"
    | "observed-units"
    | "observed-listings-subset"
    | "observed-empty"
    | null;
  freshnessCoverageBasis?: {
    kind: "observed-active-quote-identities";
    activeWindowHours: number;
    freshWindowMinutes: number;
    activeQuotes: number;
    freshQuotes: number;
    collectionMode: "rolling-catalogue" | "snapshot-feed" | "unspecified";
  };
  /** CS2 coverage of the market's known item catalog. Absent without a reference. */
  catalogCompleteness?: {
    basis: "known-market-catalog";
    referenceItems: number;
    coveredItems: number;
    percentage: number;
    measuredAt: string;
  };
  /**
   * 48 half-hour bars covering the trailing 24 hours, oldest first. Values are
   * 0 (stale), 1 (degraded), 2 (fresh), or null (unknown). Not provider uptime.
   */
  healthBars: readonly (number | null)[];
}

/** `GET /v1/markets/health` — a plain array of per-market health rows. */
export type MarketHealthResponse = MarketHealthRow[];
