import type { Metadata } from "next";

import type { EventSettingsView } from "@/features/event-settings/event-settings.type";

export const DEFAULT_EVENT_TITLE = "Baithani Winner Picker";
export const DEFAULT_EVENT_DESCRIPTION =
  "Doorprize winner picker for Baithani events.";

export function buildEventMetadata(
  settings: EventSettingsView | null,
  siteUrl: URL | undefined
): Metadata {
  const eventTitle = settings?.title ?? DEFAULT_EVENT_TITLE;
  const brandedTitle = `GPT Baithani - ${eventTitle}`;
  const description = settings?.description ?? DEFAULT_EVENT_DESCRIPTION;
  const canonicalUrl = siteUrl ? new URL("/", siteUrl) : undefined;
  const shareImageUrl = siteUrl
    ? new URL("/opengraph-image", siteUrl)
    : undefined;
  const shareImage = shareImageUrl
    ? {
        url: shareImageUrl,
        width: 1200,
        height: 630,
        alt: `${eventTitle} shared-link preview`,
        type: "image/png",
      }
    : undefined;

  return {
    metadataBase: siteUrl,
    title: {
      default: brandedTitle,
      template: "%s | Baithani Winner Picker",
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: [
        {
          url: "/baithani-icon-32x32.png",
          type: "image/png",
          sizes: "32x32",
        },
        {
          url: "/baithani-icon-16x16.png",
          type: "image/png",
          sizes: "16x16",
        },
      ],
      apple: [{ url: "/baithani-icon-180x180.png", sizes: "180x180" }],
      other: [{ rel: "manifest", url: "/site.webmanifest" }],
    },
    openGraph: {
      title: brandedTitle,
      description,
      url: canonicalUrl,
      siteName: DEFAULT_EVENT_TITLE,
      type: "website",
      images: shareImage ? [shareImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: shareImage ? [shareImage] : undefined,
    },
  };
}
