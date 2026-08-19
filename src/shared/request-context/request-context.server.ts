import "server-only";

import { isIP } from "node:net";

import {
  INTERNAL_CLIENT_IP_HEADER,
  INTERNAL_REQUEST_ID_HEADER,
  REQUEST_METADATA_LIMITS,
} from "./request-context.constant";
import type { RequestContext } from "./request-context.type";

function cap(value: string | null, length: number): string | null {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, length) : null;
}

export function normalizeIpAddress(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const unwrapped =
    trimmed.startsWith("[") && trimmed.endsWith("]")
      ? trimmed.slice(1, -1)
      : trimmed;

  return isIP(unwrapped)
    ? unwrapped.slice(0, REQUEST_METADATA_LIMITS.ipAddress)
    : null;
}

export function getTrustedClientIp(
  forwardedFor: string | null,
  trustedProxyHops: number
): string | null {
  if (
    !forwardedFor ||
    !Number.isInteger(trustedProxyHops) ||
    trustedProxyHops < 1
  ) {
    return null;
  }

  const addresses = forwardedFor.split(",").map((value) => value.trim());
  const candidate = addresses.at(-trustedProxyHops) ?? null;
  return normalizeIpAddress(candidate);
}

export function readInternalRequestContext(headers: Headers): RequestContext {
  const requestId = cap(
    headers.get(INTERNAL_REQUEST_ID_HEADER),
    REQUEST_METADATA_LIMITS.requestId
  );

  return {
    ipAddress: normalizeIpAddress(headers.get(INTERNAL_CLIENT_IP_HEADER)),
    userAgent: cap(
      headers.get("user-agent"),
      REQUEST_METADATA_LIMITS.userAgent
    ),
    acceptLanguage: cap(
      headers.get("accept-language"),
      REQUEST_METADATA_LIMITS.acceptLanguage
    ),
    requestId,
  };
}

export function readTrustedProxyHops(
  value = process.env.TRUST_PROXY_HOPS
): number {
  if (!value || !/^\d+$/.test(value)) return 0;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}
