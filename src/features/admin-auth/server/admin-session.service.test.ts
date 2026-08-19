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
  process.env.ADMIN_SECRET = "12345678901234567890123456789012";
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
        sameSite: "strict",
        secure: true,
        path: "/admin",
        maxAge: 60 * 60 * 24,
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

  it("returns false without a cookie and expires the cookie at its owned path", async () => {
    mocks.get.mockReturnValue(undefined);

    await expect(isAdminAuthenticated()).resolves.toBe(false);
    await clearAdminSession();

    expect(mocks.set).toHaveBeenCalledWith("baithani-admin", "", {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/admin",
      maxAge: 0,
    });
  });

  it("fails closed when the signing secret is missing", async () => {
    delete process.env.ADMIN_SECRET;

    await expect(createAdminSession()).rejects.toThrow(
      "ADMIN_SECRET is not configured."
    );
  });

  it("rejects signing secrets shorter than 32 bytes", async () => {
    process.env.ADMIN_SECRET = "too-short";

    await expect(createAdminSession()).rejects.toThrow(
      "ADMIN_SECRET must contain at least 32 bytes."
    );
  });

  it("rejects a validly signed token with the wrong issuer or audience", async () => {
    const { SignJWT } = await import("jose");
    const key = new TextEncoder().encode(process.env.ADMIN_SECRET);
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("wrong-issuer")
      .setAudience("wrong-audience")
      .setSubject("admin")
      .setExpirationTime("24h")
      .sign(key);
    mocks.get.mockReturnValue({ value: token });

    await expect(isAdminAuthenticated()).resolves.toBe(false);
  });
});
