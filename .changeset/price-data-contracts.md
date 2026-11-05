---
"@skinpricer/sdk": minor
---

- `MarketPricePoint.quoteSize` and `totalQuantity` can be `null` when a source publishes a best bid without its size. Null means unknown, not zero. Handle it before calculating a trade size.
- Add `sourceUpdatedAt`, `sourceTimeKind`, `sourceAgeSeconds` and `isSourceStale` to `MarketPricePoint`, plus the `SourceTimeKind` type. They describe when the source produced its data and are absent when that is unknown. `fetchedAt` is when a price was last read or confirmed still current, not the age of the data.
- `MarketHealthRow.healthBars` and `freshnessCoveragePct` are now required, as every response includes them. Both games return 48 half-hour bars covering the trailing 24 hours. CS2 rows can include `catalogCompleteness`.
- `liquidity.bulk()` and `liquidity.manifest()` accept `{ ifNoneMatch }` and return `null` when the snapshot is unchanged (HTTP 304), like `schema.snapshot()`. Request options are now their second argument: replace `bulk({ signal })` with `bulk(undefined, { signal })`.
