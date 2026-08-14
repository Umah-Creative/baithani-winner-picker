import { describe, expect, it } from "vitest";

import {
  buildEventMetadata,
  DEFAULT_EVENT_DESCRIPTION,
  DEFAULT_EVENT_TITLE,
} from "@/lib/event-metadata";

const settings = {
  title: "Baithani Night",
  description: "Door prize draw",
  accentColor: "#d076b4",
  hasLogo: true,
  logoAlt: "Baithani logo",
  minRange: 1,
  maxRange: 100,
  excludedNumbers: [4],
  updatedAt: "2026-08-14T12:00:00.000Z",
};

describe("buildEventMetadata", () => {
  it("builds canonical Open Graph and Twitter metadata from event content", () => {
    const metadata = buildEventMetadata(
      settings,
      new URL("https://picker.baithani.example")
    );

    expect(metadata.title).toEqual({
      default: "GPT Baithani - Baithani Night",
      template: "%s | Baithani Winner Picker",
    });
    expect(metadata.description).toBe("Door prize draw");
    expect(metadata.alternates?.canonical).toEqual(
      new URL("https://picker.baithani.example/")
    );
    expect(metadata.openGraph).toMatchObject({
      title: "GPT Baithani - Baithani Night",
      description: "Door prize draw",
      siteName: DEFAULT_EVENT_TITLE,
      type: "website",
    });
    expect(metadata.openGraph?.images).toEqual([
      {
        url: new URL("https://picker.baithani.example/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Baithani Night shared-link preview",
        type: "image/png",
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "GPT Baithani - Baithani Night",
      description: "Door prize draw",
    });
  });

  it("keeps stable product defaults and icons without settings", () => {
    const metadata = buildEventMetadata(null, undefined);

    expect(metadata.title).toEqual({
      default: `GPT Baithani - ${DEFAULT_EVENT_TITLE}`,
      template: "%s | Baithani Winner Picker",
    });
    expect(metadata.description).toBe(DEFAULT_EVENT_DESCRIPTION);
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.openGraph?.title).toBe(
      `GPT Baithani - ${DEFAULT_EVENT_TITLE}`
    );
    expect(metadata.twitter?.title).toBe(
      `GPT Baithani - ${DEFAULT_EVENT_TITLE}`
    );
    expect(metadata.icons).toMatchObject({
      icon: [
        { url: "/baithani-icon-32x32.png", sizes: "32x32" },
        { url: "/baithani-icon-16x16.png", sizes: "16x16" },
      ],
      apple: [{ url: "/baithani-icon-180x180.png", sizes: "180x180" }],
    });
  });
});
