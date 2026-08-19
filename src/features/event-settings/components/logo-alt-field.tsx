import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { MAX_LOGO_ALT_LENGTH } from "../event-settings.constant";
import { FieldMessage } from "./field-message";

type LogoAltFieldProps = {
  logoAlt: string;
  error?: string;
  onChange: (value: string) => void;
};

export function LogoAltField(props: LogoAltFieldProps) {
  const { logoAlt, error, onChange } = props;

  return (
    <Field data-invalid={Boolean(error)}>
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
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby="logo-alt-description logo-alt-warning logo-alt-error"
        className="min-h-11"
      />
      {logoAlt.trim() === "" ? (
        <p id="logo-alt-warning" className="text-sm text-destructive">
          Blank alt text is only appropriate when this logo is decorative.
        </p>
      ) : null}
      <FieldMessage id="logo-alt-error" error={error} />
    </Field>
  );
}
