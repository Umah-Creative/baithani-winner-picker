"use client";

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
import {
  sanitizeNumberListInput,
  useExcludedNumbersEditor,
} from "../hooks/use-excluded-numbers-editor";
import { MAX_EVENT_RANGE, MIN_EVENT_RANGE } from "../event-settings.constant";

type ExcludedNumbersEditorProps = {
  minRange: number;
  maxRange: number;
  serverError?: string;
  pending: boolean;
  onDirty: () => void;
  numbers: number[];
  onNumbersChange: (numbers: number[]) => void;
};

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
  const editor = useExcludedNumbersEditor({
    minRange,
    maxRange,
    serverError,
    numbers,
    onNumbersChange,
    onDirty,
  });

  return (
    <Field data-invalid={Boolean(editor.message)}>
      <FieldLabel htmlFor="excludedNumber">Excluded numbers</FieldLabel>
      <FieldDescription id="excluded-numbers-description">
        Add ticket numbers that must never be selected.
      </FieldDescription>
      <input
        type="hidden"
        name="excludedNumbers"
        value={editor.submissionValue}
      />
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          id="excludedNumber"
          type="number"
          inputMode="numeric"
          min={editor.rangeIsValid ? minRange : MIN_EVENT_RANGE}
          max={editor.rangeIsValid ? maxRange : MAX_EVENT_RANGE}
          step={1}
          value={editor.draft}
          disabled={pending}
          placeholder="e.g. 42"
          onChange={(event) => {
            editor.setDraft(event.target.value.replace(/\D/g, ""));
            editor.clearError();
          }}
          onKeyDown={(event) => {
            if (["e", "E", "+", "-", "."].includes(event.key)) {
              event.preventDefault();
              return;
            }
            if (event.key === "Enter") {
              event.preventDefault();
              editor.addDraft();
            }
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData("text");
            if (/[\n,]/.test(pasted)) {
              event.preventDefault();
              editor.addPasted(pasted);
            }
          }}
          aria-describedby="excluded-numbers-description excluded-numbers-error"
          aria-invalid={Boolean(editor.message)}
          className="min-h-11"
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending || editor.draft.trim() === ""}
          onClick={editor.addDraft}
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
            value={editor.bulkDraft}
            disabled={pending}
            onChange={(event) => {
              editor.setBulkDraft(sanitizeNumberListInput(event.target.value));
              editor.clearError();
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
            disabled={pending || editor.bulkDraft.trim() === ""}
            onClick={editor.addBulkDraft}
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
                  editor.removeNumber(number);
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
        {editor.eligibleCount} eligible numbers
      </p>
      {editor.message ? (
        <FieldError id="excluded-numbers-error">{editor.message}</FieldError>
      ) : null}
    </Field>
  );
}
