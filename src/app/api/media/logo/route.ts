import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { eventSettings } from "@/lib/schema";

export async function GET() {
  const [row] = await db
    .select({ logoBytes: eventSettings.logoBytes, logoMime: eventSettings.logoMime })
    .from(eventSettings)
    .where(eq(eventSettings.id, 1))
    .limit(1);

  if (!row?.logoBytes) {
    return new NextResponse("No logo configured", { status: 404 });
  }

  return new NextResponse(new Uint8Array(row.logoBytes), {
    headers: {
      "Content-Type": row.logoMime ?? "image/png",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
