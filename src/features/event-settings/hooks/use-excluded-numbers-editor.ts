"use client";

import { useMemo, useState } from "react";

import { MAX_EVENT_RANGE, MIN_EVENT_RANGE } from "../event-settings.constant";
import { parseExcludedNumbers } from "../event-settings.validation";

type ExcludedNumbersOptions = {
  minRange: number;
  maxRange: number;
  serverError?: string;
  numbers: number[];
  onNumbersChange: (numbers: number[]) => void;
  onDirty: () => void;
};

export function sanitizeNumberListInput(value: string): string {
  return value.replace(/[^\d,\s]/g, "");
}

export function useExcludedNumbersEditor(options: ExcludedNumbersOptions) {
  const { minRange, maxRange, serverError, numbers, onNumbersChange, onDirty } =
    options;
  const [draft, setDraft] = useState("");
  const [bulkDraft, setBulkDraft] = useState("");
  const [error, setError] = useState<string>();
  const rangeIsValid =
    Number.isSafeInteger(minRange) &&
    Number.isSafeInteger(maxRange) &&
    minRange >= MIN_EVENT_RANGE &&
    maxRange <= MAX_EVENT_RANGE &&
    minRange < maxRange;
  const inRangeNumbers = rangeIsValid
    ? numbers.filter((number) => number >= minRange && number <= maxRange)
    : [];
  const rangeError = rangeIsValid
    ? numbers
        .filter((number) => number < minRange || number > maxRange)
        .map(
          (number) =>
            `Excluded number ${number} must be between ${minRange} and ${maxRange}.`
        )[0]
    : undefined;
  const submissionValue = useMemo(
    () =>
      [numbers.join(","), draft.trim(), bulkDraft.trim().replace(/\r?\n/g, ",")]
        .filter(Boolean)
        .join(","),
    [bulkDraft, draft, numbers]
  );

  function addNumbers(raw: string, clear: () => void) {
    if (raw.trim() === "") return;
    if (!rangeIsValid) {
      setError("Set a valid range before excluding numbers.");
      return;
    }

    const result = parseExcludedNumbers(
      sanitizeNumberListInput(raw),
      minRange,
      maxRange
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }

    onNumbersChange(
      [...new Set([...numbers, ...result.values])].sort((a, b) => a - b)
    );
    clear();
    setError(undefined);
    onDirty();
  }

  function removeNumber(number: number) {
    onNumbersChange(numbers.filter((value) => value !== number));
    setError(undefined);
    onDirty();
  }

  return {
    draft,
    bulkDraft,
    setDraft,
    setBulkDraft,
    clearError: () => setError(undefined),
    rangeIsValid,
    submissionValue,
    message: error ?? rangeError ?? serverError,
    eligibleCount: rangeIsValid
      ? Math.max(0, maxRange - minRange + 1 - inRangeNumbers.length)
      : 0,
    addDraft: () => addNumbers(draft, () => setDraft("")),
    addBulkDraft: () => addNumbers(bulkDraft, () => setBulkDraft("")),
    addPasted: (value: string) =>
      addNumbers(sanitizeNumberListInput(value), () => setDraft("")),
    removeNumber,
  };
}
