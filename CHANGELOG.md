# @skinpricer/sdk

## Unreleased

### Breaking changes

- The snake_case response fields are gone from the aggregations, market analytics, recommendations, freshness and latency status, and bulk liquidity map types, because the API no longer sends them. Read the camelCase names instead, for example `marketHashName` for `market_hash_name`.

## 0.5.0

### Breaking changes

- `ExecutionAdjustedBestPrice.appliedFeeBps` and `withdrawalFlatUsdCents` can be `null`.
- Typed fixtures for aggregations, market analytics, recommendations, freshness and latency status, and the bulk liquidity map need the new camelCase fields.
- Earlier SDK versions stop working for NBBO lookups by name on 2027-01-15, when the API rejects `market_hash_name`. Upgrade before then.

### Minor Changes

- 8364e62: - Add the camelCase name beside every snake_case response field on aggregations, market analytics, recommendations, freshness and latency status, and the bulk liquidity map, for example `marketHashName` beside `market_hash_name` and `updatedAt` beside `updated_at`. The snake_case fields are marked `@deprecated`. The API stops sending them on 2027-01-15, so switch reads to the camelCase names before then. Typed fixtures for these responses need the camelCase fields.
  - `nbbo.get()` and `nbbo.depth()` send `marketHashName` instead of the deprecated `market_hash_name` query parameter, which the API rejects with a 400 error from 2027-01-15. Earlier SDK versions stop working for NBBO lookups by name on that date.
  - `ValidationError.messages` lists the rejected fields and parameters from the error body's `details`, and the error message includes them. Errors take `requestId` from the response body when the `X-Request-Id` header is missing.
  - Add the price-meaning fields: `priceKind` and `purchasable` on quotes and best prices, `valueKind` on bids, `sellBasis` on market analytics and sell-offer history series, `priceKind` on history responses and aggregates, `suggestedPriceKind` on recommendations, and `feeStatus` and `feeModelVersion` on execution-adjusted NBBO quotes. New exported types: `QuotePriceKind`, `ValueKind`, `SellBasis`, `FeeStatus` and `HistoryPriceKind`.
  - `ExecutionAdjustedBestPrice.appliedFeeBps` and `withdrawalFlatUsdCents` can be `null` when the fees are unknown. Handle null before calculating with them.
- 038b323: Add `bestMarketToListPayout` to `LiquidityResponse`, `LiquiditySummaryResponse` and `LiquidityBulkItem`, plus the `LiquidityPayout` type. It says what `bestMarketToList` pays the seller: `cash`, `wallet`, `bot_rate` or `unknown`, and is null exactly when `bestMarketToList` is null. `wallet` means Steam Community Market, which pays Steam Wallet funds that cannot be withdrawn. Check it before treating the best market as a cash exit.

### Patch Changes

- 9253aff: Document the `candidateLimit` range of `arbitrage.opportunities()` as 50–1000. The API rejects values above 1000 with a 400 error.

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
