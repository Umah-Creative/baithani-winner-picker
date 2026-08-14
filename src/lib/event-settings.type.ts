export type EventSettingsView = {
  title: string;
  description: string;
  accentColor: string;
  hasLogo: boolean;
  logoAlt: string;
  minRange: number;
  maxRange: number;
  excludedNumbers: number[];
  updatedAt: string;
};

export type EventSettingsInput = {
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

export type EventSettingsFieldError = {
  title?: string;
  description?: string;
  accentColor?: string;
  minRange?: string;
  maxRange?: string;
  excludedNumbers?: string;
  logo?: string;
};

export type EventSettingsSaveResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: EventSettingsFieldError;
  audit?: {
    before: EventSettingsAuditSnapshot | null;
    after: EventSettingsAuditSnapshot;
    logoChange: "replace" | "remove" | "none";
  };
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
