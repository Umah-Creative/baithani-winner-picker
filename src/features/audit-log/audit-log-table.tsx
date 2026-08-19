import type { AdminAuditLogPage } from "./audit-log-view.type";
import { serializeAdminLogFilters } from "./audit-log-filter";
import { AuditLogEntry } from "./components/audit-log-entry";
import { LogFilters } from "./components/audit-log-filters";
import { AuditLogPagination } from "./components/audit-log-pagination";

export function LogsTable(props: { page: AdminAuditLogPage }) {
  const { page } = props;
  const filterStateKey = serializeAdminLogFilters(page.filters);

  return (
    <div className="flex flex-col gap-5">
      <LogFilters key={filterStateKey} filters={page.filters} />
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
              <AuditLogEntry key={row.id} row={row} />
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No audit events match these filters.
          </p>
        )}
      </div>
      <AuditLogPagination page={page} />
    </div>
  );
}
