import { Badge } from "@/components/ui/badge";

import { formatAuditAction, formatAuditOutcome } from "../audit-log-labels";
import type { AdminAuditLogRow } from "../audit-log-view.type";
import { AuditLogDetails } from "./audit-log-details";
import { AuditLogTimestamp } from "./audit-log-timestamp";

function outcomeVariant(
  outcome: string
): "secondary" | "destructive" | "outline" {
  if (outcome === "success") return "secondary";
  if (outcome === "failure") return "destructive";
  return "outline";
}

export function AuditLogEntry(props: { row: AdminAuditLogRow }) {
  const { row } = props;

  return (
    <li className="px-5 py-5">
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
            <AuditLogTimestamp occurredAt={row.occurredAt} /> · {row.actor}
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
      <AuditLogDetails
        action={row.action}
        outcome={row.outcome}
        metadata={row.metadata}
        userAgent={row.userAgent}
        acceptLanguage={row.acceptLanguage}
      />
    </li>
  );
}
