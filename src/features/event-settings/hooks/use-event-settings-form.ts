"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { activeForegroundContrast } from "../appearance.util";
import { DEFAULT_ACCENT_COLOR } from "../event-settings.constant";
import { updateEventSettings } from "../event-settings.action";
import type { EventSettingsActionState } from "../event-settings-action.type";
import type { EventSettingsView } from "../event-settings.type";
import { parseExcludedNumbers } from "../event-settings.validation";
import type { SettingsShareState } from "../components/settings-preview";

const initialState: EventSettingsActionState = {};

function formatSavedAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function useEventSettingsForm(settings: EventSettingsView | null) {
  const [accentColor, setAccentColor] = useState(
    settings?.accentColor ?? DEFAULT_ACCENT_COLOR
  );
  const [title, setTitle] = useState(settings?.title ?? "");
  const [description, setDescription] = useState(settings?.description ?? "");
  const [logoAlt, setLogoAlt] = useState(settings?.logoAlt ?? "");
  const [minRangeValue, setMinRangeValue] = useState(
    String(settings?.minRange ?? 1)
  );
  const [maxRangeValue, setMaxRangeValue] = useState(
    String(settings?.maxRange ?? 1000)
  );
  const [excludedNumbers, setExcludedNumbers] = useState(
    settings?.excludedNumbers ?? []
  );
  const [savedLogo, setSavedLogo] = useState({
    hasLogo: Boolean(settings?.hasLogo),
    updatedAt: settings?.updatedAt ?? "",
  });
  const [replacementLogoUrl, setReplacementLogoUrl] = useState<string>();
  const [logoVisible, setLogoVisible] = useState(Boolean(settings?.hasLogo));
  const [logoRevision, setLogoRevision] = useState(0);
  const [excludedRevision, setExcludedRevision] = useState(0);
  const [savedAt, setSavedAt] = useState(settings?.updatedAt);
  const [dirty, setDirty] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const contrast = useMemo(
    () => activeForegroundContrast(accentColor),
    [accentColor]
  );
  const minRange = Number(minRangeValue);
  const maxRange = Number(maxRangeValue);
  const currentLogoUrl = savedLogo.hasLogo
    ? `/api/media/logo?v=${encodeURIComponent(savedLogo.updatedAt)}`
    : undefined;
  const [state, formAction, pending] = useActionState(
    async (previousState: EventSettingsActionState, formData: FormData) => {
      const nextState = await updateEventSettings(previousState, formData);
      if (nextState.success) {
        const submittedLogo = formData.get("logo");
        const hasReplacement =
          submittedLogo instanceof File && submittedLogo.size > 0;
        const removeLogo = formData.get("removeLogo") === "on";
        const nextHasLogo = hasReplacement
          ? true
          : removeLogo
            ? false
            : savedLogo.hasLogo;
        const nextSavedAt = new Date().toISOString();
        const parsedExcludedNumbers = parseExcludedNumbers(
          String(formData.get("excludedNumbers") ?? ""),
          Number(formData.get("minRange")),
          Number(formData.get("maxRange"))
        );

        if (parsedExcludedNumbers.ok) {
          setExcludedNumbers(parsedExcludedNumbers.values);
        }
        setSavedLogo({ hasLogo: nextHasLogo, updatedAt: nextSavedAt });
        setLogoVisible(nextHasLogo);
        setReplacementLogoUrl(undefined);
        setSavedAt(nextSavedAt);
        setLogoRevision((value) => value + 1);
        setExcludedRevision((value) => value + 1);
        setDirty(false);
      }
      return nextState;
    },
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Settings saved.");
    } else if (state.error) {
      toast.error(state.error);
    } else if (state.fieldErrors) {
      errorSummaryRef.current?.focus();
      toast.error("Fix the highlighted settings before saving.");
    }
  }, [state]);

  const saveStatus = dirty
    ? "Unsaved changes"
    : savedAt
      ? `Settings saved · ${formatSavedAt(savedAt)}`
      : "Setup not saved yet";
  const shareState: SettingsShareState = !savedAt
    ? "setup"
    : dirty
      ? "draft"
      : "saved";

  return {
    state,
    fieldErrors: state.fieldErrors,
    formAction,
    pending,
    errorSummaryRef,
    accentColor,
    setAccentColor,
    title,
    setTitle,
    description,
    setDescription,
    logoAlt,
    setLogoAlt,
    minRangeValue,
    setMinRangeValue,
    maxRangeValue,
    setMaxRangeValue,
    minRange,
    maxRange,
    excludedNumbers,
    setExcludedNumbers,
    savedLogo,
    logoVisible,
    logoRevision,
    excludedRevision,
    replacementLogoUrl,
    currentLogoUrl,
    contrast,
    saveStatus,
    shareState,
    markDirty: () => setDirty(true),
    onLogoVisualChange: (visualState: {
      visible: boolean;
      previewUrl?: string;
    }) => {
      setLogoVisible(visualState.visible);
      setReplacementLogoUrl(visualState.previewUrl);
    },
  };
}
