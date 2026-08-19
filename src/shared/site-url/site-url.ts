export type SiteUrlInput = {
  configuredUrl?: string;
  portlessUrl?: string;
  nodeEnv?: string;
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
    const portless = input.portlessUrl?.trim();
    if (portless) {
      const parsed = parseHttpUrl(portless);
      if (parsed) return parsed;
    }
    return new URL("http://localhost:3000");
  }

  return undefined;
}
