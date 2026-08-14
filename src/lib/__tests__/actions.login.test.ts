import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminSession: vi.fn(),
  clearAdminSession: vi.fn(),
  isAdminAuthenticated: vi.fn(),
  writeAdminAuditLog: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("redirected");
  }),
}));

vi.mock("@/lib/auth.service", () => ({
  createAdminSession: mocks.createAdminSession,
  clearAdminSession: mocks.clearAdminSession,
  isAdminAuthenticated: mocks.isAdminAuthenticated,
}));
vi.mock("@/lib/admin-audit", () => ({
  writeAdminAuditLog: mocks.writeAdminAuditLog,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { loginAdmin } from "../actions";

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.ADMIN_PASSWORD;
});

describe("loginAdmin audit entries", () => {
  it("records a safe successful login before redirecting", async () => {
    process.env.ADMIN_PASSWORD = "correct-password";
    mocks.createAdminSession.mockResolvedValue(undefined);
    mocks.writeAdminAuditLog.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.set("password", "correct-password");

    await expect(loginAdmin({}, formData)).rejects.toThrow("redirected");

    expect(mocks.writeAdminAuditLog).toHaveBeenCalledWith({
      action: "auth.login",
      outcome: "success",
      actor: "admin",
    });
    expect(JSON.stringify(mocks.writeAdminAuditLog.mock.calls)).not.toContain(
      "correct-password"
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/admin");
  });

  it("records failed login without retaining submitted password", async () => {
    process.env.ADMIN_PASSWORD = "correct-password";
    mocks.writeAdminAuditLog.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.set("password", "wrong-password");

    await expect(loginAdmin({}, formData)).resolves.toEqual({
      error: "Invalid password.",
    });

    expect(mocks.writeAdminAuditLog).toHaveBeenCalledWith({
      action: "auth.login",
      outcome: "failure",
      actor: "admin",
      metadata: { reason: "invalid_credentials" },
    });
    expect(JSON.stringify(mocks.writeAdminAuditLog.mock.calls)).not.toContain(
      "wrong-password"
    );
  });
});
