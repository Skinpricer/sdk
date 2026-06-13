import { SkinpricerError } from "./base";

/** The request never produced an HTTP response (DNS, connection, fetch threw). */
export class NetworkError extends SkinpricerError {}

/** The request exceeded the configured timeout. */
export class TimeoutError extends NetworkError {}

/** The client was constructed or invoked with invalid configuration. */
export class ConfigurationError extends SkinpricerError {}

/** A successful (2xx) response body could not be parsed as JSON. */
export class ParseError extends SkinpricerError {}
