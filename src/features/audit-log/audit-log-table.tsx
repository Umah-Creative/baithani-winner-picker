import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  formatAuditSettingsDiff,
  serializeAdminLogFilters,
} from "@/features/audit-log/audit-log-filter";
import type { AdminAuditLogPage } from "@/features/audit-log/server/audit-log.query";
import { cn } from "@/lib/utils";

import { formatAuditAction, formatAuditOutcome } from "./audit-log-labels";
import { LogFilters } from "./components/audit-log-filters";

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  accentColor: "Accent color",
  hasLogo: "Logo present",
  logoMime: "Logo format",
  logoAlt: "Logo alt text",
  minRange: "Minimum range",
  maxRange: "Maximum range",
  excludedNumbers: "Excluded numbers",
};

function formatOccurredAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined) return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value || "Empty";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function outcomeVariant(
  outcome: string
): "secondary" | "destructive" | "outline" {
  if (outcome === "success") return "secondary";
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

function AuditDetails(props: {
  action: string;
  outcome: string;
  metadata: Record<string, unknown>;
  userAgent: string | null;
  acceptLanguage: string | null;
}) {
  const { action, outcome, metadata, userAgent, acceptLanguage } = props;
  const changes = formatAuditSettingsDiff(metadata);

  return (
    <details className="mt-4 rounded-xl border border-border bg-muted/20 p-3">
      <summary className="min-h-8 cursor-pointer text-sm font-medium text-foreground">
        View changes
      </summary>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-foreground">Action code</dt>
          <dd className="mt-1 break-words font-mono text-xs text-muted-foreground">
            {action}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Outcome code</dt>
          <dd className="mt-1 break-words font-mono text-xs text-muted-foreground">
            {outcome}
          </dd>
        </div>
        {userAgent ? (
          <div>
            <dt className="font-medium text-foreground">User agent</dt>
            <dd className="mt-1 break-words text-muted-foreground">
              {userAgent}
            </dd>
          </div>
        ) : null}
        {acceptLanguage ? (
          <div>
            <dt className="font-medium text-foreground">Locale</dt>
            <dd className="mt-1 break-words text-muted-foreground">
              {acceptLanguage}
            </dd>
          </div>
        ) : null}
      </dl>

      {changes.length ? (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-xl border-collapse text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Field
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Before
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  After
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {changes.map((change) => (
                <tr key={change.field}>
                  <th
                    scope="row"
                    className="w-1/4 px-3 py-3 align-top font-medium text-foreground"
                  >
                    {FIELD_LABELS[change.field] ?? change.field}
                  </th>
                  <td className="w-3/8 whitespace-pre-wrap px-3 py-3 align-top text-muted-foreground">
                    {formatAuditValue(change.before)}
                  </td>
                  <td className="w-3/8 whitespace-pre-wrap px-3 py-3 align-top text-foreground">
                    {formatAuditValue(change.after)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : Object.keys(metadata).length ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground">Metadata</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-background p-3 text-xs text-muted-foreground">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No field changes were recorded for this event.
        </p>
      )}
    </details>
  );
}

export function LogsTable(props: { page: AdminAuditLogPage }) {
  const { page } = props;
  const { filters } = page;
  const filterStateKey = serializeAdminLogFilters(filters);

  return (
    <div className="flex flex-col gap-5">
      <LogFilters key={filterStateKey} filters={filters} />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
          <p className="font-medium text-foreground">
            {page.total} audit {page.total === 1 ? "event" : "events"}
          </p>
          {page.totalPages > 1 ? (
            <p className="text-sm text-muted-foreground">50 per page</p>
          ) : null}
        </div>
        {page.rows.length ? (
          <ul className="divide-y divide-border">
            {page.rows.map((row) => (
              <li key={row.id} className="px-5 py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-foreground">
                        {formatAuditAction(row.action)}
                      </h2>
                      <Badge variant={outcomeVariant(row.outcome)}>
                        {formatAuditOutcome(row.outcome)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatOccurredAt(row.occurredAt)} · {row.actor}
                    </p>
                  </div>
                  {row.ipAddress || row.requestId ? (
                    <dl className="grid gap-1 text-xs text-muted-foreground sm:text-right">
                      {row.ipAddress ? (
                        <div>
                          <dt className="sr-only">IP address</dt>
                          <dd>{row.ipAddress}</dd>
                        </div>
                      ) : null}
                      {row.requestId ? (
                        <div>
                          <dt className="sr-only">Request ID</dt>
                          <dd>{row.requestId}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                </div>
                <AuditDetails
                  action={row.action}
                  outcome={row.outcome}
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

      {page.totalPages > 1 ? (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label="Log pagination"
        >
          {filters.page > 1 ? (
            <Link
              href={pageHref(page, filters.page - 1)}
              className={buttonVariants({ variant: "outline" })}
            >
              Previous
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "pointer-events-none opacity-50"
              )}
            >
              Previous
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {page.totalPages}
          </span>
          {filters.page < page.totalPages ? (
            <Link
              href={pageHref(page, filters.page + 1)}
              className={buttonVariants({ variant: "outline" })}
            >
              Next
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "pointer-events-none opacity-50"
              )}
            >
              Next
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
