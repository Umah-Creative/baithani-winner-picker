import type { RequestContext } from "@/shared/request-context/request-context.type";

import type {
  AdminAuditAction,
  AdminAuditMetadata,
  AdminAuditOutcome,
} from "../audit-log.type";

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
