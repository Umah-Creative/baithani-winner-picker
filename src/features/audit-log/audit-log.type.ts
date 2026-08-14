import type {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_OUTCOMES,
} from "./audit-log.constant";

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
export type AdminAuditOutcome = (typeof ADMIN_AUDIT_OUTCOMES)[number];
export type AdminAuditMetadata = Record<string, unknown>;

export type AdminAuditRequestMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  requestId: string | null;
};

export type AdminAuditWriteInput = {
  action: AdminAuditAction;
  outcome: AdminAuditOutcome;
  actor: string;
  metadata?: AdminAuditMetadata;
};

export type AdminAuditEvent = AdminAuditWriteInput &
  AdminAuditRequestMetadata & {
    occurredAt: Date;
    metadata: AdminAuditMetadata;
  };
