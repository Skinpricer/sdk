import type { RequestOptions } from "../http/http-client";
import type {
  SchemaChangesParams,
  SchemaChangesResponse,
  SchemaItem,
  SchemaItemResponse,
  SchemaSnapshotParams,
  SchemaSnapshotResponse,
} from "../types/schema";
import { encodePathSegment } from "../utils/url";
import { BaseResource } from "./resource";

/** Item catalog snapshots, single-item lookup, and incremental changes. */
export class SchemaResource extends BaseResource {
  snapshot(
    params?: undefined,
    options?: RequestOptions,
  ): Promise<SchemaSnapshotResponse>;
  snapshot(
    params: SchemaSnapshotParams,
    options?: RequestOptions,
  ): Promise<SchemaSnapshotResponse | null>;
  /** Full catalog snapshot. A matching conditional ETag returns null. */
  snapshot(
    params: SchemaSnapshotParams = {},
    options?: RequestOptions,
  ): Promise<SchemaSnapshotResponse | null> {
    return this.call(
      { method: "GET", path: "/schema", ifNoneMatch: params.ifNoneMatch },
      options,
    );
  }

  /** Look up one item by canonical id or exact name; v2 also accepts its game-scoped slug. */
  get(idOrName: string, options?: RequestOptions): Promise<SchemaItemResponse> {
    return this.call(
      { method: "GET", path: `/schema/items/${encodePathSegment(idOrName)}` },
      options,
    );
  }

  /** One page of items changed after a catalog version or timestamp. */
  changes(
    params: SchemaChangesParams,
    options?: RequestOptions,
  ): Promise<SchemaChangesResponse> {
    return this.call(
      {
        method: "GET",
        path: "/schema/changes",
        query: {
          since: params.since,
          cursor: params.cursor,
          limit: params.limit,
        },
      },
      options,
    );
  }

  /** Iterate changes without moving the original version boundary while paging. */
  async *changesEach(
    params: SchemaChangesParams,
    options?: RequestOptions,
  ): AsyncGenerator<SchemaItem> {
    let cursor = params.cursor;
    for (;;) {
      const response = await this.changes({ ...params, cursor }, options);
      for (const item of response.items) yield item;
      const next = response.nextCursor;
      if (!response.hasMore || next === null || next === cursor) return;
      cursor = next;
    }
  }
}
