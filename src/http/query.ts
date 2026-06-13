export type QueryScalar = string | number | boolean;

export type QueryValue = QueryScalar | QueryScalar[] | Date | null | undefined;

export type QueryParams = Record<string, QueryValue>;

export function serializeQuery(params: QueryParams): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (value instanceof Date) {
      search.append(key, value.toISOString());
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      search.append(key, value.map((entry) => String(entry)).join(","));
      continue;
    }

    search.append(key, String(value));
  }

  const serialized = search.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
}
