"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createBrandPalette } from "@/lib/brand-color";

export type SettingsShareState = "setup" | "draft" | "saved";

type SettingsPreviewProps = {
  shareUrl?: string;
  shareState: SettingsShareState;
  title: string;
  description: string;
  accentColor: string;
  logoAlt: string;
  logoUrl?: string;
  minRange: number;
  maxRange: number;
  excludedNumbers: number[];
};

function PreviewLogo(props: { logoUrl?: string; logoAlt: string }) {
  const { logoUrl, logoAlt } = props;

  return logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={logoAlt}
      className="max-h-16 max-w-36 object-contain"
    />
  ) : (
    <span className="text-sm font-semibold">Baithani</span>
  );
}

export function SettingsPreview(props: SettingsPreviewProps) {
  const {
    shareUrl,
    shareState,
    title,
    description,
    accentColor,
    logoAlt,
    logoUrl,
    minRange,
    maxRange,
    excludedNumbers,
  } = props;
  const [copied, setCopied] = useState(false);
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
  const resolvedTitle = title || "Untitled event";
  const resolvedDescription =
    description || "Add a short description for guests.";
  const previewStyle = {
    "--preview-accent": accentColor,
    "--preview-foreground": palette.foreground,
    "--preview-display-light": palette.displayLight,
    "--preview-display-dark": palette.displayDark,
  } as CSSProperties;
  const copyDisabled = !shareUrl || shareState === "setup";
  const shareGuidance = !shareUrl
    ? "Set SITE_URL to enable link copying."
    : shareState === "setup"
      ? "Save event settings before sharing this link."
      : shareState === "draft"
        ? "This preview has unsaved changes. The copied link still opens the last saved version."
        : "Copy the public event link to share this saved event.";

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), 2_000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyEventLink() {
    if (copyDisabled || !shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      toast.error("Could not copy the event link. Try again.");
    }
  }

  return (
    <aside
      className="lg:sticky lg:top-6 lg:self-start"
      aria-label="Settings preview"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Preview</h2>
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Draft
          </span>
        </div>
        <Tabs defaultValue="picker" className="gap-0">
          <div className="border-b border-border px-4 py-3">
            <TabsList className="w-full">
              <TabsTrigger value="picker">Picker</TabsTrigger>
              <TabsTrigger value="shared-link">Shared link</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="picker">
            <div className="flex flex-col gap-5 px-5 py-6" style={previewStyle}>
              <div className="flex min-h-24 items-center justify-center rounded-xl bg-[var(--preview-accent)] p-4 text-[var(--preview-foreground)]">
                <PreviewLogo logoUrl={logoUrl} logoAlt={logoAlt} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {resolvedTitle}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {resolvedDescription}
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
          </TabsContent>
          <TabsContent value="shared-link">
            <div className="p-4" style={previewStyle}>
              <div className="aspect-[1200/630] overflow-hidden rounded-xl bg-[var(--preview-accent)] p-5 text-[var(--preview-foreground)] shadow-sm">
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-4">
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-semibold tracking-[0.14em] uppercase opacity-75">
                        Baithani Winner Picker
                      </p>
                      <h3 className="mt-2 line-clamp-2 text-xl leading-tight font-bold tracking-tight">
                        {resolvedTitle}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 opacity-80">
                        {resolvedDescription}
                      </p>
                    </div>
                    <div className="flex aspect-square items-center justify-center rounded-xl bg-background/90 p-3 text-foreground">
                      <PreviewLogo logoUrl={logoUrl} logoAlt={logoAlt} />
                    </div>
                  </div>
                  <p className="text-[0.65rem] font-medium opacity-70">
                    Multimedia Baithani
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted-foreground">
                  {shareGuidance}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 self-start sm:self-auto"
                  disabled={copyDisabled}
                  onClick={copyEventLink}
                  aria-live="polite"
                >
                  {copied ? (
                    <CheckIcon data-icon="inline-start" aria-hidden="true" />
                  ) : (
                    <CopyIcon data-icon="inline-start" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy event link"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
