import { expectTypeOf } from "vitest";
import type {
  AggregatePriceData,
  ArbitrageOpportunity,
  ArbitrageQuote,
  BestPrice,
  KnownMarket,
  LiquidityBulkItem,
  LiquidityResponse,
  LiquiditySummaryResponse,
  CurrentPriceResponse,
  ExecutionAdjustedBestPrice,
  FreshnessResponse,
  ItemMinPrices,
  MarketAnalyticsPoint,
  MarketAnalyticsResponse,
  MarketLatency,
  MarketMaxOrder,
  MarketFreshness,
  MarketMinPrice,
  MarketPricePoint,
  NbboBestPrice,
  PriceHistoryPoint,
  RecommendationResponse,
} from "../../src";

expectTypeOf<NbboBestPrice>().toHaveProperty("updatedAt");
expectTypeOf<NbboBestPrice>().toHaveProperty("isStale");

expectTypeOf<BestPrice>().not.toHaveProperty("updated_at");
expectTypeOf<BestPrice>().not.toHaveProperty("is_stale");
expectTypeOf<MarketMinPrice>().not.toHaveProperty("market_name");
expectTypeOf<ItemMinPrices>().not.toHaveProperty("market_hash_name");
expectTypeOf<MarketMaxOrder>().not.toHaveProperty("total_quantity");
expectTypeOf<MarketFreshness>().not.toHaveProperty("delay_seconds");
expectTypeOf<FreshnessResponse>().not.toHaveProperty("checked_at");
expectTypeOf<MarketLatency>().not.toHaveProperty("p95_latency_ms");
expectTypeOf<RecommendationResponse>().not.toHaveProperty("canonical_item_id");
expectTypeOf<MarketAnalyticsResponse>().not.toHaveProperty("calculated_at");
expectTypeOf<MarketAnalyticsPoint>().not.toHaveProperty("current_ask");
expectTypeOf<LiquidityBulkItem>().not.toHaveProperty("market_hash_name");

expectTypeOf<BestPrice["updatedAt"]>().toEqualTypeOf<string>();
expectTypeOf<BestPrice["isStale"]>().toEqualTypeOf<boolean>();
expectTypeOf<MarketMinPrice["marketName"]>().toEqualTypeOf<string>();
expectTypeOf<MarketMaxOrder["totalQuantity"]>().toEqualTypeOf<
  number | undefined
>();
expectTypeOf<ItemMinPrices["marketHashName"]>().toEqualTypeOf<string>();
expectTypeOf<MarketAnalyticsPoint["currentAsk"]>().toEqualTypeOf<
  number | null
>();
expectTypeOf<MarketAnalyticsResponse["windowHours"]>().toEqualTypeOf<number>();
expectTypeOf<
  RecommendationResponse["bestAsk"]
>().toEqualTypeOf<BestPrice | null>();
expectTypeOf<MarketFreshness["delaySeconds"]>().toEqualTypeOf<number>();
expectTypeOf<FreshnessResponse["overallStatus"]>().toEqualTypeOf<
  "healthy" | "degraded" | "stale"
>();
expectTypeOf<MarketLatency["p95LatencyMs"]>().toEqualTypeOf<number>();
expectTypeOf<LiquidityBulkItem["marketHashName"]>().toEqualTypeOf<string>();
expectTypeOf<LiquidityBulkItem["estimatedSaleTime"]>().toEqualTypeOf<string>();

expectTypeOf<ExecutionAdjustedBestPrice["appliedFeeBps"]>().toEqualTypeOf<
  number | null
>();
expectTypeOf<ExecutionAdjustedBestPrice["feeStatus"]>().toEqualTypeOf<
  "complete" | "partial" | "unknown" | undefined
>();
expectTypeOf<MarketPricePoint["valueKind"]>().toEqualTypeOf<
  "cash" | "wallet" | "bot_rate" | "unknown" | undefined
>();
expectTypeOf<MarketAnalyticsPoint["sellBasis"]>().toEqualTypeOf<
  "listing_statistic" | "lowest_ask" | undefined
>();

expectTypeOf<CurrentPriceResponse["calculatedAt"]>().toEqualTypeOf<string>();
expectTypeOf<PriceHistoryPoint["avgPrice"]>().toEqualTypeOf<number | null>();
expectTypeOf<MarketMinPrice["price"]>().toEqualTypeOf<number>();
expectTypeOf<ArbitrageOpportunity["maxTradableQuantity"]>().toEqualTypeOf<
  number | null
>();
expectTypeOf<ArbitrageOpportunity["estimatedNotionalCents"]>().toEqualTypeOf<
  number | null
>();
expectTypeOf<ArbitrageOpportunity["netSpreadBps"]>().toEqualTypeOf<number>();
expectTypeOf<ArbitrageOpportunity["sellerFeeBps"]>().toEqualTypeOf<number>();
expectTypeOf<ArbitrageOpportunity["feeModelVersion"]>().toEqualTypeOf<string>();
expectTypeOf<ArbitrageOpportunity["assumedFees"]>().toEqualTypeOf<
  boolean | undefined
>();
expectTypeOf<ArbitrageQuote["priceLevelQuantity"]>().toEqualTypeOf<
  number | null
>();

expectTypeOf<MarketPricePoint["quoteSize"]>().toEqualTypeOf<
  number | null | undefined
>();
expectTypeOf<MarketPricePoint["totalQuantity"]>().toEqualTypeOf<
  number | null | undefined
>();
expectTypeOf<MarketPricePoint["sourceUpdatedAt"]>().toEqualTypeOf<
  string | null | undefined
>();
expectTypeOf<MarketPricePoint["sourceTimeKind"]>().toEqualTypeOf<
  "payload" | "last_modified" | "cdn_age" | "none" | undefined
>();
expectTypeOf<MarketPricePoint["sourceAgeSeconds"]>().toEqualTypeOf<
  number | null | undefined
>();
expectTypeOf<MarketPricePoint>().not.toHaveProperty("isSourceStale");
expectTypeOf<MarketPricePoint["originalPriceCents"]>().toEqualTypeOf<
  number | null | undefined
>();
expectTypeOf<AggregatePriceData["basis"]>().toEqualTypeOf<
  "all_venues" | "corroborated_low_cluster" | undefined
>();

type Payout = "cash" | "wallet" | "bot_rate" | "unknown" | null | undefined;
expectTypeOf<
  LiquidityResponse["bestMarketToListPayout"]
>().toEqualTypeOf<Payout>();
expectTypeOf<
  LiquiditySummaryResponse["bestMarketToListPayout"]
>().toEqualTypeOf<Payout>();
expectTypeOf<
  LiquidityBulkItem["bestMarketToListPayout"]
>().toEqualTypeOf<Payout>();

expectTypeOf<"buff163">().toMatchTypeOf<KnownMarket>();
expectTypeOf<"a-brand-new-market">().toMatchTypeOf<KnownMarket>();
