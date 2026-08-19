import { sanitizeAuditMetadata } from "./audit-log-sanitizer";
import type { AdminAuditEvent, AdminAuditWriteInput } from "./audit-log.type";
import type { RequestContext } from "@/shared/request-context/request-context.type";

export function buildAdminAuditEvent(
  input: AdminAuditWriteInput,
  request: RequestContext,
  occurredAt = new Date()
): AdminAuditEvent {
  return {
    action: input.action,
    outcome: input.outcome,
    actor: input.actor,
    ...request,
    occurredAt,
    metadata: sanitizeAuditMetadata(input.metadata ?? {}),
  };
}
