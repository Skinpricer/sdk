/**
 * Market ids the API integrates — the canonical join keys returned by
 * `GET /v1/markets/health` and used across pricing / nbbo / aggregation
 * responses. Kept in sync with that registry (18 integrated markets as of
 * 2026-06). A market id appears here once the backend integrates it, regardless
 * of live/degraded/stale status; ids prepared but not yet ingesting (e.g.
 * bitskins, skinbaron) are intentionally excluded until they show in health.
 */
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
  lastEventAt: string;
  listingsCount: number;
  /**
   * Optional 48 × 5-min uptime tiers covering the trailing 4h. Each entry is
   * 0 (down) / 1 (degraded) / 2 (live), oldest first. Absent when the backend
   * doesn't yet emit per-bucket health.
   */
  healthBars?: readonly number[];
}

/** `GET /v1/markets/health` — a plain array of per-market health rows. */
export type MarketHealthResponse = MarketHealthRow[];
