---
"@skinpricer/sdk": minor
---

Add game-scoped CS2 and Rust clients, item schema snapshots and deltas, and updated history, liquidity, and market-health types. Preserve the existing CS2 API methods. Keep public market-health requests keyless and enforce request timeouts while reading response bodies.

Add typed inventory fetch, inspection, snapshot, status, and history methods. Inventory dispatch requests never retry automatically and report service unavailability through ServerError with status 503.

History types now require effectiveInterval. Market health counts and bars can be null, and the CS2 liquidity market list replaces csdeals with steamcommunity. Consumers with strict fixtures or exhaustive switches should update them to match these response contracts.
