import type { RequestContext } from "@/shared/request-context/request-context.type";

import type {
  EventSettingsFieldError,
  EventSettingsView,
} from "../event-settings.type";

export type EventSettingsPersistenceInput = {
  title: string;
  description: string;
  accentColor: string;
  minRange: number;
  maxRange: number;
  excludedNumbers: number[];
  logoAlt: string;
  logoBytes: Buffer | null;
  logoMime: string | null;
  removeLogo: boolean;
};

export type EventSettingsAuditContext = {
  actor: string;
  request: RequestContext;
};

export type EventSettingsAuditSnapshot = {
  title: string;
  description: string;
  accentColor: string;
  hasLogo: boolean;
  logoMime: string | null;
  logoAlt: string;
  minRange: number;
  maxRange: number;
  excludedNumbers: number[];
};

export type LogoChange = "replace" | "remove" | "none";

export type EventSettingsSaveResult =
  | { ok: true; settings: EventSettingsView }
  | {
      ok: false;
      error?: string;
      fieldErrors?: EventSettingsFieldError;
    };
