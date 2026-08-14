import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));

import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
} from "./admin-session.service";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ADMIN_SECRET = "test-secret-at-least-long-enough";
  mocks.cookies.mockResolvedValue({
    set: mocks.set,
    get: mocks.get,
    delete: mocks.delete,
  });
});

afterEach(() => {
  delete process.env.ADMIN_SECRET;
  vi.unstubAllEnvs();
});

describe("admin session", () => {
  it("creates a secure, HTTP-only production session", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await createAdminSession();

    expect(mocks.set).toHaveBeenCalledWith(
      "baithani-admin",
      expect.any(String),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 8,
      }
    );
  });

  it("accepts its signed admin token and rejects malformed tokens", async () => {
    await createAdminSession();
    const token = mocks.set.mock.calls[0]?.[1] as string;
    mocks.get.mockReturnValue({ value: token });

    await expect(isAdminAuthenticated()).resolves.toBe(true);

    mocks.get.mockReturnValue({ value: `${token}tampered` });
    await expect(isAdminAuthenticated()).resolves.toBe(false);
  });

  it("returns false without a cookie and clears the owned cookie", async () => {
    mocks.get.mockReturnValue(undefined);

    await expect(isAdminAuthenticated()).resolves.toBe(false);
    await clearAdminSession();

    expect(mocks.delete).toHaveBeenCalledWith("baithani-admin");
  });

  it("fails closed when the signing secret is missing", async () => {
    delete process.env.ADMIN_SECRET;

    await expect(createAdminSession()).rejects.toThrow(
      "ADMIN_SECRET is not configured."
    );
  });
});
