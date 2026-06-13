# @skinpricer/sdk

Official, fully-typed TypeScript SDK for the [Skinpricer](https://skinpricer.com) pricing API —
real-time and historical CS2 skin market pricing, NBBO, order-book depth, arbitrage,
recommendations, and attribute (float/fade/tag) pricing.

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

| Namespace                | Methods                      |
| ------------------------ | ---------------------------- |
| `client.pricing`         | `get`, `listings`            |
| `client.history`         | `get`, `byMarket`            |
| `client.nbbo`            | `get`, `depth`               |
| `client.aggregations`    | `minPrices`, `maxOrders`     |
| `client.items`           | `search`, `all`              |
| `client.status`          | `freshness`, `marketLatency` |
| `client.arbitrage`       | `opportunities`              |
| `client.recommendations` | `get`                        |
| `client.marketAnalytics` | `get`                        |
| `client.attributePrices` | `latest`, `history`          |
| `client.buff163`         | `latest`, `history`          |

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

## License

MIT
