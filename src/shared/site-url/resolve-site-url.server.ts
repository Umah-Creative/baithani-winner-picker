import "server-only";

import { headers } from "next/headers";

import { resolveSiteUrlValue } from "./site-url";

export async function resolveSiteUrl(): Promise<URL | undefined> {
  const configured = resolveSiteUrlValue({
    configuredUrl: process.env.SITE_URL,
    nodeEnv: process.env.NODE_ENV,
  });
  if (configured) return configured;

  const requestHeaders = await headers();
  return resolveSiteUrlValue({
    nodeEnv: process.env.NODE_ENV,
    forwardedHost: requestHeaders.get("x-forwarded-host"),
    host: requestHeaders.get("host"),
    forwardedProtocol: requestHeaders.get("x-forwarded-proto"),
  });
}
