import type { RequestOptions } from "../http/http-client";
import type {
  InventoryFetchParams,
  InventoryFetchAdvancedParams,
  InventorySnapshot,
  InventorySnapshotStatus,
  InventoryHistoryParams,
  InventoryHistoryResponse,
} from "../types/inventory";
import { encodePathSegment } from "../utils/url";
import { BaseResource } from "./resource";

/** Steam inventory requests and previously stored snapshots on the v1 API. */
export class InventoryResource extends BaseResource {
  /** Fetch and store an inventory. Never retried automatically. Unavailable dispatch returns 503. */
  fetch(
    params: InventoryFetchParams,
    options?: RequestOptions,
  ): Promise<InventorySnapshot> {
    return this.call(
      { method: "POST", path: "/inventory/fetch", body: params },
      { ...options, retry: false },
    );
  }

  /** Inspect CS2 items when available; otherwise returns 503. Allow timeoutMs above 90000. */
  fetchAdvanced(
    params: InventoryFetchAdvancedParams,
    options?: RequestOptions,
  ): Promise<InventorySnapshot> {
    return this.call(
      { method: "POST", path: "/inventory/fetch/advanced", body: params },
      { ...options, retry: false },
    );
  }

  get(
    snapshotId: string,
    options?: RequestOptions,
  ): Promise<InventorySnapshot> {
    return this.call(
      {
        method: "GET",
        path: `/inventory/snapshot/${encodePathSegment(snapshotId)}`,
      },
      options,
    );
  }

  status(
    snapshotId: string,
    options?: RequestOptions,
  ): Promise<InventorySnapshotStatus> {
    return this.call(
      {
        method: "GET",
        path: `/inventory/snapshot/${encodePathSegment(snapshotId)}/status`,
      },
      options,
    );
  }

  history(
    steamId: string,
    params: InventoryHistoryParams = {},
    options?: RequestOptions,
  ): Promise<InventoryHistoryResponse> {
    return this.call(
      {
        method: "GET",
        path: `/inventory/history/${encodePathSegment(steamId)}`,
        query: { limit: params.limit, offset: params.offset },
      },
      options,
    );
  }
}
