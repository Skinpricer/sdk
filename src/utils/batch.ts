/** Splits items into chunks of at most `size`. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) throw new RangeError("chunk size must be greater than 0");
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/** Runs `fn` over `items` with at most `limit` concurrent executions, keeping order. */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (limit <= 0)
    throw new RangeError("concurrency limit must be greater than 0");
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fn(items[index] as T, index);
    }
  }

  const poolSize = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: poolSize }, () => worker()));
  return results;
}
