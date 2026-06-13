import type { IsoDateString } from "../types/shared";

/** Parses an ISO-8601 timestamp string into a `Date`. */
export function parseIsoDate(value: IsoDateString): Date {
  return new Date(value);
}
