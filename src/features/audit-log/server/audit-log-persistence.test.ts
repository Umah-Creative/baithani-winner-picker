import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  values: vi.fn(),
  insert: vi.fn(),
  request: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: { insert: mocks.insert },
}));
vi.mock("./audit-request", () => ({
  getCurrentAdminAuditRequestMetadata: mocks.request,
}));

import { writeAdminAuditLog } from "./audit-log.service";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.request.mockResolvedValue({
    ipAddress: null,
    userAgent: null,
    acceptLanguage: null,
    requestId: null,
  });
});

describe("writeAdminAuditLog", () => {
  it("writes a sanitized best-effort event", async () => {
    mocks.values.mockResolvedValue(undefined);

    await writeAdminAuditLog({
      action: "auth.login",
      outcome: "failure",
      actor: "admin",
      metadata: { reason: "invalid_credentials", password: "do-not-store" },
    });

    const event = mocks.values.mock.calls[0]?.[0];
    expect(event).toEqual(
      expect.objectContaining({
        action: "auth.login",
        outcome: "failure",
        metadata: { reason: "invalid_credentials" },
      })
    );
    expect(JSON.stringify(event)).not.toContain("do-not-store");
  });

  it("reports persistence failure without leaking metadata or database errors", async () => {
    mocks.values.mockRejectedValue(
      new Error("database secret: postgresql://credentials")
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(
      writeAdminAuditLog({
        action: "auth.login",
        outcome: "failure",
        actor: "admin",
        metadata: { password: "submitted-password" },
      })
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith(
      "Admin audit persistence failed.",
      { action: "auth.login", outcome: "failure" }
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("password");
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("postgresql");
    consoleError.mockRestore();
  });
});
