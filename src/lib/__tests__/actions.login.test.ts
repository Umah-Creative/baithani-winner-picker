import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminSession: vi.fn(),
  clearAdminSession: vi.fn(),
  isAdminAuthenticated: vi.fn(),
  writeAdminAuditLog: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("redirected");
  }),
  headers: vi.fn(),
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
vi.mock("next/headers", () => ({ headers: mocks.headers }));

import { loginAdmin } from "../actions";
import { resetLoginRateLimits } from "../admin-login-rate-limit";

afterEach(() => {
  vi.clearAllMocks();
  resetLoginRateLimits();
  delete process.env.ADMIN_PASSWORD;
});

describe("loginAdmin audit entries", () => {
  it("records a safe successful login before redirecting", async () => {
    process.env.ADMIN_PASSWORD = "correct-password";
    mocks.createAdminSession.mockResolvedValue(undefined);
    mocks.writeAdminAuditLog.mockResolvedValue(undefined);
    mocks.headers.mockResolvedValue(new Headers());

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
    mocks.headers.mockResolvedValue(new Headers());

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

  it("blocks repeated invalid passwords before creating more audit writes", async () => {
    process.env.ADMIN_PASSWORD = "correct-password";
    mocks.writeAdminAuditLog.mockResolvedValue(undefined);
    mocks.headers.mockResolvedValue(new Headers());

    const wrongPassword = new FormData();
    wrongPassword.set("password", "wrong-password");

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(loginAdmin({}, wrongPassword)).resolves.toEqual({
        error: "Invalid password.",
      });
    }

    await expect(loginAdmin({}, wrongPassword)).resolves.toEqual({
      error: "Invalid password.",
    });

    expect(mocks.writeAdminAuditLog).toHaveBeenCalledTimes(5);
    expect(JSON.stringify(mocks.writeAdminAuditLog.mock.calls)).not.toContain(
      "wrong-password"
    );
  });

  it("does not rate-limit a later valid password", async () => {
    process.env.ADMIN_PASSWORD = "correct-password";
    mocks.writeAdminAuditLog.mockResolvedValue(undefined);
    mocks.createAdminSession.mockResolvedValue(undefined);
    mocks.headers.mockResolvedValue(new Headers());

    const wrongPassword = new FormData();
    wrongPassword.set("password", "wrong-password");
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await loginAdmin({}, wrongPassword);
    }

    const correctPassword = new FormData();
    correctPassword.set("password", "correct-password");
    await expect(loginAdmin({}, correctPassword)).rejects.toThrow("redirected");
  });
});
