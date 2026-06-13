# @skinpricer/sdk

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
