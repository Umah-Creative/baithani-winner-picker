export const ACTIVE_EVENT_SETTINGS_ID = 1;
export const DEFAULT_ACCENT_COLOR = "#d076b4";
export {
  MAX_DRAW_NUMBER as MAX_EVENT_RANGE,
  MIN_DRAW_NUMBER as MIN_EVENT_RANGE,
} from "@/shared/draw-pool/draw-pool.constant";
export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
export const MAX_EVENT_TITLE_LENGTH = 160;
export const MAX_EVENT_DESCRIPTION_LENGTH = 500;
export const MAX_LOGO_ALT_LENGTH = 160;
export const ACCEPTED_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;
export const ACCEPTED_LOGO_INPUT = ACCEPTED_LOGO_MIME_TYPES.join(",");
