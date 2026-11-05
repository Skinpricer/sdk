import { expectTypeOf } from "vitest";
import {
  SkinpricerClient,
  type PriceHistoryResponse,
  type LiquidityBadge,
  type LiquidityBulkManifest,
  type LiquidityBulkResponse,
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
