---
"@skinpricer/sdk": minor
---

Remove `isSourceStale` from `MarketPricePoint` and `LatestPriceBidPoint`. The API never sent it, so a read type-checked but always returned `undefined`. Use `sourceAgeSeconds` to judge how old a source's data is.
