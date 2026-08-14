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

export type EventSettingsFieldError = {
  title?: string;
  description?: string;
  accentColor?: string;
  minRange?: string;
  maxRange?: string;
  excludedNumbers?: string;
  logo?: string;
};
