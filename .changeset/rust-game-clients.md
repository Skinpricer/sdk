---
"@skinpricer/sdk": minor
---

Add game-scoped CS2 and Rust clients, item schema snapshots and deltas, and updated history, liquidity, and market-health types. Preserve the existing CS2 API methods. Keep public market-health requests keyless and enforce request timeouts while reading response bodies.

History types now require effectiveInterval. Market health counts and bars can be null, and the CS2 liquidity market list replaces csdeals with steamcommunity. Consumers with strict fixtures or exhaustive switches should update them to match these response contracts.

Arbitrage types now include each quote's priceLevelQuantity, seller-net spread, and fee metadata. Capacity and estimated notional can be null when capacity at the displayed prices is unverified. Handle nullable fields before calculations and update typed fixtures to include the added response fields. The minimum notional still defaults to 1000 cents; positive values require verified capacity, while an explicit zero also includes indicative price pairs.
