"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { EventSettingsActionState } from "../event-settings-action.type";

export function useSettingsSaveFeedback(state: EventSettingsActionState) {
  const errorSummaryRef = useRef<HTMLDivElement>(null);

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

  return errorSummaryRef;
}
