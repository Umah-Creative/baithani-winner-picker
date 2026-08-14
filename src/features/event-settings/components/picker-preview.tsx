import type { CSSProperties } from "react";

import { PreviewLogo } from "./preview-logo";

type PickerPreviewProps = {
  title: string;
  description: string;
  logoAlt: string;
  logoUrl?: string;
  minRange: number;
  maxRange: number;
  excludedNumbers: number[];
  previewStyle: CSSProperties;
};

export function PickerPreview(props: PickerPreviewProps) {
  const {
    title,
    description,
    logoAlt,
    logoUrl,
    minRange,
    maxRange,
    excludedNumbers,
    previewStyle,
  } = props;
  const rangeIsValid =
    Number.isSafeInteger(minRange) &&
    Number.isSafeInteger(maxRange) &&
    minRange >= 1 &&
    maxRange <= 10_000 &&
    minRange < maxRange;
  const excludedCount = rangeIsValid
    ? excludedNumbers.filter(
        (number) => number >= minRange && number <= maxRange
      ).length
    : 0;

  return (
    <div className="flex flex-col gap-5 px-5 py-6" style={previewStyle}>
      <div className="flex min-h-24 items-center justify-center rounded-xl bg-[var(--preview-accent)] p-4 text-[var(--preview-foreground)]">
        <PreviewLogo logoUrl={logoUrl} logoAlt={logoAlt} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Draw pool
        </p>
        <p className="mt-1 font-mono text-sm font-semibold text-foreground">
          {rangeIsValid ? `${minRange}–${maxRange}` : "Set valid range"}
          {rangeIsValid ? ` · ${excludedCount} excluded` : null}
        </p>
        <div className="mt-3 h-2 rounded-full bg-background">
          <div
            className="h-full rounded-full bg-[var(--preview-display-light)] dark:bg-[var(--preview-display-dark)]"
            style={{ width: rangeIsValid ? "72%" : "18%" }}
          />
        </div>
      </div>
    </div>
  );
}
