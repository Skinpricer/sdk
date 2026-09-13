import type { IsoDateString } from "./shared";

export interface SchemaRarity {
  key: string;
  name: string;
  tier: number;
  color?: string;
}

export interface SchemaCollection {
  name: string;
  image?: string;
}

export interface SchemaContainer {
  name: string;
  type: string;
  releaseDate?: IsoDateString;
  image?: string;
}

export interface SchemaRegistries {
  rarities: SchemaRarity[];
  collections: Record<string, SchemaCollection>;
  containers: Record<string, SchemaContainer>;
}

export interface SchemaVariant {
  marketHashName: string;
  family: string;
  name: string;
  phase?: number;
  image?: string;
}

/** Schema fields that do not apply to the item or game are omitted. */
export interface SchemaItem {
  id: string;
  marketHashName: string;
  slug: string;
  category: string;
  baseName?: string;
  weapon?: string;
  finish?: string;
  paintIndex?: string;
  rarity?: string;
  wear?: string;
  wears?: string[];
  stattrak?: boolean;
  souvenir?: boolean;
  hasStattrak?: boolean;
  hasSouvenir?: boolean;
  stattrakOf?: string;
  souvenirOf?: string;
  floatRange?: { min: number; max: number };
  variants?: SchemaVariant[];
  variant?: { base: string; family: string; name: string };
  collections?: string[];
  containers?: string[];
  image?: string;
  releaseDate?: IsoDateString;
  ids: Record<string, string>;
  aliases?: Record<string, string>;
}

export interface SchemaSnapshotResponse extends SchemaRegistries {
  schemaVersion: number;
  generatedAt: IsoDateString;
  itemCount: number;
  items: Record<string, SchemaItem>;
}

export interface SchemaItemResponse {
  schemaVersion: number;
  item: SchemaItem;
  registries?: SchemaRegistries;
}

export interface SchemaSnapshotParams {
  /** ETag from the preceding snapshot. HTTP 304 returns null. */
  ifNoneMatch?: string;
}

export interface SchemaChangesParams {
  /** Schema version or ISO timestamp. Keep this value unchanged while paging. */
  since: number | string | Date;
  /** Opaque cursor returned by this game's previous delta page. */
  cursor?: string;
  /** Items per page, from 1 to 5000. */
  limit?: number;
}

export interface SchemaChangesResponse {
  schemaVersion: number;
  since: number;
  count: number;
  hasMore: boolean;
  nextCursor: string | null;
  items: SchemaItem[];
  registries?: SchemaRegistries;
}
