import { describe, expect, it } from "vitest";
import { resolveConfig } from "../../src/config";
import { buildRequest } from "../../src/http/request-builder";

describe("request authentication", () => {
  it("ignores custom Authorization headers regardless of casing", () => {
    const config = resolveConfig({
      apiKey: "test-key",
      headers: {
        authorization: "custom",
        AUTHORIZATION: "other",
        "X-Tenant": "example",
      },
    });
    const request = buildRequest(config, { method: "GET", path: "/items" });
    expect(new Headers(request.headers).get("authorization")).toBe(
      "Bearer test-key",
    );
    expect(new Headers(request.headers).get("x-tenant")).toBe("example");
  });

  it("does not forward any Authorization header to keyless endpoints", () => {
    const config = resolveConfig({
      apiKey: "test-key",
      headers: { authorization: "custom" },
    });
    const request = buildRequest(config, {
      method: "GET",
      path: "/markets/health",
      authenticated: false,
    });
    expect(new Headers(request.headers).has("authorization")).toBe(false);
  });
});
