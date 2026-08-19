import { describe, expect, it } from "vitest";

import { buildAdminAuditEvent } from "./audit-log-event";

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
