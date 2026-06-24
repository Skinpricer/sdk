---
"@skinpricer/sdk": minor
---

Add liquidity and market-health resources, market-hash-name aggregation lookups, and sync the integrated-market list.

- New `liquidity` resource: `client.liquidity.get()`, `.summary()`, `.batch()`, `.bulk()`, and `.manifest()` for cross-market liquidity and expected time-to-sell. Exports `LiquidityResponse`, `LiquiditySummaryResponse`, `LiquidityBatchResponse`, `LiquidityBulkResponse`, `LiquidityBulkManifest`, `LiquidityBulkItem`, `LiquidityMarketMetric`, `LiquidityParams`, `LiquidityBatchBody`, plus the `LIQUIDITY_BADGES`, `LIQUIDITY_CONFIDENCE`, `LIQUIDITY_LABELS`, and `SUPPORTED_LIQUIDITY_MARKETS` constants.
- New `markets` resource: `client.markets.health()` returns per-market integration status as `MarketHealthRow[]`. It targets the public API host via the new `publicBaseUrl` config (derived from `baseUrl` by default), exported as `DEFAULT_PUBLIC_BASE_URL`.
- `aggregations.minPrices()` and `aggregations.maxOrders()` now accept `marketHashNames` as an alternative to `ids`.
- `KNOWN_MARKETS` now lists all 18 integrated markets (adds `avanmarket` and `csdeals`).
