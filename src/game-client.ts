import { ConfigurationError } from "./errors/network-errors";
import type { HttpClient } from "./http/http-client";
import { HistoryResource } from "./resources/history";
import { ItemSearchResource } from "./resources/items";
import { ItemLiquidityResource } from "./resources/liquidity";
import { MarketsResource } from "./resources/markets";
import { NbboResource } from "./resources/nbbo";
import { PricingResource } from "./resources/pricing";
import { SchemaResource } from "./resources/schema";
import type { Game } from "./types/games";
import type { LiquidityMarketForGame } from "./types/liquidity";

/** Game-scoped v2 resources. Construct with `client.forGame(game)`. */
export class GameClient<G extends Game> {
  readonly pricing: PricingResource;
  readonly history: HistoryResource;
  readonly items: ItemSearchResource;
  readonly nbbo: NbboResource;
  readonly liquidity: ItemLiquidityResource<LiquidityMarketForGame<G>>;
  readonly schema: SchemaResource;
  readonly markets: MarketsResource;

  constructor(
    http: HttpClient,
    readonly game: G,
  ) {
    if (game !== "cs2" && game !== "rust") {
      throw new ConfigurationError('The game must be "cs2" or "rust".');
    }
    this.pricing = new PricingResource(http, game);
    this.history = new HistoryResource(http, game);
    this.items = new ItemSearchResource(http, game);
    this.nbbo = new NbboResource(http, game);
    this.liquidity = new ItemLiquidityResource(http, game);
    this.schema = new SchemaResource(http, game);
    this.markets = new MarketsResource(http, game);
  }
}
