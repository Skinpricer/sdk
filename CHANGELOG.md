# @skinpricer/sdk

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
