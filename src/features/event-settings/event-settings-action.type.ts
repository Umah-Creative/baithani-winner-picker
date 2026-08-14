import type { EventSettingsFieldError } from "./event-settings.type";

export type EventSettingsActionState = {
  error?: string;
  fieldErrors?: EventSettingsFieldError;
  success?: boolean;
};
