---
"@skinpricer/sdk": minor
---

`PriceHistoryPoint` adds the fields the API sends: `netBestBidCents` and `netSpreadBps`, `contributingMarkets` and `observations` on combined `SALE_HISTORY`, and `originalPriceCents` and `originalCurrency` on per-market `SELL_OFFER`. New exported type: `SaleHistoryObservation`.

`priceKind` is now required on `PriceHistoryResponse` and `PriceHistoryByMarketResponse`, and `MarketSeries` adds the required `fxBasis`: `native` when the market quotes USD, `historical` when each value was converted to USD at the rate when it was observed, so the series also moves with FX. The API always sends both; typed fixtures need them.
