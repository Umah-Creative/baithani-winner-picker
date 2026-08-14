import "server-only";

import { eventSettings } from "@/db/schema";

import type { EventSettingsView } from "../event-settings.type";

export function toEventSettingsView(
  row: typeof eventSettings.$inferSelect
): EventSettingsView {
  return {
    title: row.title,
    description: row.description,
    accentColor: row.accentColor,
    hasLogo: Boolean(row.logoBytes),
    logoAlt: row.logoAlt ?? row.title,
    minRange: row.minRange,
    maxRange: row.maxRange,
    excludedNumbers: row.excludedNumbers,
    updatedAt: row.updatedAt.toISOString(),
  };
}
