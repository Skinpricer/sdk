---
"@skinpricer/sdk": minor
---

Add `history.batch()` to game-scoped clients for `POST /v2/pricing/history/batch`. It reads the aggregate history of up to 100 items (market hash names, slugs or canonical item ids) in one request and takes the single read's `from`, `to`, `interval`, `listingType`, `salesWindow`, `basis` and `currency`. The response keys `items` and `errors` by the entry as sent; an entry that matches no item (404) or several (409) is listed in `errors` and the others are still served. With a `currency` other than USD, `fx` gives the one rate used. The batch shares the 10,000-point budget of a single read (twice the buckets for `SALE_HISTORY`), takes at most 25 items in 10m buckets, and costs 5 rate-limit units per distinct item.
