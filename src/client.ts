import { type ClientConfig, resolveConfig } from "./config";
import { HttpClient } from "./http/http-client";
import { AggregationsResource } from "./resources/aggregations";
import { ArbitrageResource } from "./resources/arbitrage";
import { AttributePricesResource } from "./resources/attribute-prices";
import { Buff163Resource } from "./resources/buff163";
import { HistoryResource } from "./resources/history";
import { ItemsResource } from "./resources/items";
import { MarketAnalyticsResource } from "./resources/market-analytics";
import { NbboResource } from "./resources/nbbo";
import { PricingResource } from "./resources/pricing";
import { RecommendationsResource } from "./resources/recommendations";
import { StatusResource } from "./resources/status";

export class SkinpricerClient {
  readonly pricing: PricingResource;
  readonly history: HistoryResource;
  readonly nbbo: NbboResource;
  readonly aggregations: AggregationsResource;
  readonly items: ItemsResource;
  readonly status: StatusResource;
  readonly arbitrage: ArbitrageResource;
  readonly recommendations: RecommendationsResource;
  readonly marketAnalytics: MarketAnalyticsResource;
  readonly attributePrices: AttributePricesResource;
  readonly buff163: Buff163Resource;

  private readonly httpClient: HttpClient;

  constructor(config: ClientConfig) {
    this.httpClient = new HttpClient(resolveConfig(config));

    this.pricing = new PricingResource(this.httpClient);
    this.history = new HistoryResource(this.httpClient);
    this.nbbo = new NbboResource(this.httpClient);
    this.aggregations = new AggregationsResource(this.httpClient);
    this.items = new ItemsResource(this.httpClient);
    this.status = new StatusResource(this.httpClient);
    this.arbitrage = new ArbitrageResource(this.httpClient);
    this.recommendations = new RecommendationsResource(this.httpClient);
    this.marketAnalytics = new MarketAnalyticsResource(this.httpClient);
    this.attributePrices = new AttributePricesResource(this.httpClient);
    this.buff163 = new Buff163Resource(this.httpClient);
  }
}
