import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { eventSettings } from "@/db/schema";
import type { EventSettingsView } from "@/lib/event-settings.type";

export type EventShareCardMedia = {
  title: string;
  description: string;
  accentColor: string;
  logoAlt: string;
  logoBytes: Uint8Array | null;
  logoMime: string | null;
};

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

export const getEventShareCardMedia = cache(
  async (): Promise<EventShareCardMedia | null> => {
    const [row] = await db
      .select({
        title: eventSettings.title,
        description: eventSettings.description,
        accentColor: eventSettings.accentColor,
        logoAlt: eventSettings.logoAlt,
        logoBytes: eventSettings.logoBytes,
        logoMime: eventSettings.logoMime,
      })
      .from(eventSettings)
      .where(eq(eventSettings.id, 1))
      .limit(1);

    if (!row) return null;

    return {
      title: row.title,
      description: row.description,
      accentColor: row.accentColor,
      logoAlt: row.logoAlt ?? row.title,
      logoBytes: row.logoBytes ? new Uint8Array(row.logoBytes) : null,
      logoMime: row.logoMime,
    };
  }
);
