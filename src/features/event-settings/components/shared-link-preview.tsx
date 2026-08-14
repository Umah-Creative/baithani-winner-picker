import type { CSSProperties } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCopyFeedback } from "../hooks/use-copy-feedback";
import type { SettingsShareState } from "./settings-preview";
import { PreviewLogo } from "./preview-logo";

type SharedLinkPreviewProps = {
  shareUrl?: string;
  shareState: SettingsShareState;
  title: string;
  description: string;
  logoAlt: string;
  logoUrl?: string;
  previewStyle: CSSProperties;
};

export function SharedLinkPreview(props: SharedLinkPreviewProps) {
  const {
    shareUrl,
    shareState,
    title,
    description,
    logoAlt,
    logoUrl,
    previewStyle,
  } = props;
  const copyDisabled = !shareUrl || shareState === "setup";
  const copyFeedback = useCopyFeedback(shareUrl, copyDisabled);
  const shareGuidance = !shareUrl
    ? "Set SITE_URL to enable link copying."
    : shareState === "setup"
      ? "Save event settings before sharing this link."
      : shareState === "draft"
        ? "This preview has unsaved changes. The copied link still opens the last saved version."
        : "Copy the public event link to share this saved event.";

  return (
    <div className="p-4" style={previewStyle}>
      <div className="aspect-[1200/630] overflow-hidden rounded-xl bg-[var(--preview-accent)] p-5 text-[var(--preview-foreground)] shadow-sm">
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-4">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold tracking-[0.14em] uppercase opacity-75">
                Baithani Winner Picker
              </p>
              <h3 className="mt-2 line-clamp-2 text-xl leading-tight font-bold tracking-tight">
                {title}
              </h3>
              <p className="mt-2 line-clamp-2 text-xs leading-5 opacity-80">
                {description}
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
          onClick={copyFeedback.copy}
          aria-live="polite"
        >
          {copyFeedback.copied ? (
            <CheckIcon data-icon="inline-start" aria-hidden="true" />
          ) : (
            <CopyIcon data-icon="inline-start" aria-hidden="true" />
          )}
          {copyFeedback.copied ? "Copied" : "Copy event link"}
        </Button>
      </div>
    </div>
  );
}
