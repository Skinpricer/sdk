import type { RequestOptions } from "../http/http-client";
import type {
  AllItemsResponse,
  ItemPriceListResponse,
  ItemSearchParams,
} from "../types/items";
import type { CurrentPriceResponse } from "../types/pricing";
import { BaseResource } from "./resource";

/** Item discovery / search. */
export class ItemsResource extends BaseResource {
  /** GET /v1/items — paginated item search with current pricing. */
  search(
    params: ItemSearchParams = {},
    options?: RequestOptions,
  ): Promise<ItemPriceListResponse> {
    return this.call<ItemPriceListResponse>(
      {
        method: "GET",
        path: "/items",
        query: {
          search: params.search,
          markets: params.markets,
          page: params.page,
          perPage: params.perPage,
        },
      },
      options,
    );
  }

  /** GET /v1/items/all — every tracked item with latest prices (capped, unpaginated). */
  all(options?: RequestOptions): Promise<AllItemsResponse> {
    return this.call<AllItemsResponse>(
      { method: "GET", path: "/items/all" },
      options,
    );
  }

  /** Async iterator over every matching item, walking pages. */
  async *searchEach(
    params: ItemSearchParams = {},
    options?: RequestOptions,
  ): AsyncGenerator<CurrentPriceResponse> {
    let page = params.page ?? 1;
    for (;;) {
      const res = await this.search({ ...params, page }, options);
      for (const item of res.data) {
        yield item;
      }
      const next = res.pagination.nextPage;
      if (next === null || next <= page) return;
      page = next;
    }
  }
}
