import type {
  EventSettingsFieldError,
  EventSettingsView,
} from "./event-settings.type";

export type EventSettingsActionState =
  | { status: "idle" }
  | {
      status: "error";
      error?: string;
      fieldErrors?: EventSettingsFieldError;
    }
  | { status: "success"; settings: EventSettingsView };
