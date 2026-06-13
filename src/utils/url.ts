/** URL-encodes a single dynamic path segment. */
export function encodePathSegment(segment: string): string {
  return encodeURIComponent(segment);
}

/** Joins a base URL (no trailing slash) with a leading-slash path. */
export function joinUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
