import { describe, expect, it } from "vitest";

import { resolveSiteUrlValue } from "./site-url";

describe("resolveSiteUrlValue", () => {
  it("prefers and normalizes a valid SITE_URL", () => {
    expect(
      resolveSiteUrlValue({
        configuredUrl: "https://picker.baithani.example/admin",
        nodeEnv: "production",
      })?.toString()
    ).toBe("https://picker.baithani.example/");
  });

  it("uses localhost only in development", () => {
    expect(resolveSiteUrlValue({ nodeEnv: "development" })?.toString()).toBe(
      "http://localhost:3000/"
    );
    expect(resolveSiteUrlValue({ nodeEnv: "production" })).toBeUndefined();
  });

  it("uses PORTLESS_URL before localhost in development", () => {
    expect(
      resolveSiteUrlValue({
        portlessUrl: "http://winner-picker.localhost:1355/admin",
        nodeEnv: "development",
      })?.toString()
    ).toBe("http://winner-picker.localhost:1355/");
  });

  it("never derives a production origin from request headers", () => {
    expect(
      resolveSiteUrlValue({
        nodeEnv: "production",
        portlessUrl: "https://ignored.example",
      })
    ).toBeUndefined();
  });
});
