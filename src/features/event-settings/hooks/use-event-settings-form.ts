"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { activeForegroundContrast } from "../appearance.util";
import { DEFAULT_ACCENT_COLOR } from "../event-settings.constant";
import { updateEventSettings } from "../event-settings.action";
import type { EventSettingsActionState } from "../event-settings-action.type";
import type { EventSettingsView } from "../event-settings.type";
import type { SettingsShareState } from "../components/settings-preview";

const initialState: EventSettingsActionState = { status: "idle" };

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
      if (nextState.status === "success") {
        const saved = nextState.settings;
        setTitle(saved.title);
        setDescription(saved.description);
        setAccentColor(saved.accentColor);
        setLogoAlt(saved.logoAlt);
        setMinRangeValue(String(saved.minRange));
        setMaxRangeValue(String(saved.maxRange));
        setExcludedNumbers(saved.excludedNumbers);
        setSavedLogo({ hasLogo: saved.hasLogo, updatedAt: saved.updatedAt });
        setLogoVisible(saved.hasLogo);
        setReplacementLogoUrl(undefined);
        setSavedAt(saved.updatedAt);
        setLogoRevision((value) => value + 1);
        setExcludedRevision((value) => value + 1);
        setDirty(false);
      }
      return nextState;
    },
    initialState
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Settings saved.");
    } else if (state.status === "error" && state.error) {
      toast.error(state.error);
    } else if (state.status === "error" && state.fieldErrors) {
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
    error: state.status === "error" ? state.error : undefined,
    fieldErrors: state.status === "error" ? state.fieldErrors : undefined,
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
