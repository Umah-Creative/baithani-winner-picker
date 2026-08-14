"use client";

import { useMemo, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parseExcludedNumbers } from "../event-settings.validation";

type ExcludedNumbersEditorProps = {
  minRange: number;
  maxRange: number;
  serverError?: string;
  pending: boolean;
  onDirty: () => void;
  numbers: number[];
  onNumbersChange: (numbers: number[]) => void;
};

function sanitizeNumberListInput(value: string): string {
  return value.replace(/[^\d,\s]/g, "");
}

export function ExcludedNumbersEditor(props: ExcludedNumbersEditorProps) {
  const {
    minRange,
    maxRange,
    serverError,
    pending,
    onDirty,
    numbers,
    onNumbersChange,
  } = props;
  const [draft, setDraft] = useState("");
  const [bulkDraft, setBulkDraft] = useState("");
  const [error, setError] = useState<string>();
  const rangeIsValid =
    Number.isSafeInteger(minRange) &&
    Number.isSafeInteger(maxRange) &&
    minRange >= 1 &&
    maxRange <= 10_000 &&
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
  const eligibleCount = rangeIsValid
    ? Math.max(0, maxRange - minRange + 1 - inRangeNumbers.length)
    : 0;
  const message = error ?? rangeError ?? serverError;
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

  return (
    <Field data-invalid={Boolean(message)}>
      <FieldLabel htmlFor="excludedNumber">Excluded numbers</FieldLabel>
      <FieldDescription id="excluded-numbers-description">
        Add ticket numbers that must never be selected.
      </FieldDescription>
      <input type="hidden" name="excludedNumbers" value={submissionValue} />
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          id="excludedNumber"
          type="number"
          inputMode="numeric"
          min={rangeIsValid ? minRange : 1}
          max={rangeIsValid ? maxRange : 10_000}
          step={1}
          value={draft}
          disabled={pending}
          placeholder="e.g. 42"
          onChange={(event) => {
            setDraft(event.target.value.replace(/\D/g, ""));
            setError(undefined);
          }}
          onKeyDown={(event) => {
            if (["e", "E", "+", "-", "."].includes(event.key)) {
              event.preventDefault();
              return;
            }
            if (event.key === "Enter") {
              event.preventDefault();
              addNumbers(draft, () => setDraft(""));
            }
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData("text");
            if (/[\n,]/.test(pasted)) {
              event.preventDefault();
              addNumbers(sanitizeNumberListInput(pasted), () => setDraft(""));
            }
          }}
          aria-describedby="excluded-numbers-description excluded-numbers-error"
          aria-invalid={Boolean(message)}
          className="min-h-11"
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending || draft.trim() === ""}
          onClick={() => addNumbers(draft, () => setDraft(""))}
          className="min-h-11"
        >
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          Add number
        </Button>
      </div>

      <details className="rounded-xl border border-border bg-muted/20 p-3">
        <summary className="min-h-8 cursor-pointer text-sm font-medium text-foreground">
          Paste multiple numbers
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <Textarea
            value={bulkDraft}
            disabled={pending}
            onChange={(event) => {
              setBulkDraft(sanitizeNumberListInput(event.target.value));
              setError(undefined);
            }}
            placeholder={"13, 42, 99\n105"}
            aria-label="Numbers to paste"
            className="min-h-24"
          />
          <p className="text-sm text-muted-foreground">
            Commas, spaces, and blank lines are fine. Duplicate numbers are
            added once.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={pending || bulkDraft.trim() === ""}
            onClick={() => addNumbers(bulkDraft, () => setBulkDraft(""))}
            className="self-start"
          >
            Add pasted numbers
          </Button>
        </div>
      </details>

      {numbers.length ? (
        <div
          className="flex flex-wrap gap-2"
          aria-label="Excluded numbers list"
        >
          {numbers.map((number) => (
            <span
              key={number}
              className="inline-flex min-h-9 items-center gap-1 rounded-full bg-muted px-3 text-sm text-foreground"
            >
              {number}
              <button
                type="button"
                aria-label={`Remove ${number}`}
                disabled={pending}
                onClick={() => {
                  onNumbersChange(numbers.filter((value) => value !== number));
                  setError(undefined);
                  onDirty();
                }}
                className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <XIcon className="size-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <p className="text-sm font-medium text-foreground">
        {eligibleCount} eligible numbers
      </p>
      {message ? (
        <FieldError id="excluded-numbers-error">{message}</FieldError>
      ) : null}
    </Field>
  );
}
