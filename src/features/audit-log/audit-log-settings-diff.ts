import { sanitizeAuditMetadata } from "./audit-log-sanitizer";
import type { AdminAuditMetadata } from "./audit-log.type";

const SETTINGS_FIELDS = [
  "title",
  "description",
  "accentColor",
  "hasLogo",
  "logoMime",
  "logoAlt",
  "minRange",
  "maxRange",
  "excludedNumbers",
] as const;

export type AuditSettingsDiff = {
  field: (typeof SETTINGS_FIELDS)[number];
  before: unknown;
  after: unknown;
};

function asMetadata(value: unknown): AdminAuditMetadata {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as AdminAuditMetadata)
    : {};
}

export function formatAuditSettingsDiff(
  metadata: AdminAuditMetadata
): AuditSettingsDiff[] {
  const sanitized = sanitizeAuditMetadata(metadata);
  const before = asMetadata(sanitized.before);
  const after = asMetadata(sanitized.after);

  return SETTINGS_FIELDS.flatMap((field) => {
    const previous = before[field];
    const next = after[field];
    return JSON.stringify(previous) === JSON.stringify(next)
      ? []
      : [{ field, before: previous, after: next }];
  });
}
