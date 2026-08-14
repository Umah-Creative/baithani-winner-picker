export const ACTIVE_EVENT_SETTINGS_ID = 1;
export const DEFAULT_ACCENT_COLOR = "#d076b4";
export const MIN_EVENT_RANGE = 1;
export const MAX_EVENT_RANGE = 10_000;
export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;
export const ACCEPTED_LOGO_INPUT = ACCEPTED_LOGO_MIME_TYPES.join(",");
