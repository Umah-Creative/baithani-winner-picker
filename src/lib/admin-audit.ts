import "server-only";

import { headers } from "next/headers";

import { db } from "@/db/client";
import { adminAuditLogs } from "@/db/schema";

import {
  buildAdminAuditEvent,
  getAdminAuditRequestMetadata,
  type AdminAuditWriteInput,
} from "./admin-audit.shared";

export * from "./admin-audit.shared";

export async function writeAdminAuditLog(
  input: AdminAuditWriteInput
): Promise<void> {
  try {
    const requestHeaders = await headers();
    const event = buildAdminAuditEvent(
      input,
      getAdminAuditRequestMetadata(requestHeaders)
    );
    await db.insert(adminAuditLogs).values(event);
  } catch {
    // Audit persistence is deliberately best-effort.
  }
}
