/** Market ids the API integrates. */
export const KNOWN_MARKETS = [
  "skinport",
  "skindeck",
  "buff163",
  "csfloat",
  "marketcsgo",
  "cstrade",
  "dmarket",
  "itrade",
  "lis-skins",
  "swapgg",
  "whitemarket",
  "waxpeer",
  "lootfarm",
  "tradeit-store",
  "tradeit-trade",
  "steamcommunity",
] as const;

/** A known market id, or any other string. */
export type KnownMarket =
  | (typeof KNOWN_MARKETS)[number]
  | (string & Record<never, never>);

/** Markets that expose attribute (float/fade/tag) bucket pricing. */
export const ATTRIBUTE_MARKETS = [
  "buff163",
  "steamcommunity",
  "marketcsgo",
  "csfloat",
  "dmarket",
] as const;

export type AttributeMarket =
  | (typeof ATTRIBUTE_MARKETS)[number]
  | (string & Record<never, never>);
