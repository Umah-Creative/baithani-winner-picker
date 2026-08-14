import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "baithani-admin";

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

async function sign(value: string): Promise<string> {
  return new SignJWT({ role: value })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

async function verify(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function createAdminSession(): Promise<void> {
  const token = await sign("admin");
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }
  return verify(token);
}
