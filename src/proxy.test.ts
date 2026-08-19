import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

afterEach(() => vi.unstubAllEnvs());

describe("application proxy trust boundary", () => {
  it("overwrites spoofed internal attribution and returns a generated request ID", () => {
    vi.stubEnv("TRUST_PROXY_HOPS", "1");
    const request = new NextRequest("https://example.test/admin", {
      headers: {
        "x-forwarded-for": "198.51.100.50",
        "x-baithani-client-ip": "203.0.113.99",
        "x-baithani-request-id": "attacker-request",
      },
    });

    const response = proxy(request);
    const requestId = response.headers.get("x-request-id");

    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(
      response.headers.get("x-middleware-request-x-baithani-client-ip")
    ).toBe("198.51.100.50");
    expect(
      response.headers.get("x-middleware-request-x-baithani-request-id")
    ).toBe(requestId);
  });

  it("sets nonce CSP, hardening headers, and admin no-store", () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = proxy(new NextRequest("https://example.test/admin/logs"));

    expect(response.headers.get("content-security-policy")).toContain(
      "'strict-dynamic'"
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(response.headers.get("permissions-policy")).toContain("camera=()");
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    );
  });
});
