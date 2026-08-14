import "server-only";

import { headers } from "next/headers";

import type { AdminAuditRequestMetadata } from "../audit-log.type";

export function getAdminAuditRequestMetadata(
  requestHeaders: Headers
): AdminAuditRequestMetadata {
  const trustedProxy = process.env.TRUST_PROXY_HEADERS === "true";
  const forwardedFor = trustedProxy
    ? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()
    : undefined;

  return {
    ipAddress: trustedProxy
      ? forwardedFor || requestHeaders.get("x-real-ip") || null
      : null,
    userAgent: requestHeaders.get("user-agent"),
    acceptLanguage: requestHeaders.get("accept-language"),
    requestId:
      requestHeaders.get("x-request-id") ?? requestHeaders.get("request-id"),
  };
}

export async function getCurrentAdminAuditRequestMetadata() {
  return getAdminAuditRequestMetadata(await headers());
}

export async function getSafeCurrentAdminAuditRequestMetadata(): Promise<AdminAuditRequestMetadata> {
  try {
    return await getCurrentAdminAuditRequestMetadata();
  } catch {
    console.error("Admin audit request attribution failed.");
    return {
      ipAddress: null,
      userAgent: null,
      acceptLanguage: null,
      requestId: null,
    };
  }
}
