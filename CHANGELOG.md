# @skinpricer/sdk

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
