import {
  SkinpricerClient,
  AuthenticationError,
  FeatureNotAvailableError,
  NotFoundError,
  RateLimitError,
  SkinpricerError,
} from "../src";

async function main(): Promise<void> {
  const client = new SkinpricerClient({
    apiKey: process.env.SKINPRICER_API_KEY ?? "sk_test_replace_me",
  });

  try {
    const history = await client.history.get("AWP | Asiimov (Field-Tested)", {
      interval: "HOUR_1",
      listingType: "SALE_HISTORY",
      salesWindow: "30d",
    });
    console.log(`history points: ${history.history.length}`);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.error(`Rate limited; retry after ${error.retryAfterSeconds}s`);
    } else if (error instanceof FeatureNotAvailableError) {
      console.error("Historical data is not included in your plan.");
    } else if (error instanceof AuthenticationError) {
      console.error("Invalid or inactive API key.");
    } else if (error instanceof NotFoundError) {
      console.error("Item not tracked.");
    } else if (error instanceof SkinpricerError) {
      console.error(`API error ${error.status ?? "?"}: ${error.message}`);
    } else {
      throw error;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
