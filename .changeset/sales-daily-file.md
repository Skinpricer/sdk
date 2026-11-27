---
"@skinpricer/sdk": minor
---

Add `sales.daily({ game, date, ifNoneMatch })` for `GET /v2/sales/daily` (Pro and Enterprise). It downloads one closed UTC day's sales file, decompresses the gzip NDJSON and returns `{ etag, final, receivedThrough, rows }`, where each row is a `SalesDailyRow`. Counts, medians, means and USD amounts are `null` when unknown, never `0`. With a matching `ifNoneMatch` the method returns `null` for HTTP 304. A non-final file is replaced once by a final build that adds late sales, so keep the ETag and ask again.
