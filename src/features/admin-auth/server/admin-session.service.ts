import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "baithani-admin";
const SESSION_ISSUER = "baithani-winner-picker";
const SESSION_AUDIENCE = "baithani-admin";
const SESSION_SUBJECT = "admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured.");
  }

  const encoded = new TextEncoder().encode(secret);
  if (encoded.byteLength < 32) {
    throw new Error("ADMIN_SECRET must contain at least 32 bytes.");
  }

  return encoded;
}

async function sign(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setSubject(SESSION_SUBJECT)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

async function verify(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      subject: SESSION_SUBJECT,
    });
    return payload.role === "admin" && typeof payload.jti === "string";
  } catch {
    return false;
  }
}

export async function createAdminSession(): Promise<void> {
  const token = await sign();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }
  return verify(token);
}
