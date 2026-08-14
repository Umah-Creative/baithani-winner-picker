import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_AUDIT_ACTIONS } from "@/lib/admin-audit.shared";
import {
  ADMIN_AUDIT_OUTCOMES,
  formatAuditSettingsDiff,
  serializeAdminLogFilters,
} from "@/lib/admin-logs.shared";
import type { AdminAuditLogPage } from "@/lib/admin-logs.service";

function formatOccurredAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function outcomeVariant(
  outcome: string
): "default" | "destructive" | "outline" {
  if (outcome === "success") return "default";
  if (outcome === "failure") return "destructive";
  return "outline";
}

function pageHref(page: AdminAuditLogPage, nextPage: number): string {
  const query = serializeAdminLogFilters({
    ...page.filters,
    page: nextPage,
    offset: (nextPage - 1) * page.filters.limit,
  });
  return query ? `/admin/logs?${query}` : "/admin/logs";
}

function AuditDetails({
  metadata,
  userAgent,
  acceptLanguage,
}: {
  metadata: Record<string, unknown>;
  userAgent: string | null;
  acceptLanguage: string | null;
}) {
  const changes = formatAuditSettingsDiff(metadata);

  return (
    <details className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
      <summary className="cursor-pointer text-sm font-medium text-foreground">
        Sanitized change details
      </summary>
      {userAgent || acceptLanguage ? (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {userAgent ? (
            <div>
              <dt className="font-medium text-foreground">User agent</dt>
              <dd className="break-words text-muted-foreground">{userAgent}</dd>
            </div>
          ) : null}
          {acceptLanguage ? (
            <div>
              <dt className="font-medium text-foreground">Locale</dt>
              <dd className="break-words text-muted-foreground">
                {acceptLanguage}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {changes.length ? (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          {changes.map((change) => (
            <div key={change.field} className="contents">
              <dt className="font-medium text-foreground">{change.field}</dt>
              <dd className="break-words text-muted-foreground">
                {JSON.stringify(change.before ?? null)}
              </dd>
              <dd className="break-words text-foreground">
                {JSON.stringify(change.after ?? null)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <pre className="mt-3 overflow-x-auto text-xs text-muted-foreground">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      )}
    </details>
  );
}

export function LogsTable({ page }: { page: AdminAuditLogPage }) {
  const { filters } = page;

  return (
    <div className="space-y-5">
      <form className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-sm font-medium text-foreground">
          Action
          <select
            name="action"
            defaultValue={filters.action ?? ""}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All actions</option>
            {ADMIN_AUDIT_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-foreground">
          Outcome
          <select
            name="outcome"
            defaultValue={filters.outcome ?? ""}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All outcomes</option>
            {ADMIN_AUDIT_OUTCOMES.map((outcome) => (
              <option key={outcome} value={outcome}>
                {outcome}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-foreground">
          From date
          <Input name="from" type="date" defaultValue={filters.from} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-foreground">
          To date
          <Input name="to" type="date" defaultValue={filters.to} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-foreground">
          IP address
          <Input
            name="ip"
            defaultValue={filters.ip}
            placeholder="203.0.113.8"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-foreground">
          Request ID
          <Input
            name="requestId"
            defaultValue={filters.requestId}
            placeholder="req-…"
          />
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit">Filter logs</Button>
          <Button variant="outline" render={<Link href="/admin/logs" />}>
            Reset
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-medium text-foreground">
            {page.total} audit events
          </p>
          <p className="text-sm text-muted-foreground">50 per page</p>
        </div>
        {page.rows.length ? (
          <ul className="divide-y divide-border">
            {page.rows.map((row) => (
              <li key={row.id} className="px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-sm font-semibold text-foreground">
                        {row.action}
                      </code>
                      <Badge variant={outcomeVariant(row.outcome)}>
                        {row.outcome}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatOccurredAt(row.occurredAt)} · {row.actor}
                    </p>
                  </div>
                  <dl className="grid gap-1 text-xs text-muted-foreground sm:text-right">
                    <div>
                      <dt className="sr-only">IP address</dt>
                      <dd>{row.ipAddress ?? "IP unavailable"}</dd>
                    </div>
                    <div>
                      <dt className="sr-only">Request ID</dt>
                      <dd>{row.requestId ?? "Request ID unavailable"}</dd>
                    </div>
                  </dl>
                </div>
                <AuditDetails
                  metadata={row.metadata}
                  userAgent={row.userAgent}
                  acceptLanguage={row.acceptLanguage}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No audit events match these filters.
          </p>
        )}
      </div>

      <nav
        className="flex items-center justify-between"
        aria-label="Log pagination"
      >
        <Button
          variant="outline"
          disabled={filters.page <= 1}
          render={
            filters.page > 1 ? (
              <Link href={pageHref(page, filters.page - 1)} />
            ) : undefined
          }
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {filters.page} of {page.totalPages}
        </span>
        <Button
          variant="outline"
          disabled={filters.page >= page.totalPages}
          render={
            filters.page < page.totalPages ? (
              <Link href={pageHref(page, filters.page + 1)} />
            ) : undefined
          }
        >
          Next
        </Button>
      </nav>
    </div>
  );
}
