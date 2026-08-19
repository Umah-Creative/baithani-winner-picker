import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { EventSettingsFieldError } from "../event-settings.type";
import {
  MAX_EVENT_DESCRIPTION_LENGTH,
  MAX_EVENT_TITLE_LENGTH,
} from "../event-settings.constant";
import { FieldMessage } from "./field-message";

type EventDetailsFieldsProps = {
  title: string;
  description: string;
  fieldErrors?: EventSettingsFieldError;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function EventDetailsFields(props: EventDetailsFieldsProps) {
  const {
    title,
    description,
    fieldErrors,
    onTitleChange,
    onDescriptionChange,
  } = props;

  return (
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
            maxLength={MAX_EVENT_TITLE_LENGTH}
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
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
            maxLength={MAX_EVENT_DESCRIPTION_LENGTH}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
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
  );
}
