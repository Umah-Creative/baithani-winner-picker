import { CheckIcon } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MAX_LOGO_ALT_LENGTH } from "../event-settings.constant";

import { COLOR_PRESETS } from "../appearance.constant";
import { DEFAULT_ACCENT_COLOR } from "../event-settings.constant";
import type { EventSettingsFieldError } from "../event-settings.type";
import type { LogoVisualState } from "../hooks/use-logo-upload";
import { FieldMessage } from "./field-message";
import { LogoUploadField } from "./logo-upload-field";

type AppearanceFieldsProps = {
  accentColor: string;
  contrast?: number;
  logoAlt: string;
  title: string;
  logoVisible: boolean;
  logoRevision: number;
  savedLogo: { hasLogo: boolean; updatedAt: string };
  pending: boolean;
  fieldErrors?: EventSettingsFieldError;
  onAccentColorChange: (value: string) => void;
  onLogoAltChange: (value: string) => void;
  onLogoVisualChange: (state: LogoVisualState) => void;
  onDirty: () => void;
};

export function AppearanceFields(props: AppearanceFieldsProps) {
  const {
    accentColor,
    contrast,
    logoAlt,
    title,
    logoVisible,
    logoRevision,
    savedLogo,
    pending,
    fieldErrors,
    onAccentColorChange,
    onLogoAltChange,
    onLogoVisualChange,
    onDirty,
  } = props;

  return (
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
              onChange={(event) => onAccentColorChange(event.target.value)}
              aria-invalid={Boolean(fieldErrors?.accentColor)}
              aria-describedby="accent-color-description accent-color-error"
              className="min-h-11 font-mono uppercase"
            />
            <input
              type="color"
              value={
                /^#[0-9a-f]{6}$/i.test(accentColor)
                  ? accentColor
                  : DEFAULT_ACCENT_COLOR
              }
              onChange={(event) => onAccentColorChange(event.target.value)}
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
                  onAccentColorChange(preset.value);
                  onDirty();
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
                  <CheckIcon className="size-4 shrink-0" aria-hidden="true" />
                ) : null}
              </button>
            ))}
          </div>
          {contrast !== undefined && contrast < 4.5 ? (
            <p className="text-sm text-destructive">
              This color has limited contrast with one or more text colors.
              Check button labels carefully.
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
          onDirty={onDirty}
          onVisualChange={onLogoVisualChange}
        />

        {logoVisible ? (
          <Field data-invalid={Boolean(fieldErrors?.logoAlt)}>
            <FieldLabel htmlFor="logoAlt">Logo alt text</FieldLabel>
            <FieldDescription id="logo-alt-description">
              Describe the logo for screen-reader users.
            </FieldDescription>
            <Input
              id="logoAlt"
              type="text"
              name="logoAlt"
              maxLength={MAX_LOGO_ALT_LENGTH}
              value={logoAlt}
              onChange={(event) => onLogoAltChange(event.target.value)}
              aria-invalid={Boolean(fieldErrors?.logoAlt)}
              aria-describedby="logo-alt-description logo-alt-warning logo-alt-error"
              className="min-h-11"
            />
            {logoAlt.trim() === "" ? (
              <p id="logo-alt-warning" className="text-sm text-destructive">
                Blank alt text is only appropriate when this logo is decorative.
              </p>
            ) : null}
            <FieldMessage id="logo-alt-error" error={fieldErrors?.logoAlt} />
          </Field>
        ) : null}
      </FieldGroup>
    </FieldSet>
  );
}
