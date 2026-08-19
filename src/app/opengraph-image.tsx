import { ImageResponse } from "next/og";

import {
  DEFAULT_EVENT_DESCRIPTION,
  DEFAULT_EVENT_TITLE,
} from "@/features/event-sharing/event-metadata";
import { EventSharingCard } from "@/features/event-sharing/event-sharing-card";
import { DEFAULT_ACCENT_COLOR } from "@/features/event-settings/event-settings.constant";
import { getEventShareCardMedia } from "@/features/event-settings/server/event-settings-media.query";

export const alt = "Baithani event shared-link preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OpenGraphImage() {
  const settings = await getEventShareCardMedia();
  const title = settings?.title ?? DEFAULT_EVENT_TITLE;
  const logoBytes = settings?.logoBytes
    ? new Uint8Array(settings.logoBytes).buffer
    : null;

  return new ImageResponse(
    <EventSharingCard
      title={title}
      description={settings?.description ?? DEFAULT_EVENT_DESCRIPTION}
      accentColor={settings?.accentColor ?? DEFAULT_ACCENT_COLOR}
      logoBytes={logoBytes}
      logoAlt={settings?.logoAlt ?? title}
    />,
    size
  );
}
