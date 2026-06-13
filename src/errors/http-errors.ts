import { SkinpricerError, type SkinpricerErrorOptions } from "./base";

/** Base class for any error that originates from an HTTP response. */
export class APIError extends SkinpricerError {}

export interface ValidationErrorOptions extends SkinpricerErrorOptions {
  /** Individual validation messages (NestJS returns `message` as an array on 400). */
  messages?: string[];
}

/** 400 Bad Request — request validation failed. */
export class ValidationError extends APIError {
  readonly messages: string[];

  constructor(message: string, options: ValidationErrorOptions = {}) {
    super(message, options);
    this.messages = options.messages ?? [];
  }
}

/** 401 Unauthorized — missing, malformed, invalid, expired, or revoked API key. */
export class AuthenticationError extends APIError {}

/** 403 Forbidden — authenticated but not permitted (e.g. inactive subscription). */
export class PermissionError extends APIError {}

/** 403 Forbidden — the current plan does not include the requested feature. */
export class FeatureNotAvailableError extends PermissionError {}

/** 404 Not Found — the requested item/resource is not tracked. */
export class NotFoundError extends APIError {}

export interface RateLimitErrorOptions extends SkinpricerErrorOptions {
  retryAfterSeconds?: number | null;
  limit?: number | null;
  remaining?: number | null;
  resetSeconds?: number | null;
}

/** 429 Too Many Requests — minute or monthly quota exceeded. */
export class RateLimitError extends APIError {
  /** Seconds to wait before retrying (`Retry-After`). */
  readonly retryAfterSeconds: number | null;
  readonly limit: number | null;
  readonly remaining: number | null;
  readonly resetSeconds: number | null;

  constructor(message: string, options: RateLimitErrorOptions = {}) {
    super(message, options);
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
    this.limit = options.limit ?? null;
    this.remaining = options.remaining ?? null;
    this.resetSeconds = options.resetSeconds ?? null;
  }
}

/** 5xx — the server failed to process the request. */
export class ServerError extends APIError {}
