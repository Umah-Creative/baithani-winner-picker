import { describe, expect, it } from "vitest";

import {
  getTrustedClientIp,
  normalizeIpAddress,
  readInternalRequestContext,
} from "./request-context.server";

describe("request context", () => {
  it("selects the trusted hop from the right side of X-Forwarded-For", () => {
    expect(getTrustedClientIp("198.51.100.10, 10.0.0.2, 10.0.0.3", 1)).toBe(
      "10.0.0.3"
    );
    expect(getTrustedClientIp("198.51.100.10, 10.0.0.2, 10.0.0.3", 2)).toBe(
      "10.0.0.2"
    );
  });

  it("normalizes valid IPv4 and IPv6 while rejecting malformed attribution", () => {
    expect(normalizeIpAddress(" 203.0.113.8 ")).toBe("203.0.113.8");
    expect(normalizeIpAddress("[2001:db8::1]")).toBe("2001:db8::1");
    expect(normalizeIpAddress("not-an-ip")).toBeNull();
    expect(getTrustedClientIp("spoofed, also-bad", 1)).toBeNull();
  });

  it("reads only application-owned internal attribution headers and caps metadata", () => {
    const headers = new Headers({
      "x-baithani-client-ip": "203.0.113.8",
      "x-baithani-request-id": "request-123",
      "x-request-id": "attacker-value",
      "user-agent": "u".repeat(600),
      "accept-language": "l".repeat(300),
    });

    expect(readInternalRequestContext(headers)).toEqual({
      ipAddress: "203.0.113.8",
      requestId: "request-123",
      userAgent: "u".repeat(512),
      acceptLanguage: "l".repeat(256),
    });
  });
});
