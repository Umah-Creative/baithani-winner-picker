import { describe, expect, it } from "vitest";

import {
  buildAdminAuditEvent,
  getAdminAuditRequestMetadata,
  resolveLogoChange,
  sanitizeAuditMetadata,
} from "../admin-audit.shared";

describe("sanitizeAuditMetadata", () => {
  it("redacts credentials and drops unsafe request and logo fields", () => {
    expect(
      sanitizeAuditMetadata({
        before: { title: "Old title", logoBytes: Buffer.from("logo") },
        password: "never-store-this",
        cookie: "session=secret",
        rawBody: "unsafe",
        headers: { authorization: "Bearer secret" },
        after: { title: "New title", logoMime: "image/png" },
      })
    ).toEqual({
      before: { title: "Old title" },
      after: { title: "New title", logoMime: "image/png" },
    });
  });
});

describe("resolveLogoChange", () => {
  it("gives a replacement file precedence over a checked removal", () => {
    expect(
      resolveLogoChange({
        hasExistingLogo: true,
        hasReplacementLogo: true,
        removeLogo: true,
      })
    ).toBe("replace");
  });
});

describe("buildAdminAuditEvent", () => {
  it("keeps login audit entries attributable without credential metadata", () => {
    expect(
      buildAdminAuditEvent(
        { action: "auth.login", outcome: "success", actor: "admin" },
        {
          ipAddress: null,
          userAgent: "Mozilla/5.0",
          acceptLanguage: "en-US",
          requestId: "req-login",
        }
      )
    ).toMatchObject({
      action: "auth.login",
      outcome: "success",
      actor: "admin",
      requestId: "req-login",
      metadata: {},
    });
  });

  it("constructs an attributable, privacy-safe audit event", () => {
    expect(
      buildAdminAuditEvent(
        {
          action: "settings.update",
          outcome: "success",
          actor: "admin",
          metadata: {
            before: { title: "Before" },
            after: { title: "After" },
            password: "secret",
          },
        },
        {
          ipAddress: "203.0.113.8",
          userAgent: "Mozilla/5.0",
          acceptLanguage: "en-US",
          requestId: "req-123",
        }
      )
    ).toMatchObject({
      action: "settings.update",
      outcome: "success",
      actor: "admin",
      ipAddress: "203.0.113.8",
      userAgent: "Mozilla/5.0",
      acceptLanguage: "en-US",
      requestId: "req-123",
      metadata: {
        before: { title: "Before" },
        after: { title: "After" },
      },
    });
  });
});

describe("getAdminAuditRequestMetadata", () => {
  it("does not let a direct caller opt into forwarding IP headers", () => {
    const requestHeaders = new Headers({
      "x-forwarded-for": "203.0.113.8, 198.51.100.7",
      "x-real-ip": "203.0.113.9",
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US",
      "x-request-id": "req-123",
    });

    const previousTrustProxyHeaders = process.env.TRUST_PROXY_HEADERS;
    delete process.env.TRUST_PROXY_HEADERS;

    try {
      // @ts-expect-error Direct callers cannot override the proxy policy.
      const directCallerAttempt = getAdminAuditRequestMetadata(requestHeaders, {
        trustedProxy: true,
      });

      expect(directCallerAttempt).toEqual({
        ipAddress: null,
        userAgent: "Mozilla/5.0",
        acceptLanguage: "en-US",
        requestId: "req-123",
      });

      process.env.TRUST_PROXY_HEADERS = "true";
      expect(getAdminAuditRequestMetadata(requestHeaders)).toMatchObject({
        ipAddress: "203.0.113.8",
      });
    } finally {
      if (previousTrustProxyHeaders === undefined) {
        delete process.env.TRUST_PROXY_HEADERS;
      } else {
        process.env.TRUST_PROXY_HEADERS = previousTrustProxyHeaders;
      }
    }
  });
});
