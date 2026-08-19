"use client";

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => undefined;
}

function clientSnapshot(): boolean {
  return true;
}

function serverSnapshot(): boolean {
  return false;
}

function formatTimestamp(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

export function AuditLogTimestamp(props: {
  occurredAt: string;
  timeZone?: string;
}) {
  const { occurredAt, timeZone } = props;
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot
  );
  let display = formatTimestamp(occurredAt, "UTC");

  if (hydrated) {
    try {
      display = formatTimestamp(
        occurredAt,
        timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    } catch {
      // Keep the stable UTC fallback when browser timezone data is unavailable.
    }
  }

  return (
    <time dateTime={occurredAt} suppressHydrationWarning>
      {display}
    </time>
  );
}
