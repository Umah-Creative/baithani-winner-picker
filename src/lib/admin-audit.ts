import "server-only";

import { headers } from "next/headers";

import { db } from "@/db/client";
import { adminAuditLogs } from "@/db/schema";

import {
  buildAdminAuditEvent,
  getAdminAuditRequestMetadata,
  type AdminAuditEventInput,
} from "./admin-audit.shared";

export * from "./admin-audit.shared";

function trustsProxyHeaders(): boolean {
  return process.env.TRUST_PROXY_HEADERS === "true";
}

export async function writeAdminAuditLog(
  input: AdminAuditEventInput
): Promise<void> {
  try {
    const event = buildAdminAuditEvent(input);
    await db.insert(adminAuditLogs).values(event);
  } catch {
    // Audit persistence is deliberately best-effort.
  }
}

export async function writeCurrentAdminAuditLog(
  input: Omit<AdminAuditEventInput, "request">
): Promise<void> {
  try {
    const requestHeaders = await headers();
    await writeAdminAuditLog({
      ...input,
      request: getAdminAuditRequestMetadata(requestHeaders, {
        trustedProxy: trustsProxyHeaders(),
      }),
    });
  } catch {
    // Request metadata must not prevent the primary server action.
  }
}
