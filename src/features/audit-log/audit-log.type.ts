import type {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_OUTCOMES,
} from "./audit-log.constant";

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
export type AdminAuditOutcome = (typeof ADMIN_AUDIT_OUTCOMES)[number];
export type AdminAuditMetadata = Record<string, unknown>;
