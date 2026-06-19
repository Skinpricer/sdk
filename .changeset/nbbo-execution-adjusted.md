---
"@skinpricer/sdk": minor
---

Add `executionAdjusted` to the NBBO response (`client.nbbo.get()`): fee- and executability-adjusted best bid/ask (`price`, `rawPrice`, `appliedFeeBps`, `withdrawalFlatUsdCents`, `executability`, `reasons`) plus `spreadBps`, `locked`, `crossed`, `executableConfidence`, `reasons`, and `feeModelVersion`. Adds exported types `ExecutionAdjustedNbbo` and `ExecutionAdjustedBestPrice`.
