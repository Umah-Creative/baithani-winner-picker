import type { AdminAuditMetadata } from "./audit-log.type";

const OMITTED_METADATA_KEY =
  /(?:password|cookie|authorization|token|secret|raw.*(?:body|header)|headers?|body|logo.*bytes|image.*bytes)/i;

function sanitizeValue(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Uint8Array) return undefined;
  if (Array.isArray(value)) {
    return value
      .map(sanitizeValue)
      .filter((item): item is NonNullable<typeof item> => item !== undefined);
  }
  if (typeof value === "object") {
    return sanitizeAuditMetadata(value as AdminAuditMetadata);
  }
  return undefined;
}

export function sanitizeAuditMetadata(
  metadata: AdminAuditMetadata
): AdminAuditMetadata {
  return Object.fromEntries(
    Object.entries(metadata).flatMap(([key, value]) => {
      if (OMITTED_METADATA_KEY.test(key)) return [];
      const sanitized = sanitizeValue(value);
      return sanitized === undefined ? [] : [[key, sanitized]];
    })
  );
}
