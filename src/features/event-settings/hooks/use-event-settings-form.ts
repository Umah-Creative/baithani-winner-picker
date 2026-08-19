"use client";

import { useActionState, useMemo, useReducer } from "react";

import { activeForegroundContrast } from "../appearance.util";
import { updateEventSettings } from "../event-settings.action";
import {
  createEventSettingsDraft,
  eventSettingsDraftReducer,
} from "../event-settings-draft.reducer";
import type { EventSettingsActionState } from "../event-settings-action.type";
import type { EventSettingsView } from "../event-settings.type";
import type { SettingsShareState } from "../event-settings-share.type";
import { useSettingsSaveFeedback } from "./use-settings-save-feedback";

const initialState: EventSettingsActionState = { status: "idle" };

function formatSavedAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function useEventSettingsForm(settings: EventSettingsView | null) {
  const [draft, dispatch] = useReducer(
    eventSettingsDraftReducer,
    settings,
    createEventSettingsDraft
  );
  const contrast = useMemo(
    () => activeForegroundContrast(draft.accentColor),
    [draft.accentColor]
  );
  const minRange = Number(draft.minRangeValue);
  const maxRange = Number(draft.maxRangeValue);
  const currentLogoUrl = draft.savedLogo.hasLogo
    ? `/api/media/logo?v=${encodeURIComponent(draft.savedLogo.updatedAt)}`
    : undefined;
  const [state, formAction, pending] = useActionState(
    async (previousState: EventSettingsActionState, formData: FormData) => {
      const nextState = await updateEventSettings(previousState, formData);
      if (nextState.status === "success") {
        dispatch({ type: "canonical-saved", saved: nextState.settings });
      }
      return nextState;
    },
    initialState
  );
  const errorSummaryRef = useSettingsSaveFeedback(state);

  const saveStatus = draft.dirty
    ? "Unsaved changes"
    : draft.savedAt
      ? `Settings saved · ${formatSavedAt(draft.savedAt)}`
      : "Setup not saved yet";
  const shareState: SettingsShareState = !draft.savedAt
    ? "setup"
    : draft.dirty
      ? "draft"
      : "saved";

  return {
    state,
    error: state.status === "error" ? state.error : undefined,
    fieldErrors: state.status === "error" ? state.fieldErrors : undefined,
    formAction,
    pending,
    errorSummaryRef,
    accentColor: draft.accentColor,
    setAccentColor: (accentColor: string) =>
      dispatch({ type: "patch", patch: { accentColor } }),
    title: draft.title,
    setTitle: (title: string) => dispatch({ type: "patch", patch: { title } }),
    description: draft.description,
    setDescription: (description: string) =>
      dispatch({ type: "patch", patch: { description } }),
    logoAlt: draft.logoAlt,
    setLogoAlt: (logoAlt: string) =>
      dispatch({ type: "patch", patch: { logoAlt } }),
    minRangeValue: draft.minRangeValue,
    setMinRangeValue: (minRangeValue: string) =>
      dispatch({ type: "patch", patch: { minRangeValue } }),
    maxRangeValue: draft.maxRangeValue,
    setMaxRangeValue: (maxRangeValue: string) =>
      dispatch({ type: "patch", patch: { maxRangeValue } }),
    minRange,
    maxRange,
    excludedNumbers: draft.excludedNumbers,
    setExcludedNumbers: (excludedNumbers: number[]) =>
      dispatch({ type: "patch", patch: { excludedNumbers } }),
    savedLogo: draft.savedLogo,
    logoVisible: draft.logoVisible,
    logoRevision: draft.logoRevision,
    excludedRevision: draft.excludedRevision,
    replacementLogoUrl: draft.replacementLogoUrl,
    currentLogoUrl,
    contrast,
    saveStatus,
    shareState,
    markDirty: () => dispatch({ type: "mark-dirty" }),
    onLogoVisualChange: (visualState: {
      visible: boolean;
      previewUrl?: string;
    }) => {
      dispatch({
        type: "patch",
        patch: {
          logoVisible: visualState.visible,
          replacementLogoUrl: visualState.previewUrl,
        },
      });
    },
  };
}
