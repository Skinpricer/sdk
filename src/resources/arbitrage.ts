import type { RequestOptions } from "../http/http-client";
import type {
  ArbitrageOpportunitiesResponse,
  ArbitrageParams,
} from "../types/arbitrage";
import { BaseResource } from "./resource";

/** Cross-market arbitrage opportunities. */
export class ArbitrageResource extends BaseResource {
  /** `GET /v1/arbitrage/opportunities` — ranked cross-market opportunities. */
  opportunities(
    params: ArbitrageParams = {},
    options?: RequestOptions,
  ): Promise<ArbitrageOpportunitiesResponse> {
    return this.call<ArbitrageOpportunitiesResponse>(
      {
        method: "GET",
        path: "/arbitrage/opportunities",
        query: {
          limit: params.limit,
          minSpreadBps: params.minSpreadBps,
          minNotionalCents: params.minNotionalCents,
          minNotional: params.minNotional,
          sort: params.sort,
          markets: params.markets,
          candidateLimit: params.candidateLimit,
        },
      },
      options,
    );
  }
}
