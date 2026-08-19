import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminSession: vi.fn(),
  clearAdminSession: vi.fn(),
  isAdminAuthenticated: vi.fn(),
  writeAdminAuditLog: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("redirected");
  }),
  request: vi.fn(),
}));

vi.mock("./server/admin-session.service", () => ({
  createAdminSession: mocks.createAdminSession,
  clearAdminSession: mocks.clearAdminSession,
  isAdminAuthenticated: mocks.isAdminAuthenticated,
}));
vi.mock("@/features/audit-log/server/audit-log.service", () => ({
  writeAdminAuditLog: mocks.writeAdminAuditLog,
}));
vi.mock("@/shared/request-context/current-request-context", () => ({
  getSafeCurrentRequestContext: mocks.request,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { loginAdmin, logoutAdmin } from "./admin-auth.action";
import { resetLoginRateLimits } from "./server/admin-login-rate-limit";

afterEach(() => {
  vi.clearAllMocks();
  resetLoginRateLimits();
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_SECRET;
});

describe("loginAdmin audit entries", () => {
  it("records a safe successful login before redirecting", async () => {
    process.env.ADMIN_PASSWORD = "correct-password";
    mocks.createAdminSession.mockResolvedValue(undefined);
    mocks.writeAdminAuditLog.mockResolvedValue(undefined);
    mocks.request.mockResolvedValue({ ipAddress: null });

    const formData = new FormData();
    formData.set("password", "correct-password");

    await expect(loginAdmin({ status: "idle" }, formData)).rejects.toThrow(
      "redirected"
    );

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
    mocks.request.mockResolvedValue({ ipAddress: null });

    const formData = new FormData();
    formData.set("password", "wrong-password");

    await expect(loginAdmin({ status: "idle" }, formData)).resolves.toEqual({
      status: "error",
      reason: "invalid_credentials",
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

  it("records one denied event when lockout begins and suppresses blocked-request audit spam", async () => {
    process.env.ADMIN_PASSWORD = "correct-password";
    mocks.writeAdminAuditLog.mockResolvedValue(undefined);
    mocks.request.mockResolvedValue({ ipAddress: null });

    const wrongPassword = new FormData();
    wrongPassword.set("password", "wrong-password");

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        loginAdmin({ status: "idle" }, wrongPassword)
      ).resolves.toEqual({
        status: "error",
        reason: attempt === 4 ? "rate_limited" : "invalid_credentials",
        error:
          attempt === 4
            ? "Too many login attempts. Try again later."
            : "Invalid password.",
      });
    }

    await expect(
      loginAdmin({ status: "idle" }, wrongPassword)
    ).resolves.toEqual({
      status: "error",
      reason: "rate_limited",
      error: "Too many login attempts. Try again later.",
    });

    expect(mocks.writeAdminAuditLog).toHaveBeenCalledTimes(5);
    expect(mocks.writeAdminAuditLog).toHaveBeenLastCalledWith({
      action: "auth.login",
      outcome: "denied",
      actor: "admin",
      metadata: { reason: "rate_limited" },
    });
    expect(JSON.stringify(mocks.writeAdminAuditLog.mock.calls)).not.toContain(
      "wrong-password"
    );
  });

  it("blocks a correct password after five failures", async () => {
    process.env.ADMIN_PASSWORD = "correct-password";
    mocks.writeAdminAuditLog.mockResolvedValue(undefined);
    mocks.createAdminSession.mockResolvedValue(undefined);
    mocks.request.mockResolvedValue({ ipAddress: null });

    const wrongPassword = new FormData();
    wrongPassword.set("password", "wrong-password");
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await loginAdmin({ status: "idle" }, wrongPassword);
    }

    const correctPassword = new FormData();
    correctPassword.set("password", "correct-password");
    await expect(
      loginAdmin({ status: "idle" }, correctPassword)
    ).resolves.toEqual({
      status: "error",
      reason: "rate_limited",
      error: "Too many login attempts. Try again later.",
    });
    expect(mocks.createAdminSession).not.toHaveBeenCalled();
  });

  it("clears earlier failures after a successful login before lockout", async () => {
    process.env.ADMIN_PASSWORD = "correct-password";
    process.env.ADMIN_SECRET = "12345678901234567890123456789012";
    mocks.writeAdminAuditLog.mockResolvedValue(undefined);
    mocks.createAdminSession.mockResolvedValue(undefined);
    mocks.request.mockResolvedValue({ ipAddress: null });

    const wrongPassword = new FormData();
    wrongPassword.set("password", "wrong-password");
    await loginAdmin({ status: "idle" }, wrongPassword);

    const correctPassword = new FormData();
    correctPassword.set("password", "correct-password");
    await expect(
      loginAdmin({ status: "idle" }, correctPassword)
    ).rejects.toThrow("redirected");

    vi.clearAllMocks();
    mocks.request.mockResolvedValue({ ipAddress: null });
    await expect(
      loginAdmin({ status: "idle" }, wrongPassword)
    ).resolves.toMatchObject({
      reason: "invalid_credentials",
    });
  });

  it("returns a safe configuration error when credentials are not configured", async () => {
    mocks.request.mockResolvedValue({ ipAddress: null });
    const formData = new FormData();
    formData.set("password", "anything");

    await expect(loginAdmin({ status: "idle" }, formData)).resolves.toEqual({
      status: "error",
      reason: "configuration",
      error: "Admin login is unavailable.",
    });
  });

  it("does not record a successful logout without an authenticated session", async () => {
    mocks.isAdminAuthenticated.mockResolvedValue(false);

    await expect(logoutAdmin()).rejects.toThrow("redirected");

    expect(mocks.writeAdminAuditLog).not.toHaveBeenCalled();
    expect(mocks.clearAdminSession).toHaveBeenCalled();
  });
});
