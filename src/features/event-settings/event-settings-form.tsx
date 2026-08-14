"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBrandPalette } from "@/shared/brand/brand-color";

import { ExcludedNumbersEditor } from "./components/excluded-numbers-editor";
import { LogoUploadField } from "./components/logo-upload-field";
import {
  SettingsPreview,
  type SettingsShareState,
} from "./components/settings-preview";
import { updateEventSettings } from "./event-settings.action";
import type { EventSettingsActionState } from "./event-settings-action.type";
import type { EventSettingsView } from "./event-settings.type";
import { parseExcludedNumbers } from "./event-settings.validation";

const initialState: EventSettingsActionState = {};
const COLOR_PRESETS = [
  { name: "Baithani pink", description: "Signature pink", value: "#d076b4" },
  { name: "Evening plum", description: "Deep, formal plum", value: "#632d50" },
  { name: "Rose glow", description: "Soft, cheerful rose", value: "#f4a6d7" },
  {
    name: "Celebration gold",
    description: "Warm prize-night gold",
    value: "#d6a83b",
  },
  { name: "Stage blue", description: "Calm, clear blue", value: "#4f7cac" },
  {
    name: "Fellowship teal",
    description: "Fresh, balanced teal",
    value: "#2f8f83",
  },
  {
    name: "Joyful coral",
    description: "Energetic warm coral",
    value: "#dc6b5f",
  },
  {
    name: "Choir violet",
    description: "Rich, expressive violet",
    value: "#7c5cc4",
  },
] as const;

type SettingsFormProps = {
  settings: EventSettingsView | null;
  shareUrl?: string;
};

function formatSavedAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function activeForegroundContrast(color: string): number | undefined {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return undefined;

  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map(
      (start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255
    );
    return channels.reduce((total, channel, index) => {
      const linear =
        channel <= 0.03928
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4;
      return total + linear * [0.2126, 0.7152, 0.0722][index];
    }, 0);
  };
  const accentLuminance = luminance(color);
  const foregroundLuminance = luminance(createBrandPalette(color).foreground);

  return (
    (Math.max(accentLuminance, foregroundLuminance) + 0.05) /
    (Math.min(accentLuminance, foregroundLuminance) + 0.05)
  );
}

function FieldMessage(props: { id: string; error?: string }) {
  const { id, error } = props;

  return error ? <FieldError id={id}>{error}</FieldError> : null;
}

export function SettingsForm(props: SettingsFormProps) {
  const { settings, shareUrl } = props;
  const [accentColor, setAccentColor] = useState(
    settings?.accentColor ?? "#d076b4"
  );
  const [title, setTitle] = useState(settings?.title ?? "");
  const [description, setDescription] = useState(settings?.description ?? "");
  const [logoAlt, setLogoAlt] = useState(settings?.logoAlt ?? "");
  const [minRangeValue, setMinRangeValue] = useState(
    String(settings?.minRange ?? 1)
  );
  const [maxRangeValue, setMaxRangeValue] = useState(
    String(settings?.maxRange ?? 1000)
  );
  const [excludedNumbers, setExcludedNumbers] = useState(
    settings?.excludedNumbers ?? []
  );
  const [savedLogo, setSavedLogo] = useState({
    hasLogo: Boolean(settings?.hasLogo),
    updatedAt: settings?.updatedAt ?? "",
  });
  const [replacementLogoUrl, setReplacementLogoUrl] = useState<string>();
  const [logoVisible, setLogoVisible] = useState(Boolean(settings?.hasLogo));
  const [logoRevision, setLogoRevision] = useState(0);
  const [excludedRevision, setExcludedRevision] = useState(0);
  const [savedAt, setSavedAt] = useState(settings?.updatedAt);
  const [dirty, setDirty] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const contrast = useMemo(
    () => activeForegroundContrast(accentColor),
    [accentColor]
  );
  const minRange = Number(minRangeValue);
  const maxRange = Number(maxRangeValue);
  const currentLogoUrl = savedLogo.hasLogo
    ? `/api/media/logo?v=${encodeURIComponent(savedLogo.updatedAt)}`
    : undefined;
  const [state, formAction, pending] = useActionState(
    async (previousState: EventSettingsActionState, formData: FormData) => {
      const nextState = await updateEventSettings(previousState, formData);
      if (nextState.success) {
        const submittedLogo = formData.get("logo");
        const hasReplacement =
          submittedLogo instanceof File && submittedLogo.size > 0;
        const removeLogo = formData.get("removeLogo") === "on";
        const nextHasLogo = hasReplacement
          ? true
          : removeLogo
            ? false
            : savedLogo.hasLogo;
        const nextSavedAt = new Date().toISOString();
        const parsedExcludedNumbers = parseExcludedNumbers(
          String(formData.get("excludedNumbers") ?? ""),
          Number(formData.get("minRange")),
          Number(formData.get("maxRange"))
        );

        if (parsedExcludedNumbers.ok) {
          setExcludedNumbers(parsedExcludedNumbers.values);
        }
        setSavedLogo({ hasLogo: nextHasLogo, updatedAt: nextSavedAt });
        setLogoVisible(nextHasLogo);
        setReplacementLogoUrl(undefined);
        setSavedAt(nextSavedAt);
        setLogoRevision((value) => value + 1);
        setExcludedRevision((value) => value + 1);
        setDirty(false);
      }
      return nextState;
    },
    initialState
  );
  const fieldErrors = state.fieldErrors;

  useEffect(() => {
    if (state.success) {
      toast.success("Settings saved.");
    } else if (state.error) {
      toast.error(state.error);
    } else if (state.fieldErrors) {
      errorSummaryRef.current?.focus();
      toast.error("Fix the highlighted settings before saving.");
    }
  }, [state]);

  const saveStatus = dirty
    ? "Unsaved changes"
    : savedAt
      ? `Settings saved · ${formatSavedAt(savedAt)}`
      : "Setup not saved yet";
  const shareState: SettingsShareState = !savedAt
    ? "setup"
    : dirty
      ? "draft"
      : "saved";

  return (
    <form action={formAction} onChange={() => setDirty(true)} className="mt-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <fieldset
          disabled={pending}
          className="flex flex-col gap-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        >
          {(state.error || fieldErrors) && (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
            >
              <p className="font-semibold">Review the highlighted fields.</p>
              {state.error ? <p className="mt-1">{state.error}</p> : null}
              {fieldErrors ? (
                <ul className="mt-2 list-disc pl-5">
                  {Object.entries(fieldErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}

          <FieldSet>
            <FieldLegend>Event details</FieldLegend>
            <FieldGroup>
              <Field data-invalid={Boolean(fieldErrors?.title)}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <FieldDescription id="title-description">
                  Used above the picker and when the event link is shared.
                </FieldDescription>
                <Input
                  id="title"
                  type="text"
                  name="title"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  aria-invalid={Boolean(fieldErrors?.title)}
                  aria-describedby="title-description title-error"
                  className="min-h-11"
                />
                <FieldMessage id="title-error" error={fieldErrors?.title} />
              </Field>
              <Field data-invalid={Boolean(fieldErrors?.description)}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <FieldDescription id="description-description">
                  Short context for guests, operators, and shared-link previews.
                </FieldDescription>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  aria-invalid={Boolean(fieldErrors?.description)}
                  aria-describedby="description-description description-error"
                  className="min-h-28"
                />
                <FieldMessage
                  id="description-error"
                  error={fieldErrors?.description}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Appearance</FieldLegend>
            <FieldGroup className="gap-6">
              <Field data-invalid={Boolean(fieldErrors?.accentColor)}>
                <FieldLabel htmlFor="accentColor">Accent color</FieldLabel>
                <FieldDescription id="accent-color-description">
                  Colors picker actions and the generated shared-link card.
                </FieldDescription>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    id="accentColor"
                    name="accentColor"
                    value={accentColor}
                    onChange={(event) => setAccentColor(event.target.value)}
                    aria-invalid={Boolean(fieldErrors?.accentColor)}
                    aria-describedby="accent-color-description accent-color-error"
                    className="min-h-11 font-mono uppercase"
                  />
                  <input
                    type="color"
                    value={
                      /^#[0-9a-f]{6}$/i.test(accentColor)
                        ? accentColor
                        : "#d076b4"
                    }
                    onChange={(event) => setAccentColor(event.target.value)}
                    aria-label="Choose accent color"
                    className="h-11 w-full cursor-pointer rounded-lg border border-input bg-background p-1 sm:w-16"
                  />
                </div>
                <div
                  className="grid gap-2 sm:grid-cols-2"
                  aria-label="Accent color presets"
                >
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      aria-label={`Use ${preset.name} (${preset.value}) accent color`}
                      aria-pressed={accentColor.toLowerCase() === preset.value}
                      onClick={() => {
                        setAccentColor(preset.value);
                        setDirty(true);
                      }}
                      className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-background p-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring aria-pressed:border-foreground/30 aria-pressed:bg-muted"
                    >
                      <span
                        className="size-8 shrink-0 rounded-full border-2 border-background shadow-sm ring-1 ring-border"
                        style={{ backgroundColor: preset.value }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                          {preset.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {preset.description}
                        </span>
                      </span>
                      {accentColor.toLowerCase() === preset.value ? (
                        <CheckIcon
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
                {contrast !== undefined && contrast < 4.5 ? (
                  <p className="text-sm text-destructive">
                    This color has limited contrast with one or more text
                    colors. Check button labels carefully.
                  </p>
                ) : null}
                <FieldMessage
                  id="accent-color-error"
                  error={fieldErrors?.accentColor}
                />
              </Field>

              <LogoUploadField
                key={logoRevision}
                hasLogo={savedLogo.hasLogo}
                existingLogoAlt={logoAlt || title || "Event logo"}
                updatedAt={savedLogo.updatedAt}
                error={fieldErrors?.logo}
                pending={pending}
                onDirty={() => setDirty(true)}
                onVisualChange={(visualState) => {
                  setLogoVisible(visualState.visible);
                  setReplacementLogoUrl(visualState.previewUrl);
                }}
              />

              {logoVisible ? (
                <Field>
                  <FieldLabel htmlFor="logoAlt">Logo alt text</FieldLabel>
                  <FieldDescription id="logo-alt-description">
                    Describe the logo for screen-reader users.
                  </FieldDescription>
                  <Input
                    id="logoAlt"
                    type="text"
                    name="logoAlt"
                    value={logoAlt}
                    onChange={(event) => setLogoAlt(event.target.value)}
                    aria-describedby="logo-alt-description logo-alt-warning"
                    className="min-h-11"
                  />
                  {logoAlt.trim() === "" ? (
                    <p
                      id="logo-alt-warning"
                      className="text-sm text-destructive"
                    >
                      Blank alt text is only appropriate when this logo is
                      decorative.
                    </p>
                  ) : null}
                </Field>
              ) : null}
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Draw pool</FieldLegend>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={Boolean(fieldErrors?.minRange)}>
                  <FieldLabel htmlFor="minRange">Min range</FieldLabel>
                  <FieldDescription id="min-range-description">
                    First eligible ticket number.
                  </FieldDescription>
                  <Input
                    id="minRange"
                    type="number"
                    name="minRange"
                    required
                    min={1}
                    max={9999}
                    step={1}
                    value={minRangeValue}
                    onChange={(event) => setMinRangeValue(event.target.value)}
                    aria-invalid={Boolean(fieldErrors?.minRange)}
                    aria-describedby="min-range-description min-range-error"
                    className="min-h-11"
                  />
                  <FieldMessage
                    id="min-range-error"
                    error={fieldErrors?.minRange}
                  />
                </Field>
                <Field data-invalid={Boolean(fieldErrors?.maxRange)}>
                  <FieldLabel htmlFor="maxRange">Max range</FieldLabel>
                  <FieldDescription id="max-range-description">
                    Last eligible ticket number.
                  </FieldDescription>
                  <Input
                    id="maxRange"
                    type="number"
                    name="maxRange"
                    required
                    min={2}
                    max={10000}
                    step={1}
                    value={maxRangeValue}
                    onChange={(event) => setMaxRangeValue(event.target.value)}
                    aria-invalid={Boolean(fieldErrors?.maxRange)}
                    aria-describedby="max-range-description max-range-error"
                    className="min-h-11"
                  />
                  <FieldMessage
                    id="max-range-error"
                    error={fieldErrors?.maxRange}
                  />
                </Field>
              </div>
              <ExcludedNumbersEditor
                key={excludedRevision}
                minRange={minRange}
                maxRange={maxRange}
                serverError={fieldErrors?.excludedNumbers}
                pending={pending}
                onDirty={() => setDirty(true)}
                numbers={excludedNumbers}
                onNumbersChange={setExcludedNumbers}
              />
            </FieldGroup>
          </FieldSet>

          <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {saveStatus}
            </p>
            <Button type="submit" disabled={pending} size="lg">
              {pending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </fieldset>

        <SettingsPreview
          shareUrl={shareUrl}
          shareState={shareState}
          title={title}
          description={description}
          accentColor={accentColor}
          logoAlt={logoAlt}
          logoUrl={
            replacementLogoUrl ?? (logoVisible ? currentLogoUrl : undefined)
          }
          minRange={minRange}
          maxRange={maxRange}
          excludedNumbers={excludedNumbers}
        />
      </div>
    </form>
  );
}
