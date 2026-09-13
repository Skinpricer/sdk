import { expectTypeOf } from "vitest";
import {
  SkinpricerClient,
  type PriceHistoryResponse,
  type LiquidityBadge,
  type SchemaSnapshotResponse,
} from "../../src";
const client = new SkinpricerClient({ apiKey: "test-key" });
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
