---
"@skinpricer/sdk": minor
---

- Add the camelCase name beside every snake_case response field on aggregations, market analytics, recommendations, freshness and latency status, and the bulk liquidity map, for example `marketHashName` beside `market_hash_name` and `updatedAt` beside `updated_at`. The snake_case fields are marked `@deprecated`. The API stops sending them on 2027-01-15, so switch reads to the camelCase names before then. Typed fixtures for these responses need the camelCase fields.
- `nbbo.get()` and `nbbo.depth()` send `marketHashName` instead of the deprecated `market_hash_name` query parameter, which the API rejects with a 400 error from 2027-01-15. Earlier SDK versions stop working for NBBO lookups by name on that date.
- `ValidationError.messages` lists the rejected fields and parameters from the error body's `details`, and the error message includes them. Errors take `requestId` from the response body when the `X-Request-Id` header is missing.
- Add the price-meaning fields: `priceKind` and `purchasable` on quotes and best prices, `valueKind` on bids, `sellBasis` on market analytics and sell-offer history series, `priceKind` on history responses and aggregates, `suggestedPriceKind` on recommendations, and `feeStatus` and `feeModelVersion` on execution-adjusted NBBO quotes. New exported types: `QuotePriceKind`, `ValueKind`, `SellBasis`, `FeeStatus` and `HistoryPriceKind`.
- `ExecutionAdjustedBestPrice.appliedFeeBps` and `withdrawalFlatUsdCents` can be `null` when the fees are unknown. Handle null before calculating with them.
