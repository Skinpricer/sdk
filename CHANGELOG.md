# @skinpricer/sdk

## 0.4.0

### Breaking changes

- `liquidity.bulk()` and `liquidity.manifest()` take request options as their second argument: `bulk({ signal })` becomes `bulk(undefined, { signal })`.
- `MarketPricePoint.quoteSize` and `totalQuantity` can be `null`.
- `MarketHealthRow.healthBars` and `freshnessCoveragePct` are required, and history types require `effectiveInterval`.
- The CS2 liquidity market list replaces `csdeals` with `steamcommunity`.
- The CS2 client's `liquidity.get("items")` rejects with a `ConfigurationError`; use `liquidity.bulk()` for the whole-catalog map.

### Minor Changes

- edb9ed7: - `MarketPricePoint.quoteSize` and `totalQuantity` can be `null` when a source publishes a best bid without its size. Null means unknown, not zero. Handle it before calculating a trade size.
  - Add `sourceUpdatedAt`, `sourceTimeKind`, `sourceAgeSeconds` and `isSourceStale` to `MarketPricePoint`, plus the `SourceTimeKind` type. They describe when the source produced its data and are absent when that is unknown. `fetchedAt` is when a price was last read or confirmed still current, not the age of the data.
  - `MarketHealthRow.healthBars` and `freshnessCoveragePct` are now required, as every response includes them. Both games return 48 half-hour bars covering the trailing 24 hours. CS2 rows can include `catalogCompleteness`.
  - `liquidity.bulk()` and `liquidity.manifest()` accept `{ ifNoneMatch }` and return `null` when the snapshot is unchanged (HTTP 304), like `schema.snapshot()`. Request options are now their second argument: replace `bulk({ signal })` with `bulk(undefined, { signal })`.
  - Add `client.prices.latestAll({ game })` for `GET /v2/prices/latest`, the Enterprise snapshot of every item of one game with each market's ask and bid. It accepts `ifNoneMatch` and returns `null` when the snapshot is unchanged. New exports: `PricesResource`, `LatestPricesParams`, `LatestPricesResponse`, `LatestPriceItem`, `LatestPricePoint`, `LatestPriceAskPoint` and `LatestPriceBidPoint`.
  - Add `originalPriceCents`, `originalCurrency`, `totalOrdersCount`, `orderBookComplete` and `outlier` to `MarketPricePoint`, and `basis` to `AggregatePriceData`. `KNOWN_MARKETS` adds `rapidskins` and `youpin`.
- 109fced: Add game-scoped CS2 and Rust clients, item schema snapshots and deltas, and updated history, liquidity, and market-health types. Preserve the existing CS2 API methods. Keep public market-health requests keyless and enforce request timeouts while reading response bodies.

  History types now require effectiveInterval. Market health counts and bars can be null, and the CS2 liquidity market list replaces csdeals with steamcommunity. Consumers with strict fixtures or exhaustive switches should update them to match these response contracts.

  Arbitrage types now include each quote's priceLevelQuantity, seller-net spread, and fee metadata. Capacity and estimated notional can be null when capacity at the displayed prices is unverified. Handle nullable fields before calculations and update typed fixtures to include the added response fields. The minimum notional still defaults to 1000 cents; positive values require verified capacity, while an explicit zero also includes indicative price pairs.

### Patch Changes

- 0f3eff4: Reject empty, `.` and `..` path segments with a `ConfigurationError` before any request is sent. URL parsing resolves those segments, so a call such as `schema.get("..")` previously reached a different endpoint.

  The CS2 client's `liquidity.get("items")` now rejects with a `ConfigurationError` instead of requesting the whole-catalog map. Use `liquidity.bulk()` for that map.

## 0.3.0

### Minor Changes

- e114c14: Add liquidity and market-health resources, market-hash-name aggregation lookups, and sync the integrated-market list.

  - New `liquidity` resource: `client.liquidity.get()`, `.summary()`, `.batch()`, `.bulk()`, and `.manifest()` for cross-market liquidity and expected time-to-sell. Exports `LiquidityResponse`, `LiquiditySummaryResponse`, `LiquidityBatchResponse`, `LiquidityBulkResponse`, `LiquidityBulkManifest`, `LiquidityBulkItem`, `LiquidityMarketMetric`, `LiquidityParams`, `LiquidityBatchBody`, plus the `LIQUIDITY_BADGES`, `LIQUIDITY_CONFIDENCE`, `LIQUIDITY_LABELS`, and `SUPPORTED_LIQUIDITY_MARKETS` constants.
  - New `markets` resource: `client.markets.health()` returns per-market integration status as `MarketHealthRow[]`. It targets the public API host via the new `publicBaseUrl` config (derived from `baseUrl` by default), exported as `DEFAULT_PUBLIC_BASE_URL`.
  - `aggregations.minPrices()` and `aggregations.maxOrders()` now accept `marketHashNames` as an alternative to `ids`.
  - `KNOWN_MARKETS` now lists all 18 integrated markets (adds `avanmarket` and `csdeals`).

## 0.2.0

### Minor Changes

- 37a3bb0: Add `executionAdjusted` to the NBBO response (`client.nbbo.get()`): fee- and executability-adjusted best bid/ask (`price`, `rawPrice`, `appliedFeeBps`, `withdrawalFlatUsdCents`, `executability`, `reasons`) plus `spreadBps`, `locked`, `crossed`, `executableConfidence`, `reasons`, and `feeModelVersion`. Adds exported types `ExecutionAdjustedNbbo` and `ExecutionAdjustedBestPrice`.

## 0.1.0

Initial release.

- `SkinpricerClient` with typed resource namespaces for all 19 API-key-protected pricing endpoints:
  `pricing`, `history`, `nbbo`, `aggregations`, `items`, `status`, `arbitrage`, `recommendations`,
  `marketAnalytics`, `attributePrices`, `buff163`.
- Zero runtime dependencies — built on the platform `fetch`.
- Typed error hierarchy (`AuthenticationError`, `FeatureNotAvailableError`, `RateLimitError`,
  `ValidationError`, `NotFoundError`, `ServerError`, `NetworkError`, `TimeoutError`).
- Rate-limit metadata, request timeouts, `AbortSignal` cancellation, and GET-only retry with backoff.
- Opt-in money helpers (`centsToUsd`, `formatUsd`) and `parseIsoDate`.
