import { NextResponse } from "next/server";

import { getEventLogoMedia } from "@/features/event-settings/server/event-settings-media.query";

export async function GET() {
  const logo = await getEventLogoMedia();

  if (!logo) {
    return new NextResponse("No logo configured", { status: 404 });
  }

  return new NextResponse(logo.bytes, {
    headers: {
      "Content-Type": logo.mime,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
