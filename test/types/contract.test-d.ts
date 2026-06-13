import { expectTypeOf } from "vitest";
import type {
  BestPrice,
  KnownMarket,
  CurrentPriceResponse,
  MarketAnalyticsResponse,
  MarketFreshness,
  MarketMinPrice,
  NbboBestPrice,
  PriceHistoryPoint,
  RecommendationResponse,
} from "../../src";

expectTypeOf<NbboBestPrice>().toHaveProperty("updatedAt");
expectTypeOf<NbboBestPrice>().toHaveProperty("isStale");

expectTypeOf<BestPrice>().toHaveProperty("updated_at");
expectTypeOf<BestPrice>().toHaveProperty("is_stale");
expectTypeOf<MarketMinPrice>().toHaveProperty("market_name");
expectTypeOf<MarketFreshness>().toHaveProperty("delay_seconds");
expectTypeOf<RecommendationResponse>().toHaveProperty("canonical_item_id");
expectTypeOf<MarketAnalyticsResponse>().toHaveProperty("calculated_at");

expectTypeOf<CurrentPriceResponse["calculatedAt"]>().toEqualTypeOf<string>();
expectTypeOf<PriceHistoryPoint["avgPrice"]>().toEqualTypeOf<number | null>();
expectTypeOf<MarketMinPrice["price"]>().toEqualTypeOf<number>();

expectTypeOf<"buff163">().toMatchTypeOf<KnownMarket>();
expectTypeOf<"a-brand-new-market">().toMatchTypeOf<KnownMarket>();
