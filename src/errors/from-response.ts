import type { ResponseMeta } from "../meta";
import type { SkinpricerError } from "./base";
import {
  APIError,
  AuthenticationError,
  FeatureNotAvailableError,
  NotFoundError,
  PermissionError,
  RateLimitError,
  ServerError,
  ValidationError,
} from "./http-errors";

export interface ErrorResponseInput {
  status: number;
  body: unknown;
  meta: ResponseMeta;
}

interface ExtractedError {
  code?: string;
  message: string;
  messages?: string[];
}

function defaultMessage(status: number): string {
  return `Request failed with status ${status}`;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractErrorFields(body: unknown, status: number): ExtractedError {
  if (isRecord(body)) {
    if (body.success === false && isRecord(body.error)) {
      const err = body.error;
      const message =
        typeof err.message === "string" ? err.message : defaultMessage(status);
      const result: ExtractedError = { message };
      if (typeof err.code === "string") result.code = err.code;
      return result;
    }

    const rawMessage = body.message;
    if (Array.isArray(rawMessage)) {
      const messages = rawMessage.filter(
        (entry): entry is string => typeof entry === "string",
      );
      return {
        message:
          messages.length > 0 ? messages.join(", ") : defaultMessage(status),
        messages,
      };
    }
    if (typeof rawMessage === "string") {
      return { message: rawMessage };
    }
    if (typeof body.error === "string") {
      return { message: body.error };
    }
  }

  if (typeof body === "string" && body.trim().length > 0) {
    return { message: truncate(body, 500) };
  }

  return { message: defaultMessage(status) };
}

function looksLikeFeatureError(message: string): boolean {
  return /feature|does not include|plan/i.test(message);
}

export function errorFromResponse(input: ErrorResponseInput): SkinpricerError {
  const { status, body, meta } = input;
  const { code, message, messages } = extractErrorFields(body, status);

  const base: SkinpricerErrorBase = {
    status,
    code,
    requestId: meta.requestId,
    responseBody: body,
    rateLimit: meta.rateLimit,
  };

  switch (status) {
    case 400:
      return new ValidationError(message, { ...base, messages });
    case 401:
      return new AuthenticationError(message, base);
    case 403:
      return code === "FEATURE_NOT_AVAILABLE" || looksLikeFeatureError(message)
        ? new FeatureNotAvailableError(message, base)
        : new PermissionError(message, base);
    case 404:
      return new NotFoundError(message, base);
    case 429:
      return new RateLimitError(message, {
        ...base,
        retryAfterSeconds: meta.rateLimit.retryAfterSeconds,
        limit: meta.rateLimit.limit,
        remaining: meta.rateLimit.remaining,
        resetSeconds: meta.rateLimit.resetSeconds,
      });
    default:
      if (status >= 500) return new ServerError(message, base);
      return new APIError(message, base);
  }
}

interface SkinpricerErrorBase {
  status: number;
  code: string | undefined;
  requestId: string | null;
  responseBody: unknown;
  rateLimit: ResponseMeta["rateLimit"];
}
