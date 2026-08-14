import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { eventSettings } from "@/db/schema";
import type { EventSettingsView } from "@/features/event-settings/event-settings.type";

import { ACTIVE_EVENT_SETTINGS_ID } from "../event-settings.constant";
import { toEventSettingsView } from "./event-settings-projection";

export const getEventSettings = cache(
  async (): Promise<EventSettingsView | null> => {
    const [row] = await db
      .select()
      .from(eventSettings)
      .where(eq(eventSettings.id, ACTIVE_EVENT_SETTINGS_ID))
      .limit(1);

    if (!row) {
      return null;
    }

    return toEventSettingsView(row);
  }
);
