---
"@skinpricer/sdk": minor
---

- `MarketPricePoint.quoteSize` and `totalQuantity` can be `null` when a source publishes a best bid without its size. Null means unknown, not zero. Handle it before calculating a trade size.
