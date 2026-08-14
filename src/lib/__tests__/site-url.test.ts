import { describe, expect, it } from "vitest";

import { resolveSiteUrlValue } from "@/lib/site-url";

describe("resolveSiteUrlValue", () => {
  it("prefers and normalizes a valid SITE_URL", () => {
    expect(
      resolveSiteUrlValue({
        configuredUrl: "https://picker.baithani.example/admin",
        nodeEnv: "production",
        host: "ignored.example",
      })?.toString()
    ).toBe("https://picker.baithani.example/");
  });

  it("uses localhost only in development", () => {
    expect(resolveSiteUrlValue({ nodeEnv: "development" })?.toString()).toBe(
      "http://localhost:3000/"
    );
    expect(resolveSiteUrlValue({ nodeEnv: "production" })).toBeUndefined();
  });

  it("falls back to the validated request origin in production", () => {
    expect(
      resolveSiteUrlValue({
        configuredUrl: "javascript:alert(1)",
        nodeEnv: "production",
        forwardedHost: "picker.baithani.example",
        forwardedProtocol: "https",
      })?.toString()
    ).toBe("https://picker.baithani.example/");
    expect(
      resolveSiteUrlValue({
        nodeEnv: "production",
        host: "bad.example/path",
      })
    ).toBeUndefined();
  });
});
