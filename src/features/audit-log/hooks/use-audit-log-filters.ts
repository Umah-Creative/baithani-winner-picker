"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { DateRange } from "react-day-picker";

import {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_OUTCOMES,
} from "../audit-log.constant";
import { formatLogDateRange, parseLogFilterDate } from "../audit-log-date";
import { formatAuditAction, formatAuditOutcome } from "../audit-log-labels";
import type { AdminLogFilters } from "../audit-log-view.type";

export function useAuditLogFilters(filters: AdminLogFilters) {
  const [action, setAction] = useState(filters.action ?? "");
  const [outcome, setOutcome] = useState(filters.outcome ?? "");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = parseLogFilterDate(filters.from);
    const to = parseLogFilterDate(filters.to);
    return from || to ? { from, to } : undefined;
  });
  const [ip, setIp] = useState(filters.ip ?? "");
  const [requestId, setRequestId] = useState(filters.requestId ?? "");
  const browserTimeZone = useSyncExternalStore(
    () => () => undefined,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => ""
  );
  const timeZone = filters.tz ?? browserTimeZone;

  const actionItems = useMemo(
    () => [
      { label: "All actions", value: null },
      ...ADMIN_AUDIT_ACTIONS.map((value) => ({
        label: formatAuditAction(value),
        value,
      })),
    ],
    []
  );
  const outcomeItems = useMemo(
    () => [
      { label: "All outcomes", value: null },
      ...ADMIN_AUDIT_OUTCOMES.map((value) => ({
        label: formatAuditOutcome(value),
        value,
      })),
    ],
    []
  );
  const hasFilters = Boolean(
    action || outcome || dateRange?.from || dateRange?.to || ip || requestId
  );
  const activeFilters = [
    action ? `Action: ${formatAuditAction(action)}` : undefined,
    outcome ? `Outcome: ${formatAuditOutcome(outcome)}` : undefined,
    dateRange?.from ? `Dates: ${formatLogDateRange(dateRange)}` : undefined,
    ip ? `IP: ${ip}` : undefined,
    requestId ? `Request: ${requestId}` : undefined,
  ].filter((value): value is string => Boolean(value));
  const resetHref = timeZone
    ? `/admin/logs?${new URLSearchParams({ tz: timeZone })}`
    : "/admin/logs";

  return {
    action,
    setAction,
    outcome,
    setOutcome,
    dateRange,
    setDateRange,
    ip,
    setIp,
    requestId,
    setRequestId,
    timeZone,
    actionItems,
    outcomeItems,
    hasFilters,
    activeFilters,
    resetHref,
  };
}
