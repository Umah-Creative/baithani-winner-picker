import "server-only";

import { resolveSiteUrlValue } from "./site-url";

let missingProductionSiteUrlReported = false;

export async function resolveSiteUrl(): Promise<URL | undefined> {
  const configured = resolveSiteUrlValue({
    configuredUrl: process.env.SITE_URL,
    portlessUrl: process.env.PORTLESS_URL,
    nodeEnv: process.env.NODE_ENV,
  });
  if (configured) return configured;

  if (
    process.env.NODE_ENV === "production" &&
    !missingProductionSiteUrlReported
  ) {
    missingProductionSiteUrlReported = true;
    console.warn(
      "SITE_URL is missing or invalid; canonical sharing URLs are disabled."
    );
  }

  return undefined;
}
