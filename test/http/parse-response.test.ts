import { describe, expect, it } from "vitest";
import { parseResponse } from "../../src/http/parse-response";
import { ParseError } from "../../src/errors/network-errors";
import { NotFoundError } from "../../src/errors/http-errors";

describe("parseResponse", () => {
  it("parses a JSON success body and attaches meta", async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "x-request-id": "req-1", "x-ratelimit-remaining": "59" },
    });
    const { data, meta } = await parseResponse<{ ok: boolean }>(response);
    expect(data).toEqual({ ok: true });
    expect(meta.status).toBe(200);
    expect(meta.requestId).toBe("req-1");
    expect(meta.rateLimit.remaining).toBe(59);
  });

  it("returns an empty object for an empty success body", async () => {
    const response = new Response("", { status: 200 });
    const { data } = await parseResponse(response);
    expect(data).toEqual({});
  });

  it("throws ParseError for invalid JSON on a 2xx", async () => {
    const response = new Response("<<not json>>", { status: 200 });
    await expect(parseResponse(response)).rejects.toBeInstanceOf(ParseError);
  });

  it("throws a typed error for a non-2xx response", async () => {
    const response = new Response(
      JSON.stringify({
        statusCode: 404,
        message: "Item not found",
        error: "Not Found",
      }),
      { status: 404 },
    );
    await expect(parseResponse(response)).rejects.toBeInstanceOf(NotFoundError);
  });
});
