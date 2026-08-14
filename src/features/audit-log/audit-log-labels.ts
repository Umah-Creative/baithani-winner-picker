import type { AdminAuditAction, AdminAuditOutcome } from "./audit-log.type";

const ACTION_LABELS: Record<AdminAuditAction, string> = {
  "auth.login": "Admin signed in",
  "auth.logout": "Admin signed out",
  "settings.update": "Event settings updated",
  "settings.update_failed": "Settings update failed",
  "logo.replace": "Event logo replaced",
  "logo.remove": "Event logo removed",
};

const OUTCOME_LABELS: Record<AdminAuditOutcome, string> = {
  success: "Success",
  failure: "Failed",
  denied: "Denied",
};

export function formatAuditAction(action: string): string {
  return ACTION_LABELS[action as AdminAuditAction] ?? action;
}

export function formatAuditOutcome(outcome: string): string {
  return OUTCOME_LABELS[outcome as AdminAuditOutcome] ?? outcome;
}
