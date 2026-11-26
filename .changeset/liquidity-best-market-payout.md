---
"@skinpricer/sdk": minor
---

Add `bestMarketToListPayout` to `LiquidityResponse`, `LiquiditySummaryResponse` and `LiquidityBulkItem`, plus the `LiquidityPayout` type. It says what `bestMarketToList` pays the seller: `cash`, `wallet`, `bot_rate` or `unknown`, and is null exactly when `bestMarketToList` is null. `wallet` means Steam Community Market, which pays Steam Wallet funds that cannot be withdrawn. Check it before treating the best market as a cash exit.
