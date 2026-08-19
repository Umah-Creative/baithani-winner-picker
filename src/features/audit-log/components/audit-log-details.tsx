import { formatAuditSettingsDiff } from "../audit-log-settings-diff";
import { AUDIT_FIELD_LABELS, formatAuditValue } from "../audit-log-value";

type AuditLogDetailsProps = {
  action: string;
  outcome: string;
  metadata: Record<string, unknown>;
  userAgent: string | null;
  acceptLanguage: string | null;
};

export function AuditLogDetails(props: AuditLogDetailsProps) {
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
                    {AUDIT_FIELD_LABELS[change.field] ?? change.field}
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
