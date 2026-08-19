import type {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_OUTCOMES,
} from "./audit-log.constant";
import type { RequestContext } from "@/shared/request-context/request-context.type";

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
export type AdminAuditOutcome = (typeof ADMIN_AUDIT_OUTCOMES)[number];
export type AdminAuditMetadata = Record<string, unknown>;

export type AdminAuditWriteInput = {
  action: AdminAuditAction;
  outcome: AdminAuditOutcome;
  actor: string;
  metadata?: AdminAuditMetadata;
};

export type AdminAuditEvent = AdminAuditWriteInput &
  RequestContext & {
    occurredAt: Date;
    metadata: AdminAuditMetadata;
  };
