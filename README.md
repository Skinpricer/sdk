# @skinpricer/sdk

Official, fully-typed TypeScript SDK for the [Skinpricer](https://skinpricer.com) pricing API —
current and historical CS2 and Rust market pricing, NBBO, order-book depth,
liquidity, and item schemas. CS2 also supports arbitrage, recommendations, and attribute pricing.

- **Fully typed** — every request param and response is typed; responses mirror the API exactly.
- **Zero runtime dependencies** — built on the platform `fetch` (Node 18+, Bun, Deno, edge, browsers).
- **Typed errors** — `AuthenticationError`, `RateLimitError`, `FeatureNotAvailableError`, and more.
- **Batteries included** — request timeouts, `AbortSignal` cancellation, automatic retries with
  backoff, and rate-limit metadata.

## Install

```bash
npm install @skinpricer/sdk
# or: pnpm add @skinpricer/sdk / yarn add @skinpricer/sdk
```

Requires Node.js ≥ 18.17 (or any runtime with a global `fetch`).

## Quick start

```ts
import { SkinpricerClient, centsToUsd } from "@skinpricer/sdk";

const client = new SkinpricerClient({
  apiKey: process.env.SKINPRICER_API_KEY!,
});

const price = await client.pricing.get("AK-47 | Redline (Field-Tested)", {
  markets: ["csfloat", "buff163"],
});

console.log(price.aggregate?.minPrice); // integer USD cents
console.log(centsToUsd(price.aggregate?.minPrice ?? 0)); // 15.5
```

> **Prices are integer USD cents.** Timestamps are ISO-8601 strings. Use the opt-in helpers
> `centsToUsd` / `formatUsd` and `parseIsoDate` when you want dollars or `Date`s.

## CS2 and Rust

Existing calls use the CS2 v1 API. Select a game for the v2 API:

```ts
const rust = client.forGame("rust");
const cs2 = client.forGame("cs2");

const price = await rust.pricing.get("Tempered AK47");
const history = await rust.history.byMarket("Tempered AK47", {
  interval: "HOUR_1",
  listingType: "SELL_OFFER",
});
const liquidity = await rust.liquidity.get("Tempered AK47", {
  market: "skinport",
});
```

Game-scoped clients share authentication, retries, and rate-limit throttling with
their parent. Every request includes the selected game. Creating a scoped client
does not change other clients or the default CS2 calls.

| Resource    | Game-scoped methods for CS2 and Rust        |
| ----------- | ------------------------------------------- |
| `pricing`   | `get`, `listings`                           |
| `history`   | `get`, `byMarket`                           |
| `items`     | `search`, `searchEach`                      |
| `nbbo`      | `get`, `depth`                              |
| `liquidity` | `get`, `summary`, `batch`                   |
| `schema`    | `snapshot`, `get`, `changes`, `changesEach` |
| `markets`   | `health`                                    |

Aggregations, arbitrage, recommendations, market analytics, attribute prices,
BUFF163 attribute endpoints, freshness/latency status, and bulk item/liquidity
exports remain on the default CS2 client. They are absent from game-scoped clients.
Plan permissions apply to each endpoint. A game scope does not add features to a plan.

History responses include `effectiveInterval`, the actual bucket width of the
returned data: `10m`, `1h`, or `1d`. It can differ from the requested interval.
Sell-offer history describes observed asks. Its maximum can include extreme
listings and is not a fair-value estimate. Sales-history volume describes the
selected rolling window; summing adjacent points would count overlapping sales.

Liquidity may report `INSUFFICIENT_DATA`, with a null score and no numeric sale-time estimate.
This means there is not enough evidence for an estimate, not that no trades occur.
Rust market health can also return null counts or null history bars when the source
does not establish those values. Preserve those nulls instead of displaying zero.

## Item schemas

Use item lookups and deltas for small updates. A full snapshot contains the entire
catalog and can be large.

```ts
import { getMeta } from "@skinpricer/sdk";

const schema = client.forGame("rust").schema;
const { item } = await schema.get("Tempered AK47");
const snapshot = await schema.snapshot();
const etag = getMeta(snapshot)?.headers.get("etag");

if (etag) {
  const next = await schema.snapshot({ ifNoneMatch: etag });
  if (next !== null) {
    // Replace your cached snapshot with next.
  }
}

for await (const changed of schema.changesEach({
  since: snapshot.schemaVersion,
})) {
  // Apply changed to your local catalog.
}
```

`schema.snapshot({ ifNoneMatch })` returns `null` for HTTP 304. Delta cursors belong
to the selected game. Keep the original `since` value while paging, and save the
returned catalog version only after processing every page.

## Inventories

The default client provides `inventory.fetch`, `fetchAdvanced`, `get`, `status`,
and `history`. Inventory fetching and inspection are currently unavailable in
production. An unavailable dispatch rejects with `ServerError` and status `503`.
Previously stored snapshot, status, and history reads remain supported.

When available, fetch requests create a snapshot and dispatch Steam work. They
never retry automatically, including when POST retries are enabled elsewhere.
Advanced inspection is CS2-specific and may need up to 90 seconds; use a longer
request timeout when calling it:

```ts
const snapshot = await client.inventory.fetchAdvanced(
  { targetSteamId: steamId, maxInspections: 20 },
  { timeoutMs: 100_000 },
);
```

Basic inventory access requires the Pro plan; advanced inspection requires
Enterprise. Game-scoped clients do not expose inventory dispatch methods.

## Configuration

```ts
const client = new SkinpricerClient({
  apiKey: "sk_live_...", // required
  baseUrl: "https://pricing.skinpricer.com/v1", // default
  timeoutMs: 30_000, // per-request timeout
  authScheme: "Bearer", // or 'ApiKey'
  retry: { maxRetries: 2 }, // or `false` to disable
  headers: { "X-Tenant": "acme" }, // extra headers (Authorization is not overridable)
  // fetch: customFetch,          // bring your own fetch
});
```

## Resources

| Namespace                | Methods                                       |
| ------------------------ | --------------------------------------------- |
| `client.pricing`         | `get`, `listings`                             |
| `client.history`         | `get`, `byMarket`                             |
| `client.nbbo`            | `get`, `depth`                                |
| `client.aggregations`    | `minPrices`, `maxOrders`                      |
| `client.items`           | `search`, `all`                               |
| `client.status`          | `freshness`, `marketLatency`                  |
| `client.arbitrage`       | `opportunities`                               |
| `client.recommendations` | `get`                                         |
| `client.marketAnalytics` | `get`                                         |
| `client.attributePrices` | `latest`, `history`                           |
| `client.buff163`         | `latest`, `history`                           |
| `client.liquidity`       | `get`, `summary`, `batch`, `bulk`, `manifest` |
| `client.markets`         | `health`                                      |
| `client.schema`          | `snapshot`, `get`, `changes`, `changesEach`   |

Every method accepts an optional trailing `RequestOptions` (`{ signal, timeoutMs, retry }`).

## Error handling

```ts
import {
  SkinpricerError,
  AuthenticationError,
  FeatureNotAvailableError,
  RateLimitError,
  NotFoundError,
} from "@skinpricer/sdk";

try {
  await client.nbbo.get({ marketHashName: "AWP | Asiimov (Field-Tested)" });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Rate limited — retry after ${err.retryAfterSeconds}s`);
  } else if (err instanceof FeatureNotAvailableError) {
    console.log("Your plan does not include this endpoint.");
  } else if (err instanceof AuthenticationError) {
    console.log("Invalid or inactive API key.");
  } else if (err instanceof NotFoundError) {
    console.log("Item not tracked.");
  } else if (err instanceof SkinpricerError) {
    console.log(`API error ${err.status}: ${err.message}`);
  }
}
```

## Rate-limit metadata

Methods return the response data directly. Rate-limit headers and status are attached as
non-enumerable metadata — read them with `getMeta`:

```ts
import { getMeta } from "@skinpricer/sdk";

const nbbo = await client.nbbo.get({ id: "clx123" });
const meta = getMeta(nbbo);
console.log(meta?.rateLimit.remaining, meta?.rateLimit.resetSeconds);
```

## Cancellation & timeouts

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 1_000);

await client.items.all({ signal: controller.signal, timeoutMs: 5_000 });
```

## Power features

**Typed markets** — `markets` filters autocomplete the known market ids while still accepting any string:

```ts
import { KNOWN_MARKETS } from "@skinpricer/sdk";
await client.pricing.get(name, { markets: ["csfloat", "buff163"] }); // ↖ autocompleted
```

**Auto-pagination** — iterate every result without managing pages or cursors:

```ts
for await (const item of client.items.searchEach({ search: "AK-47" })) {
  console.log(item.name);
}
// cursor-based endpoints too:
for await (const bucket of client.attributePrices.latestEach({
  canonicalItemId,
})) {
  /* … */
}
```

**Auto-batching** — `minPricesAll` / `maxOrdersAll` transparently chunk >100 ids (the server cap) with bounded concurrency and merge the results:

```ts
const { items } = await client.aggregations.minPricesAll(thousandsOfIds, {
  concurrency: 5,
});
```

`minPrices` / `maxOrders` also accept `marketHashNames` instead of `ids` (provide either one):

```ts
await client.aggregations.minPrices({
  marketHashNames: ["AK-47 | Redline (Field-Tested)"],
});
```

**Proactive rate-limit throttling** (opt-in) — when a response reports `X-RateLimit-Remaining: 0`, the client waits for the window to reset instead of firing a request that is guaranteed to 429:

```ts
const client = new SkinpricerClient({ apiKey, autoThrottle: true });
```

**Observability hooks** — for logging, metrics, and tracing (hook errors never break a request):

```ts
const client = new SkinpricerClient({
  apiKey,
  hooks: {
    onRequest: ({ method, url, attempt }) =>
      log.debug({ method, url, attempt }),
    onResponse: ({ status, rateLimit }) =>
      metrics.record(status, rateLimit.remaining),
    onRetry: ({ attempt, delayMs, status }) =>
      log.warn(`retry #${attempt + 1} in ${delayMs}ms (status ${status})`),
  },
});
```

## Local verification

Run the same checks before opening a pull request. Tests use one worker to keep
memory use bounded. The GitHub workflow runs only when started manually.

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm exec vitest run --coverage --maxWorkers=1 --minWorkers=1 --no-file-parallelism
pnpm build
pnpm check:package
```

## License

MIT
