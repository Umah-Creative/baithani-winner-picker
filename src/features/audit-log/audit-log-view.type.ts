import type { AdminAuditMetadata } from "./audit-log.type";
import type { AdminAuditAction, AdminAuditOutcome } from "./audit-log.type";

export type AdminLogFilters = {
  action?: AdminAuditAction;
  outcome?: AdminAuditOutcome;
  from?: string;
  to?: string;
  ip?: string;
  requestId?: string;
  tz?: string;
  page: number;
  limit: 50;
  offset: number;
};

export type AdminAuditLogRow = {
  id: number;
  action: string;
  outcome: string;
  actor: string;
  occurredAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  requestId: string | null;
  metadata: AdminAuditMetadata;
};

export type AdminAuditLogPage = {
  rows: AdminAuditLogRow[];
  total: number;
  totalPages: number;
  filters: AdminLogFilters;
};
