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
  "avanmarket",
  "tradeit-store",
  "tradeit-trade",
  "steamcommunity",
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
  freshnessCoveragePct?: number | null;
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
  /**
   * 48 bars, oldest first: CS2 uses five-minute ingest health bars over four hours;
   * Rust uses half-hour pricing freshness bars over 24 hours. Values are
   * 0 (stale), 1 (degraded), 2 (fresh), or null (unknown). Not provider uptime.
   */
  healthBars?: readonly (number | null)[];
}

/** `GET /v1/markets/health` — a plain array of per-market health rows. */
export type MarketHealthResponse = MarketHealthRow[];
