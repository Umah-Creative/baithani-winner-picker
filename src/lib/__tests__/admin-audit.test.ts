import { describe, expect, it } from "vitest";

import {
  buildAdminAuditEvent,
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
  it("constructs an attributable, privacy-safe audit event", () => {
    expect(
      buildAdminAuditEvent({
        action: "settings.update",
        outcome: "success",
        actor: "admin",
        request: {
          ipAddress: "203.0.113.8",
          userAgent: "Mozilla/5.0",
          acceptLanguage: "en-US",
          requestId: "req-123",
        },
        metadata: {
          before: { title: "Before" },
          after: { title: "After" },
          password: "secret",
        },
      })
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
