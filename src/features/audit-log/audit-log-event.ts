import { sanitizeAuditMetadata } from "./audit-log-sanitizer";
import type {
  AdminAuditEvent,
  AdminAuditRequestMetadata,
  AdminAuditWriteInput,
} from "./audit-log.type";

export function buildAdminAuditEvent(
  input: AdminAuditWriteInput,
  request: AdminAuditRequestMetadata,
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
