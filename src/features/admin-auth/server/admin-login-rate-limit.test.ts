import { afterEach, describe, expect, it } from "vitest";

import {
  consumeLoginFailure,
  getLoginRateLimitKey,
  resetLoginRateLimits,
} from "./admin-login-rate-limit";

afterEach(resetLoginRateLimits);

describe("admin login rate limit", () => {
  it("allows a bounded number of failures before blocking the same trusted IP", () => {
    const key = getLoginRateLimitKey({
      ipAddress: "203.0.113.8",
      userAgent: "ignored",
      acceptLanguage: "ignored",
      requestId: "ignored",
    });

    expect(
      Array.from({ length: 5 }, () => consumeLoginFailure(key, 0))
    ).toEqual([false, false, false, false, false]);
    expect(consumeLoginFailure(key, 0)).toBe(true);
  });

  it("uses one safe fallback bucket when no trusted IP is available", () => {
    expect(
      getLoginRateLimitKey({
        ipAddress: null,
        userAgent: "attacker-controlled",
        acceptLanguage: "attacker-controlled",
        requestId: "attacker-controlled",
      })
    ).toBe("anonymous");
  });
});
