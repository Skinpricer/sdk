---
"@skinpricer/sdk": minor
---

Remove the snake_case response fields from the aggregations, market analytics, recommendations, freshness and latency status, and bulk liquidity map types, including `BestPrice.updated_at` and `is_stale`. The API no longer sends them, so a read such as `item.market_hash_name` type-checked but returned `undefined`. Read the camelCase names instead (`marketHashName`, `updatedAt`, `isStale`). Typed fixtures for these responses no longer need the snake_case fields.
