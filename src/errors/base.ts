import type { RateLimitInfo } from "../http/rate-limit";

export interface SkinpricerErrorOptions {
  status?: number;
  code?: string;
  requestId?: string | null;
  responseBody?: unknown;
  rateLimit?: RateLimitInfo;
  cause?: unknown;
}

export class SkinpricerError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly requestId: string | null;
  readonly responseBody?: unknown;
  readonly rateLimit?: RateLimitInfo;

  constructor(message: string, options: SkinpricerErrorOptions = {}) {
    super(
      message,
      options.cause !== undefined ? { cause: options.cause } : undefined,
    );
    this.name = new.target.name;
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId ?? null;
    this.responseBody = options.responseBody;
    this.rateLimit = options.rateLimit;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isSkinpricerError(value: unknown): value is SkinpricerError {
    return value instanceof SkinpricerError;
  }
}
