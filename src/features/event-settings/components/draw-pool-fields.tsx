import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { EventSettingsFieldError } from "../event-settings.type";
import { MAX_EVENT_RANGE, MIN_EVENT_RANGE } from "../event-settings.constant";
import { ExcludedNumbersEditor } from "./excluded-numbers-editor";
import { FieldMessage } from "./field-message";

type DrawPoolFieldsProps = {
  minRange: number;
  maxRange: number;
  minRangeValue: string;
  maxRangeValue: string;
  excludedNumbers: number[];
  excludedRevision: number;
  pending: boolean;
  fieldErrors?: EventSettingsFieldError;
  onMinRangeChange: (value: string) => void;
  onMaxRangeChange: (value: string) => void;
  onExcludedNumbersChange: (numbers: number[]) => void;
  onDirty: () => void;
};

export function DrawPoolFields(props: DrawPoolFieldsProps) {
  const {
    minRange,
    maxRange,
    minRangeValue,
    maxRangeValue,
    excludedNumbers,
    excludedRevision,
    pending,
    fieldErrors,
    onMinRangeChange,
    onMaxRangeChange,
    onExcludedNumbersChange,
    onDirty,
  } = props;

  return (
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
              min={MIN_EVENT_RANGE}
              max={MAX_EVENT_RANGE - 1}
              step={1}
              value={minRangeValue}
              onChange={(event) => onMinRangeChange(event.target.value)}
              aria-invalid={Boolean(fieldErrors?.minRange)}
              aria-describedby="min-range-description min-range-error"
              className="min-h-11"
            />
            <FieldMessage id="min-range-error" error={fieldErrors?.minRange} />
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
              min={MIN_EVENT_RANGE + 1}
              max={MAX_EVENT_RANGE}
              step={1}
              value={maxRangeValue}
              onChange={(event) => onMaxRangeChange(event.target.value)}
              aria-invalid={Boolean(fieldErrors?.maxRange)}
              aria-describedby="max-range-description max-range-error"
              className="min-h-11"
            />
            <FieldMessage id="max-range-error" error={fieldErrors?.maxRange} />
          </Field>
        </div>
        <ExcludedNumbersEditor
          key={excludedRevision}
          minRange={minRange}
          maxRange={maxRange}
          serverError={fieldErrors?.excludedNumbers}
          pending={pending}
          onDirty={onDirty}
          numbers={excludedNumbers}
          onNumbersChange={onExcludedNumbersChange}
        />
      </FieldGroup>
    </FieldSet>
  );
}
