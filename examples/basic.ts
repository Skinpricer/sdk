import { SkinpricerClient, centsToUsd, formatUsd, getMeta } from "../src";

async function main(): Promise<void> {
  const client = new SkinpricerClient({
    apiKey: process.env.SKINPRICER_API_KEY ?? "sk_test_replace_me",
  });

  const marketHashName = "AK-47 | Redline (Field-Tested)";

  const price = await client.pricing.get(marketHashName, {
    markets: ["csfloat", "buff163"],
  });

  console.log(`${price.name}`);
  console.log(`  min: ${formatUsd(price.aggregate?.minPrice ?? 0)}`);
  console.log(
    `  best ask: ${price.bestAsk ? centsToUsd(price.bestAsk.price) : "n/a"}`,
  );

  const nbbo = await client.nbbo.get({ marketHashName });
  console.log(`  NBBO spread (bps): ${nbbo.spreadBps ?? "n/a"}`);

  const meta = getMeta(price);
  console.log(
    `  rate limit remaining: ${meta?.rateLimit.remaining ?? "unknown"}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
