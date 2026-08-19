import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy } from "./content-security-policy";

describe("content security policy", () => {
  it("uses a nonce and strict production directives", () => {
    const policy = buildContentSecurityPolicy("nonce-value", false);

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain(
      "script-src 'self' 'nonce-nonce-value' 'strict-dynamic'"
    );
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).toContain("style-src 'self' 'unsafe-inline'");
    expect(policy).toContain("img-src 'self' data: blob:");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("allows eval only for the development compiler", () => {
    expect(buildContentSecurityPolicy("nonce-value", true)).toContain(
      "'unsafe-eval'"
    );
  });
});
