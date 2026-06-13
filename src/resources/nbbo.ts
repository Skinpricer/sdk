import type { RequestOptions } from "../http/http-client";
import type {
  NbboDepthParams,
  NbboDepthResponse,
  NbboParams,
  NbboResponse,
} from "../types/nbbo";
import { BaseResource } from "./resource";

/** National Best Bid and Offer (top of book) and aggregated depth. */
export class NbboResource extends BaseResource {
  /** `GET /v1/nbbo` — best bid/ask across markets. Pass `id` or `marketHashName`. */
  get(params: NbboParams, options?: RequestOptions): Promise<NbboResponse> {
    return this.call<NbboResponse>(
      {
        method: "GET",
        path: "/nbbo",
        query: {
          id: params.id,
          market_hash_name: params.marketHashName,
          markets: params.markets,
        },
      },
      options,
    );
  }

  /** `GET /v1/nbbo/depth` — aggregated order-book depth per side. */
  depth(
    params: NbboDepthParams,
    options?: RequestOptions,
  ): Promise<NbboDepthResponse> {
    return this.call<NbboDepthResponse>(
      {
        method: "GET",
        path: "/nbbo/depth",
        query: {
          id: params.id,
          market_hash_name: params.marketHashName,
          markets: params.markets,
          depth: params.depth,
        },
      },
      options,
    );
  }
}
