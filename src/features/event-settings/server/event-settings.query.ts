import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { eventSettings } from "@/db/schema";
import type { EventSettingsView } from "@/features/event-settings/event-settings.type";

export const getEventSettings = cache(
  async (): Promise<EventSettingsView | null> => {
    const [row] = await db
      .select()
      .from(eventSettings)
      .where(eq(eventSettings.id, 1))
      .limit(1);

    if (!row) {
      return null;
    }

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
);
