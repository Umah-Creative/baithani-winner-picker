import "server-only";

import { and, count, desc, eq, gte, ilike, lt } from "drizzle-orm";

import { db } from "@/db/client";
import { adminAuditLogs } from "@/db/schema";

import { clampAdminLogPage, parseAdminLogFilters } from "../audit-log-filter";
import { sanitizeAuditMetadata } from "../audit-log-sanitizer";
import { localDateBoundaryToUtc } from "../audit-log-time-zone";
import type { AdminAuditMetadata } from "../audit-log.type";
import type { AdminAuditLogPage } from "../audit-log-view.type";

function nextDay(date: string): Date {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value;
}

function dateBoundary(
  date: string,
  timeZone: string | undefined,
  next: boolean
) {
  if (!timeZone) {
    return next ? nextDay(date) : new Date(`${date}T00:00:00.000Z`);
  }
  return localDateBoundaryToUtc(date, timeZone, next);
}

export async function getAdminAuditLogPage(
  searchParams: Record<string, string | string[] | undefined>
): Promise<AdminAuditLogPage> {
  const requestedFilters = parseAdminLogFilters(searchParams);
  const conditions = [
    requestedFilters.action
      ? eq(adminAuditLogs.action, requestedFilters.action)
      : undefined,
    requestedFilters.outcome
      ? eq(adminAuditLogs.outcome, requestedFilters.outcome)
      : undefined,
    requestedFilters.from
      ? gte(
          adminAuditLogs.occurredAt,
          dateBoundary(requestedFilters.from, requestedFilters.tz, false)!
        )
      : undefined,
    requestedFilters.to
      ? lt(
          adminAuditLogs.occurredAt,
          dateBoundary(requestedFilters.to, requestedFilters.tz, true)!
        )
      : undefined,
    requestedFilters.ip
      ? ilike(adminAuditLogs.ipAddress, `%${requestedFilters.ip}%`)
      : undefined,
    requestedFilters.requestId
      ? ilike(adminAuditLogs.requestId, `%${requestedFilters.requestId}%`)
      : undefined,
  ].filter((condition) => condition !== undefined);
  const where = conditions.length ? and(...conditions) : undefined;
  const [{ total }] = await db
    .select({ total: count() })
    .from(adminAuditLogs)
    .where(where);
  const safeTotal = Number(total);
  const filters = clampAdminLogPage(requestedFilters, safeTotal);
  const rows = await db
    .select()
    .from(adminAuditLogs)
    .where(where)
    .orderBy(desc(adminAuditLogs.occurredAt), desc(adminAuditLogs.id))
    .limit(filters.limit)
    .offset(filters.offset);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      action: row.action,
      outcome: row.outcome,
      actor: row.actor,
      occurredAt: row.occurredAt.toISOString(),
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      acceptLanguage: row.acceptLanguage,
      requestId: row.requestId,
      metadata: sanitizeAuditMetadata(row.metadata as AdminAuditMetadata),
    })),
    total: safeTotal,
    totalPages: Math.max(1, Math.ceil(safeTotal / filters.limit)),
    filters,
  };
}
