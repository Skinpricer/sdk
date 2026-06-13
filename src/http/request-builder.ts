import type { ResolvedConfig } from "../config";
import { joinUrl } from "../utils/url";
import { serializeQuery, type QueryParams } from "./query";
import type { HttpMethod } from "./types";

export interface BuildRequestInput {
  method: HttpMethod;
  path: string;
  query?: QueryParams;
  body?: unknown;
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
  const url = joinUrl(config.baseUrl, input.path) + queryString;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": config.userAgent,
    "X-Skinpricer-Client": config.userAgent,
    ...config.headers,
  };

  let body: string | undefined;
  if (input.body !== undefined) {
    body = JSON.stringify(input.body);
    headers["Content-Type"] = "application/json";
  }

  headers["Authorization"] = `${config.authScheme} ${config.apiKey}`;

  const prepared: PreparedRequest = { url, method: input.method, headers };
  if (body !== undefined) prepared.body = body;
  return prepared;
}
