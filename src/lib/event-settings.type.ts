export type EventSettingsView = {
  title: string;
  description: string;
  accentColor: string;
  hasLogo: boolean;
  logoAlt: string;
  minRange: number;
  maxRange: number;
  excludedNumbers: number[];
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
};
