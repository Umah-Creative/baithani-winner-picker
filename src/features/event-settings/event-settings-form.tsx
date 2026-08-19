"use client";

import { AppearanceFields } from "./components/appearance-fields";
import { DrawPoolFields } from "./components/draw-pool-fields";
import { EventDetailsFields } from "./components/event-details-fields";
import { SettingsErrorSummary } from "./components/settings-error-summary";
import { SettingsPreview } from "./components/settings-preview";
import { SettingsSaveStatus } from "./components/settings-save-status";
import type { EventSettingsView } from "./event-settings.type";
import { useEventSettingsForm } from "./hooks/use-event-settings-form";

type SettingsFormProps = {
  settings: EventSettingsView | null;
  shareUrl?: string;
};

export function SettingsForm(props: SettingsFormProps) {
  const { settings, shareUrl } = props;
  const form = useEventSettingsForm(settings);

  return (
    <form action={form.formAction} onChange={form.markDirty} className="mt-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <fieldset
          disabled={form.pending}
          className="flex flex-col gap-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        >
          <SettingsErrorSummary
            error={form.error}
            fieldErrors={form.fieldErrors}
            summaryRef={form.errorSummaryRef}
          />
          <EventDetailsFields
            title={form.title}
            description={form.description}
            fieldErrors={form.fieldErrors}
            onTitleChange={form.setTitle}
            onDescriptionChange={form.setDescription}
          />
          <AppearanceFields
            accentColor={form.accentColor}
            contrast={form.contrast}
            logoAlt={form.logoAlt}
            title={form.title}
            logoVisible={form.logoVisible}
            logoRevision={form.logoRevision}
            savedLogo={form.savedLogo}
            pending={form.pending}
            fieldErrors={form.fieldErrors}
            onAccentColorChange={form.setAccentColor}
            onLogoAltChange={form.setLogoAlt}
            onLogoVisualChange={form.onLogoVisualChange}
            onDirty={form.markDirty}
          />
          <DrawPoolFields
            minRange={form.minRange}
            maxRange={form.maxRange}
            minRangeValue={form.minRangeValue}
            maxRangeValue={form.maxRangeValue}
            excludedNumbers={form.excludedNumbers}
            excludedRevision={form.excludedRevision}
            pending={form.pending}
            fieldErrors={form.fieldErrors}
            onMinRangeChange={form.setMinRangeValue}
            onMaxRangeChange={form.setMaxRangeValue}
            onExcludedNumbersChange={form.setExcludedNumbers}
            onDirty={form.markDirty}
          />
          <SettingsSaveStatus status={form.saveStatus} pending={form.pending} />
        </fieldset>

        <SettingsPreview
          shareUrl={shareUrl}
          shareState={form.shareState}
          title={form.title}
          description={form.description}
          accentColor={form.accentColor}
          logoAlt={form.logoAlt}
          logoUrl={
            form.replacementLogoUrl ??
            (form.logoVisible ? form.currentLogoUrl : undefined)
          }
          minRange={form.minRange}
          maxRange={form.maxRange}
          excludedNumbers={form.excludedNumbers}
        />
      </div>
    </form>
  );
}
