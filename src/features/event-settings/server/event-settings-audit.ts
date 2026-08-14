import "server-only";

import { buildAdminAuditEvent } from "@/features/audit-log/audit-log-event";
import type { AdminAuditEvent } from "@/features/audit-log/audit-log.type";

import type {
  EventSettingsAuditContext,
  EventSettingsAuditSnapshot,
  LogoChange,
} from "./event-settings-persistence.type";

type SettingsSnapshotInput = {
  title: string;
  description: string;
  accentColor: string;
  logoBytes: Buffer | null;
  logoMime: string | null;
  logoAlt: string | null;
  minRange: number;
  maxRange: number;
  excludedNumbers: number[];
};

export function resolveLogoChange(input: {
  hasExistingLogo: boolean;
  hasReplacementLogo: boolean;
  removeLogo: boolean;
}): LogoChange {
  if (input.hasReplacementLogo) return "replace";
  if (input.removeLogo && input.hasExistingLogo) return "remove";
  return "none";
}

export function toEventSettingsAuditSnapshot(
  input: SettingsSnapshotInput
): EventSettingsAuditSnapshot {
  return {
    title: input.title,
    description: input.description,
    accentColor: input.accentColor,
    hasLogo: Boolean(input.logoBytes),
    logoMime: input.logoMime,
    logoAlt: input.logoAlt ?? input.title,
    minRange: input.minRange,
    maxRange: input.maxRange,
    excludedNumbers: input.excludedNumbers,
  };
}

export function buildEventSettingsAuditEvents(input: {
  context: EventSettingsAuditContext;
  before: EventSettingsAuditSnapshot | null;
  after: EventSettingsAuditSnapshot;
  logoChange: LogoChange;
  occurredAt: Date;
}): AdminAuditEvent[] {
  const { context, before, after, logoChange, occurredAt } = input;
  const metadata = { before, after };
  const events = [
    buildAdminAuditEvent(
      {
        action: "settings.update",
        outcome: "success",
        actor: context.actor,
        metadata,
      },
      context.request,
      occurredAt
    ),
  ];

  if (logoChange === "replace" || logoChange === "remove") {
    events.push(
      buildAdminAuditEvent(
        {
          action: logoChange === "replace" ? "logo.replace" : "logo.remove",
          outcome: "success",
          actor: context.actor,
          metadata,
        },
        context.request,
        occurredAt
      )
    );
  }
  return events;
}
