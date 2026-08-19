import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import {
  CSP_NONCE_HEADER,
  INTERNAL_CLIENT_IP_HEADER,
  INTERNAL_REQUEST_ID_HEADER,
} from "@/shared/request-context/request-context.constant";
import {
  getTrustedClientIp,
  readTrustedProxyHops,
} from "@/shared/request-context/request-context.server";
import { buildContentSecurityPolicy } from "@/shared/security/content-security-policy";

const PERMISSIONS_POLICY =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=()";

export function proxy(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  const requestId = randomUUID();
  const nonce = Buffer.from(randomUUID()).toString("base64");
  const clientIp = getTrustedClientIp(
    request.headers.get("x-forwarded-for"),
    readTrustedProxyHops()
  );
  const contentSecurityPolicy = buildContentSecurityPolicy(
    nonce,
    process.env.NODE_ENV !== "production"
  );

  requestHeaders.delete(INTERNAL_CLIENT_IP_HEADER);
  requestHeaders.delete(INTERNAL_REQUEST_ID_HEADER);
  requestHeaders.delete(CSP_NONCE_HEADER);
  if (clientIp) requestHeaders.set(INTERNAL_CLIENT_IP_HEADER, clientIp);
  requestHeaders.set(INTERNAL_REQUEST_ID_HEADER, requestId);
  requestHeaders.set(CSP_NONCE_HEADER, nonce);
  requestHeaders.set("content-security-policy", contentSecurityPolicy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", contentSecurityPolicy);
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("permissions-policy", PERMISSIONS_POLICY);

  if (request.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set("cache-control", "private, no-store, max-age=0");
  }

  return response;
}
