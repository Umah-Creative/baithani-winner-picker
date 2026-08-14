import { ImageResponse } from "next/og";

import { createBrandPalette } from "@/shared/brand/brand-color";
import {
  DEFAULT_EVENT_DESCRIPTION,
  DEFAULT_EVENT_TITLE,
} from "@/features/event-sharing/event-metadata";
import { getEventShareCardMedia } from "@/features/event-settings/server/event-settings-media.query";
import { DEFAULT_ACCENT_COLOR } from "@/features/event-settings/event-settings.constant";

export const alt = "Baithani event shared-link preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OpenGraphImage() {
  const settings = await getEventShareCardMedia();
  const title = settings?.title ?? DEFAULT_EVENT_TITLE;
  const description = settings?.description ?? DEFAULT_EVENT_DESCRIPTION;
  const accentColor = settings?.accentColor ?? DEFAULT_ACCENT_COLOR;
  const palette = createBrandPalette(accentColor);
  const logoBytes = settings?.logoBytes
    ? new Uint8Array(settings.logoBytes).buffer
    : null;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: accentColor,
        color: palette.foreground,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -120,
          top: -180,
          display: "flex",
          width: 520,
          height: 520,
          borderRadius: 520,
          background: "rgba(255,255,255,0.14)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -140,
          bottom: -260,
          display: "flex",
          width: 620,
          height: 620,
          borderRadius: 620,
          background: "rgba(0,0,0,0.10)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "64px 72px 52px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flex: 1,
            gap: 64,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 720,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                opacity: 0.76,
              }}
            >
              Baithani Winner Picker
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: title.length > 44 ? 58 : 72,
                lineHeight: 1.04,
                fontWeight: 800,
                letterSpacing: "-0.035em",
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                maxWidth: 700,
                fontSize: 30,
                lineHeight: 1.35,
                opacity: 0.8,
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 286,
              height: 286,
              borderRadius: 40,
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 28px 70px rgba(35,12,29,0.18)",
              color: "#2a1824",
              padding: 40,
            }}
          >
            {logoBytes ? (
              // ImageResponse accepts binary image sources even though React DOM types use strings.
              <img
                src={logoBytes as unknown as string}
                alt={settings?.logoAlt ?? title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                  borderRadius: 999,
                  background: accentColor,
                  color: palette.foreground,
                  fontSize: 116,
                  fontWeight: 800,
                }}
              >
                B
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(255,255,255,0.22)",
            paddingTop: 28,
            fontSize: 22,
            fontWeight: 600,
            opacity: 0.72,
          }}
        >
          <span>Multimedia Baithani</span>
          <span>Live event doorprize</span>
        </div>
      </div>
    </div>,
    size
  );
}
