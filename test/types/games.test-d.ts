import { expectTypeOf } from "vitest";
import {
  SkinpricerClient,
  type PriceHistoryResponse,
  type LiquidityBadge,
  type LiquidityBulkManifest,
  type LiquidityBulkResponse,
  type LatestPriceBidPoint,
  type LatestPricesResponse,
  type SchemaSnapshotResponse,
} from "../../src";
const client = new SkinpricerClient({ apiKey: "test-key" });
expectTypeOf<keyof SkinpricerClient>().toEqualTypeOf<
  | "pricing"
  | "history"
  | "nbbo"
  | "aggregations"
  | "items"
  | "status"
  | "arbitrage"
  | "recommendations"
  | "marketAnalytics"
  | "attributePrices"
  | "buff163"
  | "liquidity"
  | "markets"
  | "schema"
  | "prices"
  | "forGame"
>();
const rust = client.forGame("rust");
expectTypeOf(rust.game).toEqualTypeOf<"rust">();
expectTypeOf(rust.liquidity.get)
  .parameter(1)
  .toMatchTypeOf<{ market?: "skinport" | "rusttm" } | undefined>();
expectTypeOf<PriceHistoryResponse["effectiveInterval"]>().toEqualTypeOf<
  "10m" | "1h" | "1d"
>();
expectTypeOf<"INSUFFICIENT_DATA">().toMatchTypeOf<LiquidityBadge>();
expectTypeOf(client.schema.snapshot()).toEqualTypeOf<
  Promise<SchemaSnapshotResponse>
>();
expectTypeOf(client.schema.snapshot({ ifNoneMatch: '"1"' })).toEqualTypeOf<
  Promise<SchemaSnapshotResponse | null>
>();
expectTypeOf(client.liquidity.bulk()).toEqualTypeOf<
  Promise<LiquidityBulkResponse>
>();
expectTypeOf(client.liquidity.bulk({ ifNoneMatch: '"1"' })).toEqualTypeOf<
  Promise<LiquidityBulkResponse | null>
>();
expectTypeOf(client.liquidity.manifest()).toEqualTypeOf<
  Promise<LiquidityBulkManifest>
>();
expectTypeOf(client.liquidity.manifest({ ifNoneMatch: '"1"' })).toEqualTypeOf<
  Promise<LiquidityBulkManifest | null>
>();
expectTypeOf(client.prices.latestAll({ game: "rust" })).toEqualTypeOf<
  Promise<LatestPricesResponse>
>();
expectTypeOf(
  client.prices.latestAll({ game: "cs2", ifNoneMatch: 'W/"1"' }),
).toEqualTypeOf<Promise<LatestPricesResponse | null>>();
expectTypeOf<LatestPriceBidPoint["quoteSize"]>().toEqualTypeOf<number | null>();
// @ts-expect-error The snapshot requires a game.
void client.prices.latestAll({});
// @ts-expect-error The snapshot accepts only CS2 and Rust.
void client.prices.latestAll({ game: "tf2" });
// @ts-expect-error The snapshot is on the root client and takes the game as a parameter.
void rust.prices;
// @ts-expect-error Rust has no attribute price endpoint.
void rust.attributePrices;
// @ts-expect-error Game-scoped bulk liquidity is unavailable.
void rust.liquidity.bulk;
// @ts-expect-error Rust liquidity does not support CS2-only markets.
void rust.liquidity.get("Tempered AK47", { market: "csfloat" });

import type { MarketHealthRow } from "../../src";
expectTypeOf<"observed-empty">().toMatchTypeOf<
  MarketHealthRow["listingsCountBasis"]
>();
expectTypeOf<MarketHealthRow["healthBars"]>().toEqualTypeOf<
  readonly (number | null)[]
>();
expectTypeOf<MarketHealthRow["freshnessCoveragePct"]>().toEqualTypeOf<
  number | null
>();
