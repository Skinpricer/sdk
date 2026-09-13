import type { ResolvedConfig } from "../config";
import { joinUrl } from "../utils/url";
import { serializeQuery, type QueryParams } from "./query";
import type { HttpMethod } from "./types";

export interface BuildRequestInput {
  authenticated?: boolean;
  ifNoneMatch?: string;
  method: HttpMethod;
  path: string;
  query?: QueryParams;
  body?: unknown;
  /** Overrides `config.baseUrl` for this request (e.g. keyless public-service endpoints). */
  baseUrl?: string;
}

export interface PreparedRequest {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

export function buildRequest(
  config: ResolvedConfig,
  input: BuildRequestInput,
): PreparedRequest {
  const queryString = input.query ? serializeQuery(input.query) : "";
  const url =
    joinUrl(input.baseUrl ?? config.baseUrl, input.path) + queryString;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": config.userAgent,
    "X-Skinpricer-Client": config.userAgent,
    ...Object.fromEntries(
      Object.entries(config.headers).filter(
        ([name]) => name.toLowerCase() !== "authorization",
      ),
    ),
  };

  let body: string | undefined;
  if (input.body !== undefined) {
    body = JSON.stringify(input.body);
    headers["Content-Type"] = "application/json";
  }

  if (input.authenticated !== false)
    headers["Authorization"] = `${config.authScheme} ${config.apiKey}`;
  if (input.ifNoneMatch !== undefined)
    headers["If-None-Match"] = input.ifNoneMatch;

  const prepared: PreparedRequest = { url, method: input.method, headers };
  if (body !== undefined) prepared.body = body;
  return prepared;
}
