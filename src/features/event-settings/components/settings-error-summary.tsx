import type { RefObject } from "react";

import type { EventSettingsFieldError } from "../event-settings.type";

type SettingsErrorSummaryProps = {
  error?: string;
  fieldErrors?: EventSettingsFieldError;
  summaryRef: RefObject<HTMLDivElement | null>;
};

export function SettingsErrorSummary(props: SettingsErrorSummaryProps) {
  const { error, fieldErrors, summaryRef } = props;
  if (!error && !fieldErrors) return null;

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
    >
      <p className="font-semibold">Review the highlighted fields.</p>
      {error ? <p className="mt-1">{error}</p> : null}
      {fieldErrors ? (
        <ul className="mt-2 list-disc pl-5">
          {Object.entries(fieldErrors).map(([field, message]) => (
            <li key={field}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
