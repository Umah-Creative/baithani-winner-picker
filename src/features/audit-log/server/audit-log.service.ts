import "server-only";

import { db } from "@/db/client";
import { adminAuditLogs } from "@/db/schema";

import { buildAdminAuditEvent } from "../audit-log-event";
import type { AdminAuditWriteInput } from "../audit-log.type";
import { getCurrentAdminAuditRequestMetadata } from "./audit-request";

export async function writeAdminAuditLog(
  input: AdminAuditWriteInput
): Promise<void> {
  try {
    const request = await getCurrentAdminAuditRequestMetadata();
    await db
      .insert(adminAuditLogs)
      .values(buildAdminAuditEvent(input, request));
  } catch {
    console.error("Admin audit persistence failed.", {
      action: input.action,
      outcome: input.outcome,
    });
  }
}
