import { DEFAULT_ACCENT_COLOR } from "./event-settings.constant";
import type { EventSettingsView } from "./event-settings.type";

export type EventSettingsDraft = {
  accentColor: string;
  title: string;
  description: string;
  logoAlt: string;
  minRangeValue: string;
  maxRangeValue: string;
  excludedNumbers: number[];
  savedLogo: { hasLogo: boolean; updatedAt: string };
  replacementLogoUrl?: string;
  logoVisible: boolean;
  logoRevision: number;
  excludedRevision: number;
  savedAt?: string;
  dirty: boolean;
};

type EventSettingsDraftAction =
  | { type: "patch"; patch: Partial<EventSettingsDraft> }
  | { type: "mark-dirty" }
  | { type: "canonical-saved"; saved: EventSettingsView };

export function createEventSettingsDraft(
  settings: EventSettingsView | null
): EventSettingsDraft {
  return {
    accentColor: settings?.accentColor ?? DEFAULT_ACCENT_COLOR,
    title: settings?.title ?? "",
    description: settings?.description ?? "",
    logoAlt: settings?.logoAlt ?? "",
    minRangeValue: String(settings?.minRange ?? 1),
    maxRangeValue: String(settings?.maxRange ?? 1000),
    excludedNumbers: settings?.excludedNumbers ?? [],
    savedLogo: {
      hasLogo: Boolean(settings?.hasLogo),
      updatedAt: settings?.updatedAt ?? "",
    },
    replacementLogoUrl: undefined,
    logoVisible: Boolean(settings?.hasLogo),
    logoRevision: 0,
    excludedRevision: 0,
    savedAt: settings?.updatedAt,
    dirty: false,
  };
}

export function eventSettingsDraftReducer(
  state: EventSettingsDraft,
  action: EventSettingsDraftAction
): EventSettingsDraft {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "mark-dirty":
      return { ...state, dirty: true };
    case "canonical-saved": {
      const canonical = createEventSettingsDraft(action.saved);
      return {
        ...canonical,
        logoRevision: state.logoRevision + 1,
        excludedRevision: state.excludedRevision + 1,
      };
    }
  }
}
