import type { IsoDateString } from "./shared";

export interface InventoryFetchParams {
  /** Inventory owner's 17-digit Steam64 identifier. */
  targetSteamId: string;
  /** Steam application id. Defaults to 730 for CS2. */
  appId?: number;
  /** Steam inventory context. Defaults to 2. */
  contextId?: number;
  tradableOnly?: boolean;
}

/** CS2 inventory fetch with item inspection. */
export interface InventoryFetchAdvancedParams extends Omit<
  InventoryFetchParams,
  "appId"
> {
  appId?: 730;
  /** Maximum items to inspect, from 1 to 500. Defaults to 100. */
  maxInspections?: number;
}

export type InventoryStatus =
  | "PENDING"
  | "FETCHING"
  | "INSPECTING"
  | "COMPLETED"
  | "FAILED";

export interface InventorySticker {
  slot: number;
  name: string;
  wear?: number;
  stickerId?: number;
}

export interface InventoryItem {
  assetId: string;
  classId: string;
  instanceId: string;
  marketHashName: string;
  marketName: string;
  iconUrl?: string;
  inspectLink?: string;
  tradable: boolean;
  marketable: boolean;
  exterior?: string;
  rarity?: string;
  weaponType?: string;
  quality?: string;
  floatValue?: number;
  paintSeed?: number;
  stickers?: InventorySticker[];
  inspectedAt?: IsoDateString;
}

export interface InventorySnapshotStatus {
  id: string;
  status: InventoryStatus;
  itemCount?: number;
  inspectedCount?: number;
  error?: string;
}

export interface InventorySnapshot extends InventorySnapshotStatus {
  targetSteamId: string;
  appId: number;
  contextId: number;
  createdAt: IsoDateString;
  completedAt?: IsoDateString;
  items?: InventoryItem[];
}

export interface InventoryHistoryParams {
  /** Results per page, from 1 to 100. Defaults to 10. */
  limit?: number;
  /** Results to skip, from 0 to 10000. Defaults to 0. */
  offset?: number;
}

export interface InventoryHistoryResponse {
  snapshots: Omit<InventorySnapshot, "items">[];
  total: number;
}
