export type SiteUrlInput = {
  configuredUrl?: string;
  nodeEnv?: string;
  forwardedHost?: string | null;
  host?: string | null;
  forwardedProtocol?: string | null;
};

function parseHttpUrl(value: string): URL | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return new URL(url.origin);
  } catch {
    return undefined;
  }
}

export function resolveSiteUrlValue(input: SiteUrlInput): URL | undefined {
  const configured = input.configuredUrl?.trim();
  if (configured) {
    const parsed = parseHttpUrl(configured);
    if (parsed) return parsed;
  }

  if (input.nodeEnv === "development") {
    return new URL("http://localhost:3000");
  }

  const host = input.forwardedHost ?? input.host;
  if (!host || /[\s/\\]/.test(host)) return undefined;

  const protocol =
    input.forwardedProtocol === "http" || input.forwardedProtocol === "https"
      ? input.forwardedProtocol
      : "https";

  return parseHttpUrl(`${protocol}://${host}`);
}
