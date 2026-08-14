import type { CSSProperties } from "react";

import { createBrandPalette } from "@/lib/brand-color";

type SettingsPreviewProps = {
  title: string;
  description: string;
  accentColor: string;
  logoAlt: string;
  logoUrl?: string;
  minRange: number;
  maxRange: number;
  excludedNumbers: number[];
};

export function SettingsPreview(props: SettingsPreviewProps) {
  const {
    title,
    description,
    accentColor,
    logoAlt,
    logoUrl,
    minRange,
    maxRange,
    excludedNumbers,
  } = props;
  const palette = createBrandPalette(accentColor);
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
    <aside
      className="lg:sticky lg:top-6 lg:self-start"
      aria-label="Live preview"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Live preview</h2>
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Draft
          </span>
        </div>
        <div
          className="space-y-5 px-5 py-6"
          style={
            {
              "--preview-accent": accentColor,
              "--preview-foreground": palette.foreground,
              "--preview-display-light": palette.displayLight,
              "--preview-display-dark": palette.displayDark,
            } as CSSProperties
          }
        >
          <div className="flex min-h-20 items-center justify-center rounded-xl bg-[var(--preview-accent)] p-4 text-[var(--preview-foreground)]">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={logoAlt}
                className="max-h-12 max-w-32 object-contain"
              />
            ) : (
              <span className="text-sm font-semibold">Baithani</span>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {title || "Untitled event"}
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {description || "Add a short description for guests."}
            </p>
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
      </div>
    </aside>
  );
}
