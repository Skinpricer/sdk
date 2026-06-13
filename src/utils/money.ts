import type { Cents } from "../types/shared";

/** Converts integer USD cents to a USD float. */
export function centsToUsd(cents: Cents): number {
  return cents / 100;
}

export interface FormatUsdOptions {
  currency?: string;
  locale?: string;
}

/** Formats integer USD cents as a localized currency string, e.g. `1550` → `$15.50`. */
export function formatUsd(
  cents: Cents,
  options: FormatUsdOptions = {},
): string {
  const { currency = "USD", locale = "en-US" } = options;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    cents / 100,
  );
}
