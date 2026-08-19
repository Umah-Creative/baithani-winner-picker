import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { eventSettings } from "@/db/schema";

import { ACTIVE_EVENT_SETTINGS_ID } from "../event-settings.constant";

export type EventShareCardMedia = {
  title: string;
  description: string;
  accentColor: string;
  logoAlt: string;
  logoBytes: Uint8Array | null;
  logoMime: string | null;
};

export type EventLogoMedia = {
  bytes: ArrayBuffer;
  mime: string;
};

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
      .where(eq(eventSettings.id, ACTIVE_EVENT_SETTINGS_ID))
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

export async function getEventLogoMedia(): Promise<EventLogoMedia | null> {
  const [row] = await db
    .select({
      logoBytes: eventSettings.logoBytes,
      logoMime: eventSettings.logoMime,
    })
    .from(eventSettings)
    .where(eq(eventSettings.id, ACTIVE_EVENT_SETTINGS_ID))
    .limit(1);

  if (!row?.logoBytes) return null;

  return {
    bytes: Uint8Array.from(row.logoBytes).buffer,
    mime: row.logoMime ?? "image/png",
  };
}
