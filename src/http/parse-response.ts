import { errorFromResponse } from "../errors/from-response";
import { ParseError } from "../errors/network-errors";
import type { ResponseMeta } from "../meta";
import { parseRateLimit } from "./rate-limit";

export interface HttpResponse<T> {
  data: T;
  meta: ResponseMeta;
}

function buildMeta(response: Response): ResponseMeta {
  return {
    status: response.status,
    requestId: response.headers.get("x-request-id"),
    rateLimit: parseRateLimit(response.headers),
    headers: response.headers,
  };
}

function tryJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export async function parseResponse<T>(
  response: Response,
): Promise<HttpResponse<T>> {
  const meta = buildMeta(response);
  const text = await response.text();

  if (response.ok) {
    if (text.length === 0) {
      return { data: {} as T, meta };
    }
    try {
      return { data: JSON.parse(text) as T, meta };
    } catch (cause) {
      throw new ParseError("Failed to parse response body as JSON.", {
        status: response.status,
        responseBody: text,
        cause,
        rateLimit: meta.rateLimit,
        requestId: meta.requestId,
      });
    }
  }

  const parsed = text.length > 0 ? tryJsonParse(text) : undefined;
  const body =
    parsed !== undefined ? parsed : text.length > 0 ? text : undefined;
  throw errorFromResponse({ status: response.status, body, meta });
}
