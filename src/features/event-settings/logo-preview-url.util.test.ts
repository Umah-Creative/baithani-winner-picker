// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { resolveSafeLogoPreviewUrl } from "./logo-preview-url.util";

describe("resolveSafeLogoPreviewUrl", () => {
  it("allows the same-origin logo endpoint", () => {
    expect(resolveSafeLogoPreviewUrl("/api/media/logo?v=revision")).toBe(
      "/api/media/logo?v=revision"
    );
  });

  it("allows browser-created same-origin blob URLs", () => {
    expect(
      resolveSafeLogoPreviewUrl("blob:http://localhost:3000/replacement")
    ).toBe("blob:http://localhost:3000/replacement");
  });

  it("rejects external, script, and unrelated URLs", () => {
    expect(
      resolveSafeLogoPreviewUrl("https://attacker.example/logo.png")
    ).toBeUndefined();
    expect(resolveSafeLogoPreviewUrl("javascript:alert(1)")).toBeUndefined();
    expect(resolveSafeLogoPreviewUrl("/uploads/logo.png")).toBeUndefined();
  });
});
