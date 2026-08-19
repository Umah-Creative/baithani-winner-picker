import { afterEach, describe, expect, it } from "vitest";

import {
  checkLoginRateLimit,
  getLoginRateLimitKey,
  recordLoginFailure,
  resetLoginRateLimits,
} from "./admin-login-rate-limit";

afterEach(resetLoginRateLimits);

describe("admin login rate limit", () => {
  it("blocks the sixth attempt after five failures, even before credentials are checked", () => {
    const key = getLoginRateLimitKey("203.0.113.8");

    expect(checkLoginRateLimit(key, 0)).toEqual({ blocked: false });
    expect(Array.from({ length: 5 }, () => recordLoginFailure(key, 0))).toEqual(
      [
        { lockoutStarted: false },
        { lockoutStarted: false },
        { lockoutStarted: false },
        { lockoutStarted: false },
        { lockoutStarted: true },
      ]
    );
    expect(checkLoginRateLimit(key, 0)).toEqual({ blocked: true });
  });

  it("expires failures after fifteen minutes", () => {
    const key = "ip:203.0.113.9";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      recordLoginFailure(key, 0);
    }

    expect(checkLoginRateLimit(key, 15 * 60 * 1000 - 1)).toEqual({
      blocked: true,
    });
    expect(checkLoginRateLimit(key, 15 * 60 * 1000)).toEqual({
      blocked: false,
    });
  });

  it("tracks client IPs independently", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      recordLoginFailure("ip:203.0.113.10", 0);
    }

    expect(checkLoginRateLimit("ip:203.0.113.10", 0).blocked).toBe(true);
    expect(checkLoginRateLimit("ip:203.0.113.11", 0).blocked).toBe(false);
  });

  it("bounds storage by evicting the oldest tracked key", () => {
    for (let index = 0; index <= 10_000; index += 1) {
      recordLoginFailure(`ip:2001:db8::${index.toString(16)}`, index);
    }

    expect(checkLoginRateLimit("ip:2001:db8::0", 10_000).blocked).toBe(false);
  });

  it("uses one safe fallback bucket when no trusted IP is available", () => {
    expect(getLoginRateLimitKey(null)).toBe("anonymous");
  });
});
