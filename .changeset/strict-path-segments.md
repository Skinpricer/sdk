---
"@skinpricer/sdk": patch
---

Reject empty, `.` and `..` path segments with a `ConfigurationError` before any request is sent. URL parsing resolves those segments, so a call such as `schema.get("..")` previously reached a different endpoint.

The CS2 client's `liquidity.get("items")` now rejects with a `ConfigurationError` instead of requesting the whole-catalog map. Use `liquidity.bulk()` for that map.
