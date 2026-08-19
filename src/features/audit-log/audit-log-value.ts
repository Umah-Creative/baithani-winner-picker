export const AUDIT_FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  accentColor: "Accent color",
  hasLogo: "Logo present",
  logoMime: "Logo format",
  logoAlt: "Logo alt text",
  minRange: "Minimum range",
  maxRange: "Maximum range",
  excludedNumbers: "Excluded numbers",
};

export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined) return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value || "Empty";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}
