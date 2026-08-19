"use client";

import type { CSSProperties } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createBrandPalette } from "@/shared/brand/brand-color";

import { PickerPreview } from "./picker-preview";
import { SharedLinkPreview } from "./shared-link-preview";
import type { SettingsShareState } from "../event-settings-share.type";

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
  const palette = createBrandPalette(accentColor);
  const resolvedTitle = title || "Untitled event";
  const resolvedDescription =
    description || "Add a short description for guests.";
  const previewStyle = {
    "--preview-accent": accentColor,
    "--preview-foreground": palette.foreground,
    "--preview-display-light": palette.displayLight,
    "--preview-display-dark": palette.displayDark,
  } as CSSProperties;

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
            <PickerPreview
              title={resolvedTitle}
              description={resolvedDescription}
              logoAlt={logoAlt}
              logoUrl={logoUrl}
              minRange={minRange}
              maxRange={maxRange}
              excludedNumbers={excludedNumbers}
              previewStyle={previewStyle}
            />
          </TabsContent>
          <TabsContent value="shared-link">
            <SharedLinkPreview
              shareUrl={shareUrl}
              shareState={shareState}
              title={resolvedTitle}
              description={resolvedDescription}
              logoAlt={logoAlt}
              logoUrl={logoUrl}
              previewStyle={previewStyle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
