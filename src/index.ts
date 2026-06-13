// Client
export { SkinpricerClient } from "./client";
export {
  DEFAULT_BASE_URL,
  DEFAULT_RETRY,
  DEFAULT_TIMEOUT_MS,
  resolveConfig,
} from "./config";
export type {
  AuthScheme,
  ClientConfig,
  ResolvedConfig,
  RetryConfig,
} from "./config";

// Observability hooks
export type {
  ClientHooks,
  RequestHookContext,
  ResponseHookContext,
  RetryHookContext,
} from "./hooks";

// Request/response metadata
export { getMeta, RESPONSE_META } from "./meta";
export type { ResponseMeta, WithMeta } from "./meta";
export type { RequestOptions } from "./http/http-client";
export type { RateLimitInfo, RateLimitWindow } from "./http/rate-limit";

// Errors
export {
  APIError,
  AuthenticationError,
  ConfigurationError,
  errorFromResponse,
  FeatureNotAvailableError,
  NetworkError,
  NotFoundError,
  ParseError,
  PermissionError,
  RateLimitError,
  ServerError,
  SkinpricerError,
  TimeoutError,
  ValidationError,
} from "./errors";
export type {
  ErrorResponseInput,
  RateLimitErrorOptions,
  SkinpricerErrorOptions,
  ValidationErrorOptions,
} from "./errors";

// Resource classes (for advanced typing / composition)
export { BaseResource } from "./resources/resource";
export { AggregationsResource } from "./resources/aggregations";
export type { AggregationsBatchParams } from "./resources/aggregations";
export { ArbitrageResource } from "./resources/arbitrage";
export { AttributePricesResource } from "./resources/attribute-prices";
export { Buff163Resource } from "./resources/buff163";
export { HistoryResource } from "./resources/history";
export { ItemsResource } from "./resources/items";
export { MarketAnalyticsResource } from "./resources/market-analytics";
export { NbboResource } from "./resources/nbbo";
export { PricingResource } from "./resources/pricing";
export { RecommendationsResource } from "./resources/recommendations";
export { StatusResource } from "./resources/status";

// Market id constants
export { ATTRIBUTE_MARKETS, KNOWN_MARKETS } from "./types/markets";

// Utilities
export { centsToUsd, formatUsd } from "./utils/money";
export type { FormatUsdOptions } from "./utils/money";
export { parseIsoDate } from "./utils/dates";
export { chunk, mapWithConcurrency } from "./utils/batch";

// Version
export { VERSION } from "./version";

// All request/response types
export type * from "./types";
