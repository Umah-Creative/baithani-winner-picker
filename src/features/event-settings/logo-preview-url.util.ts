export function resolveSafeLogoPreviewUrl(
  value: string | undefined
): string | undefined {
  if (!value) return undefined;

  if (value === "/api/media/logo" || value.startsWith("/api/media/logo?")) {
    return value;
  }

  if (typeof window === "undefined") return undefined;

  try {
    const parsed = new URL(value, window.location.origin);

    if (parsed.protocol === "blob:") {
      return parsed.origin === window.location.origin
        ? parsed.toString()
        : undefined;
    }

    return parsed.origin === window.location.origin &&
      parsed.pathname === "/api/media/logo"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}
