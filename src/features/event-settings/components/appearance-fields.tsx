import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";

import type { EventSettingsFieldError } from "../event-settings.type";
import type { LogoVisualState } from "../hooks/use-logo-upload";
import { AccentColorField } from "./accent-color-field";
import { LogoAltField } from "./logo-alt-field";
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
        <AccentColorField
          accentColor={accentColor}
          contrast={contrast}
          error={fieldErrors?.accentColor}
          onChange={onAccentColorChange}
          onDirty={onDirty}
        />

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
          <LogoAltField
            logoAlt={logoAlt}
            error={fieldErrors?.logoAlt}
            onChange={onLogoAltChange}
          />
        ) : null}
      </FieldGroup>
    </FieldSet>
  );
}
