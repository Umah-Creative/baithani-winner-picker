import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { serializeAdminLogFilters } from "../audit-log-filter";
import type { AdminAuditLogPage } from "../audit-log-view.type";

function pageHref(page: AdminAuditLogPage, nextPage: number): string {
  const query = serializeAdminLogFilters({
    ...page.filters,
    page: nextPage,
    offset: (nextPage - 1) * page.filters.limit,
  });
  return query ? `/admin/logs?${query}` : "/admin/logs";
}

export function AuditLogPagination(props: { page: AdminAuditLogPage }) {
  const { page } = props;
  if (page.totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between gap-3"
      aria-label="Log pagination"
    >
      {page.filters.page > 1 ? (
        <Link
          href={pageHref(page, page.filters.page - 1)}
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
        Page {page.filters.page} of {page.totalPages}
      </span>
      {page.filters.page < page.totalPages ? (
        <Link
          href={pageHref(page, page.filters.page + 1)}
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
  );
}
