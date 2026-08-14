import {
  ADMIN_AUDIT_ACTIONS,
  sanitizeAuditMetadata,
  type AdminAuditAction,
  type AdminAuditMetadata,
  type AdminAuditOutcome,
} from "./admin-audit.shared";

const ADMIN_AUDIT_OUTCOMES: AdminAuditOutcome[] = [
  "success",
  "failure",
  "denied",
];
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

type SearchParam = string | string[] | undefined;

export type AdminLogFilters = {
  action?: AdminAuditAction;
  outcome?: AdminAuditOutcome;
  from?: string;
  to?: string;
  ip?: string;
  requestId?: string;
  page: number;
  limit: 50;
  offset: number;
};

export type AuditSettingsDiff = {
  field: (typeof SETTINGS_FIELDS)[number];
  before: unknown;
  after: unknown;
};

function firstValue(value: SearchParam): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function validDate(value: string | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? value
    : undefined;
}

export function parseAdminLogFilters(
  input: Record<string, SearchParam>
): AdminLogFilters {
  const action = firstValue(input.action);
  const outcome = firstValue(input.outcome);
  const parsedPage = Number.parseInt(firstValue(input.page) ?? "1", 10);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const from = validDate(firstValue(input.from));
  const to = validDate(firstValue(input.to));

  return {
    action: ADMIN_AUDIT_ACTIONS.includes(action as AdminAuditAction)
      ? (action as AdminAuditAction)
      : undefined,
    outcome: ADMIN_AUDIT_OUTCOMES.includes(outcome as AdminAuditOutcome)
      ? (outcome as AdminAuditOutcome)
      : undefined,
    from: from && (!to || from <= to) ? from : undefined,
    to: from && to && from > to ? undefined : to,
    ip: firstValue(input.ip)?.trim() || undefined,
    requestId: firstValue(input.requestId)?.trim() || undefined,
    page,
    limit: 50,
    offset: (page - 1) * 50,
  };
}

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

export function clampAdminLogPage(
  filters: AdminLogFilters,
  total: number
): AdminLogFilters {
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const page = Math.min(filters.page, totalPages);
  return { ...filters, page, offset: (page - 1) * filters.limit };
}

export function serializeAdminLogFilters(filters: AdminLogFilters): string {
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.outcome) params.set("outcome", filters.outcome);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.ip) params.set("ip", filters.ip);
  if (filters.requestId) params.set("requestId", filters.requestId);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export { ADMIN_AUDIT_OUTCOMES };
