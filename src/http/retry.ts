import type { RetryConfig } from "../config";
import type { HttpMethod } from "./types";

export function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

export interface ShouldRetryInput {
  method: HttpMethod;
  attempt: number;
  retry: RetryConfig;
  status: number | null;
}

export function shouldRetry(input: ShouldRetryInput): boolean {
  const { method, attempt, retry, status } = input;
  if (attempt >= retry.maxRetries) return false;
  if (!retry.retryOnMethods.includes(method)) return false;
  if (status === null) return true;
  return isRetryableStatus(status);
}

export function backoffDelayMs(
  attempt: number,
  retry: RetryConfig,
  rng: () => number = Math.random,
): number {
  const ceiling = Math.min(retry.baseDelayMs * 2 ** attempt, retry.maxDelayMs);
  return Math.floor(rng() * ceiling);
}

export interface RetryDelayInput {
  attempt: number;
  retry: RetryConfig;
  retryAfterSeconds: number | null;
  rng?: () => number;
}

export function retryDelayMs(input: RetryDelayInput): number {
  const { attempt, retry, retryAfterSeconds, rng } = input;
  if (
    retry.respectRetryAfter &&
    retryAfterSeconds !== null &&
    retryAfterSeconds >= 0
  ) {
    return Math.min(retryAfterSeconds * 1000, retry.maxDelayMs);
  }
  return backoffDelayMs(attempt, retry, rng);
}
