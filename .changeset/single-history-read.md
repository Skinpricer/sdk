---
"@skinpricer/sdk": minor
---

`history.get()` takes `basis` for combined `SALE_HISTORY`. On game-scoped clients, `history.get()` and `history.byMarket()` also take `currency`, which converts every price at the one rate given in `fx`. The v1 history routes reject `currency`, so the default client's params do not accept it. `PriceHistoryResponse` adds the fields the API sends: `basis`, `statistic`, `volumeBasis` and `steamWallet` on combined `SALE_HISTORY`, `corrections` when stored history known to be wrong was left out, and `fx`. `PriceHistoryByMarketResponse` adds `corrections` and `fx`. Batch items share `PriceHistoryResponse`, so they carry the same fields. New exported types: `GamePriceHistoryParams`, `HistoryCorrection` and `SteamWalletHistory`.
