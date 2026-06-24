import type { RequestOptions } from "../http/http-client";
import type {
  AggregationsParams,
  ItemMaxOrders,
  ItemMinPrices,
  MaxOrdersResponse,
  MinPricesResponse,
} from "../types/aggregations";
import type { KnownMarket } from "../types/markets";
import { chunk, mapWithConcurrency } from "../utils/batch";
import { BaseResource } from "./resource";

const MAX_IDS_PER_REQUEST = 100;
const DEFAULT_BATCH_CONCURRENCY = 5;

export interface AggregationsBatchParams {
  markets?: KnownMarket[];
  concurrency?: number;
}

export class AggregationsResource extends BaseResource {
  /** GET /v1/aggregations/min-prices — minimum sell price per market. Pass up to 100 `ids` or `marketHashNames`. */
  minPrices(
    params: AggregationsParams,
    options?: RequestOptions,
  ): Promise<MinPricesResponse> {
    return this.call<MinPricesResponse>(
      {
        method: "GET",
        path: "/aggregations/min-prices",
        query: {
          ids: params.ids,
          marketHashNames: params.marketHashNames,
          markets: params.markets,
        },
      },
      options,
    );
  }

  /** GET /v1/aggregations/max-orders — maximum buy order per market. Pass up to 100 `ids` or `marketHashNames`. */
  maxOrders(
    params: AggregationsParams,
    options?: RequestOptions,
  ): Promise<MaxOrdersResponse> {
    return this.call<MaxOrdersResponse>(
      {
        method: "GET",
        path: "/aggregations/max-orders",
        query: {
          ids: params.ids,
          marketHashNames: params.marketHashNames,
          markets: params.markets,
        },
      },
      options,
    );
  }

  /** Like `minPrices` but splits more than 100 ids into batches and merges them. */
  async minPricesAll(
    ids: string[],
    params: AggregationsBatchParams = {},
    options?: RequestOptions,
  ): Promise<MinPricesResponse> {
    const items = await this.runBatched<ItemMinPrices>(
      ids,
      params,
      (chunkIds) =>
        this.minPrices(
          { ids: chunkIds, markets: params.markets },
          options,
        ).then((res) => res.items),
    );
    return { items };
  }

  /** Like `maxOrders` but splits more than 100 ids into batches and merges them. */
  async maxOrdersAll(
    ids: string[],
    params: AggregationsBatchParams = {},
    options?: RequestOptions,
  ): Promise<MaxOrdersResponse> {
    const items = await this.runBatched<ItemMaxOrders>(
      ids,
      params,
      (chunkIds) =>
        this.maxOrders(
          { ids: chunkIds, markets: params.markets },
          options,
        ).then((res) => res.items),
    );
    return { items };
  }

  private async runBatched<T>(
    ids: string[],
    params: AggregationsBatchParams,
    fetchChunk: (chunkIds: string[]) => Promise<T[]>,
  ): Promise<T[]> {
    if (ids.length === 0) return [];
    const chunks = chunk(ids, MAX_IDS_PER_REQUEST);
    const concurrency = params.concurrency ?? DEFAULT_BATCH_CONCURRENCY;
    const batches = await mapWithConcurrency(chunks, concurrency, fetchChunk);
    return batches.flat();
  }
}
