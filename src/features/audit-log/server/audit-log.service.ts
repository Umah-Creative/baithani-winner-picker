import "server-only";

import { db } from "@/db/client";
import { adminAuditLogs } from "@/db/schema";
import { getCurrentRequestContext } from "@/shared/request-context/current-request-context.server";

import { buildAdminAuditEvent } from "./audit-log-event";
import type { AdminAuditWriteInput } from "./audit-log-event.type";

export async function writeAdminAuditLog(
  input: AdminAuditWriteInput
): Promise<void> {
  try {
    const request = await getCurrentRequestContext();
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
