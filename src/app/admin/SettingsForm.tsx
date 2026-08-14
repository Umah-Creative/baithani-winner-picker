"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { updateEventSettings, type ActionState } from "@/lib/actions";
import { createBrandPalette } from "@/lib/brand-color";
import type { EventSettingsView } from "@/lib/event-settings.type";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { SettingsPreview } from "./SettingsPreview";

const initialState: ActionState = {};
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const COLOR_PRESETS = ["#d076b4", "#632d50", "#f4a6d7", "#d6a83b"];

type SettingsFormProps = { settings: EventSettingsView | null };

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;
}

function formatSavedAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function activeForegroundContrast(color: string): number | undefined {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return undefined;

  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map(
      (start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255
    );
    return channels.reduce((total, channel, index) => {
      const linear =
        channel <= 0.03928
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4;
      return total + linear * [0.2126, 0.7152, 0.0722][index];
    }, 0);
  };
  const accentLuminance = luminance(color);
  const foregroundLuminance = luminance(createBrandPalette(color).foreground);
  return (
    (Math.max(accentLuminance, foregroundLuminance) + 0.05) /
    (Math.min(accentLuminance, foregroundLuminance) + 0.05)
  );
}

function FieldMessage({ id, error }: { id: string; error?: string }) {
  return error ? <FieldError id={id}>{error}</FieldError> : null;
}

function LogoDropzone({
  hasLogo,
  existingLogoAlt,
  updatedAt,
  error,
  pending,
  onDirty,
  onPreviewChange,
  onRemoveChange,
}: {
  hasLogo: boolean;
  existingLogoAlt: string;
  updatedAt: string;
  error?: string;
  pending: boolean;
  onDirty: () => void;
  onPreviewChange: (url: string | undefined) => void;
  onRemoveChange: (remove: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(
    null
  );
  const [clientError, setClientError] = useState<string>();
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function clearPreview() {
    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
    setPreview(null);
    onPreviewChange(undefined);
  }

  function rejectFile(message: string) {
    if (fileInputRef.current) fileInputRef.current.value = "";
    clearPreview();
    setClientError(message);
  }

  function selectFile(file: File | undefined, fromDrop = false) {
    if (!file) return;
    if (!ACCEPTED_LOGO_TYPES.has(file.type)) {
      rejectFile("Logo must be PNG, JPEG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      rejectFile("Logo must be smaller than 5 MB.");
      return;
    }
    if (fromDrop && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
    clearPreview();
    const url =
      typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(file)
        : "";
    previewUrlRef.current = url;
    setPreview({ file, url });
    onPreviewChange(url || undefined);
    setClientError(undefined);
    setRemoveLogo(false);
    onRemoveChange(false);
    onDirty();
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0], true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  }

  const message = clientError ?? error;

  return (
    <Field data-invalid={Boolean(message)}>
      <FieldLabel htmlFor="logo">Logo</FieldLabel>
      <FieldDescription id="logo-description">
        PNG, JPEG, WebP, or GIF. Maximum 5 MB.
      </FieldDescription>
      <input
        ref={fileInputRef}
        id="logo"
        name="logo"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        disabled={pending}
        onChange={onInputChange}
        aria-describedby="logo-description logo-error"
      />
      <div
        role="button"
        tabIndex={pending ? -1 : 0}
        aria-label="Upload logo"
        aria-disabled={pending}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={onKeyDown}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground outline-none transition-colors hover:border-primary/60 hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        <ImagePlusIcon className="size-5 text-primary" aria-hidden="true" />
        <span>Drop a logo here, or press Enter to browse</span>
        <span className="text-xs">PNG, JPEG, WebP, GIF — max 5 MB</span>
      </div>
      {preview ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt={`Preview of ${preview.file.name}`}
            className="size-14 rounded-lg border border-border object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {preview.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(preview.file.size)}
            </p>
          </div>
        </div>
      ) : hasLogo ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/media/logo?v=${encodeURIComponent(updatedAt)}`}
            alt={existingLogoAlt}
            className="size-14 rounded-lg border border-border object-contain"
          />
          <p className="text-sm text-muted-foreground">Current event logo</p>
        </div>
      ) : null}
      {preview ? (
        <p className="text-sm text-muted-foreground">
          Replacement selected. Current logo will be kept until you save.
        </p>
      ) : null}
      {hasLogo ? (
        <label className="flex min-h-11 items-center gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="removeLogo"
            checked={removeLogo}
            disabled={pending}
            onChange={(event) => {
              if (event.target.checked) setRemoveDialogOpen(true);
              else {
                setRemoveLogo(false);
                onRemoveChange(false);
                onDirty();
              }
            }}
          />
          Remove current logo
        </label>
      ) : null}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove current logo?</AlertDialogTitle>
            <AlertDialogDescription>
              The logo will be removed when you save these settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep logo</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setRemoveLogo(true);
                onRemoveChange(true);
                setRemoveDialogOpen(false);
                onDirty();
              }}
            >
              Mark for removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <FieldMessage id="logo-error" error={message} />
    </Field>
  );
}

function ExcludedNumbersEditor({
  minRange,
  maxRange,
  serverError,
  pending,
  onDirty,
  numbers,
  onNumbersChange,
}: {
  minRange: number;
  maxRange: number;
  serverError?: string;
  pending: boolean;
  onDirty: () => void;
  numbers: number[];
  onNumbersChange: (numbers: number[]) => void;
}) {
  const [draft, setDraft] = useState("");
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

  function addNumbers(raw: string) {
    const tokens = raw.split(/[\n,]/).map((token) => token.trim());
    if (tokens.every((token) => token === "")) return;
    if (!rangeIsValid) {
      setError("Set a valid range before excluding numbers.");
      return;
    }
    const next = [...numbers];
    for (const token of tokens) {
      if (!token) {
        setError("Excluded numbers cannot contain an empty token.");
        return;
      }
      if (!/^-?\d+$/.test(token)) {
        setError(`Excluded number "${token}" must be a whole number.`);
        return;
      }
      const value = Number(token);
      if (!Number.isSafeInteger(value)) {
        setError(`Excluded number "${token}" must be a whole number.`);
        return;
      }
      if (value < minRange || value > maxRange) {
        setError(
          `Excluded number ${value} must be between ${minRange} and ${maxRange}.`
        );
        return;
      }
      if (next.includes(value)) {
        setError(`Excluded number ${value} is a duplicate.`);
        return;
      }
      next.push(value);
    }
    onNumbersChange(next);
    setDraft("");
    setError(undefined);
    onDirty();
  }

  return (
    <Field data-invalid={Boolean(message)}>
      <FieldLabel htmlFor="excludedNumbers">Excluded numbers</FieldLabel>
      <FieldDescription id="excluded-numbers-description">
        Press Enter or paste comma- or line-separated numbers to remove them
        from the draw.
      </FieldDescription>
      <input type="hidden" name="excludedNumbers" value={numbers.join(",")} />
      <Input
        id="excludedNumbers"
        value={draft}
        disabled={pending}
        placeholder="13, 42, 99"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addNumbers(draft);
          }
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData("text");
          if (/[\n,]/.test(pasted)) {
            event.preventDefault();
            addNumbers(pasted);
          }
        }}
        aria-describedby="excluded-numbers-description excluded-numbers-error"
        aria-invalid={Boolean(message)}
        className="min-h-11"
      />
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
                className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
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
      <FieldMessage id="excluded-numbers-error" error={message} />
    </Field>
  );
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [accentColor, setAccentColor] = useState(
    settings?.accentColor ?? "#d076b4"
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
  const [replacementLogoUrl, setReplacementLogoUrl] = useState<string>();
  const [logoMarkedForRemoval, setLogoMarkedForRemoval] = useState(false);
  const [dirty, setDirty] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const contrast = useMemo(
    () => activeForegroundContrast(accentColor),
    [accentColor]
  );
  const minRange = Number(minRangeValue);
  const maxRange = Number(maxRangeValue);
  const currentLogoUrl = settings?.hasLogo
    ? `/api/media/logo?v=${encodeURIComponent(settings.updatedAt)}`
    : undefined;
  const [state, formAction, pending] = useActionState(
    async (previousState: ActionState, formData: FormData) => {
      const nextState = await updateEventSettings(previousState, formData);
      if (nextState.success) {
        setReplacementLogoUrl(undefined);
        setLogoMarkedForRemoval(false);
        setDirty(false);
      }
      return nextState;
    },
    initialState
  );
  const fieldErrors = state.fieldErrors;

  useEffect(() => {
    if (state.success) {
      toast.success("Settings saved.");
    } else if (state.error) toast.error(state.error);
    else if (state.fieldErrors) {
      errorSummaryRef.current?.focus();
      toast.error("Fix the highlighted settings before saving.");
    }
  }, [state]);

  return (
    <>
      <form
        action={formAction}
        onChange={() => setDirty(true)}
        className="mt-6"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <fieldset
            disabled={pending}
            className="space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            {(state.error || fieldErrors) && (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                role="alert"
                className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
              >
                <p className="font-semibold">Review the highlighted fields.</p>
                {state.error ? <p className="mt-1">{state.error}</p> : null}
                {fieldErrors ? (
                  <ul className="mt-2 list-disc pl-5">
                    {Object.entries(fieldErrors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
            <FieldSet>
              <legend className="text-base font-semibold text-foreground">
                Event details
              </legend>
              <FieldGroup>
                <Field data-invalid={Boolean(fieldErrors?.title)}>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <FieldDescription id="title-description">
                    Displayed above the winner picker.
                  </FieldDescription>
                  <Input
                    id="title"
                    type="text"
                    name="title"
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    aria-invalid={Boolean(fieldErrors?.title)}
                    aria-describedby="title-description title-error"
                    className="min-h-11"
                  />
                  <FieldMessage id="title-error" error={fieldErrors?.title} />
                </Field>
                <Field data-invalid={Boolean(fieldErrors?.description)}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <FieldDescription id="description-description">
                    Short context for guests and event operators.
                  </FieldDescription>
                  <Textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    aria-invalid={Boolean(fieldErrors?.description)}
                    aria-describedby="description-description description-error"
                    className="min-h-28"
                  />
                  <FieldMessage
                    id="description-error"
                    error={fieldErrors?.description}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <legend className="text-base font-semibold text-foreground">
                Appearance
              </legend>
              <FieldGroup className="gap-6">
                <Field data-invalid={Boolean(fieldErrors?.accentColor)}>
                  <FieldLabel htmlFor="accentColor">Accent color</FieldLabel>
                  <FieldDescription id="accent-color-description">
                    Choose a preset or enter an exact six-digit hex value.
                  </FieldDescription>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <Input
                      id="accentColor"
                      name="accentColor"
                      value={accentColor}
                      onChange={(event) => setAccentColor(event.target.value)}
                      aria-invalid={Boolean(fieldErrors?.accentColor)}
                      aria-describedby="accent-color-description accent-color-error"
                      className="min-h-11 font-mono uppercase"
                    />
                    <input
                      type="color"
                      value={
                        /^#[0-9a-f]{6}$/i.test(accentColor)
                          ? accentColor
                          : "#d076b4"
                      }
                      onChange={(event) => setAccentColor(event.target.value)}
                      aria-label="Choose accent color"
                      className="h-11 w-full cursor-pointer rounded-lg border border-input bg-background p-1 sm:w-16"
                    />
                  </div>
                  <div
                    className="flex flex-wrap gap-2"
                    aria-label="Accent color presets"
                  >
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        aria-label={`Use ${preset} accent color`}
                        onClick={() => {
                          setAccentColor(preset);
                          setDirty(true);
                        }}
                        className="size-11 rounded-full border-2 border-background shadow-sm ring-1 ring-border transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-ring"
                        style={{ backgroundColor: preset }}
                      />
                    ))}
                  </div>
                  {contrast !== undefined && contrast < 4.5 ? (
                    <p className="text-sm text-destructive">
                      This color has limited contrast with one or more text
                      colors. Check button labels carefully.
                    </p>
                  ) : null}
                  <FieldMessage
                    id="accent-color-error"
                    error={fieldErrors?.accentColor}
                  />
                </Field>
                <LogoDropzone
                  hasLogo={Boolean(settings?.hasLogo)}
                  existingLogoAlt={settings?.logoAlt ?? "Event logo"}
                  updatedAt={settings?.updatedAt ?? ""}
                  error={fieldErrors?.logo}
                  pending={pending}
                  onDirty={() => setDirty(true)}
                  onPreviewChange={setReplacementLogoUrl}
                  onRemoveChange={setLogoMarkedForRemoval}
                />
                <Field>
                  <FieldLabel htmlFor="logoAlt">Logo alt text</FieldLabel>
                  <FieldDescription id="logo-alt-description">
                    Describe the logo for screen-reader users.
                  </FieldDescription>
                  <Input
                    id="logoAlt"
                    type="text"
                    name="logoAlt"
                    value={logoAlt}
                    onChange={(event) => setLogoAlt(event.target.value)}
                    aria-describedby="logo-alt-description logo-alt-warning"
                    className="min-h-11"
                  />
                  {logoAlt.trim() === "" ? (
                    <p
                      id="logo-alt-warning"
                      className="text-sm text-destructive"
                    >
                      Blank alt text is only appropriate when this logo is
                      decorative.
                    </p>
                  ) : null}
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <legend className="text-base font-semibold text-foreground">
                Draw pool
              </legend>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field data-invalid={Boolean(fieldErrors?.minRange)}>
                    <FieldLabel htmlFor="minRange">Min range</FieldLabel>
                    <FieldDescription id="min-range-description">
                      First eligible ticket number.
                    </FieldDescription>
                    <Input
                      id="minRange"
                      type="number"
                      name="minRange"
                      required
                      min={1}
                      max={9999}
                      step={1}
                      value={minRangeValue}
                      onChange={(event) => setMinRangeValue(event.target.value)}
                      aria-invalid={Boolean(fieldErrors?.minRange)}
                      aria-describedby="min-range-description min-range-error"
                      className="min-h-11"
                    />
                    <FieldMessage
                      id="min-range-error"
                      error={fieldErrors?.minRange}
                    />
                  </Field>
                  <Field data-invalid={Boolean(fieldErrors?.maxRange)}>
                    <FieldLabel htmlFor="maxRange">Max range</FieldLabel>
                    <FieldDescription id="max-range-description">
                      Last eligible ticket number.
                    </FieldDescription>
                    <Input
                      id="maxRange"
                      type="number"
                      name="maxRange"
                      required
                      min={2}
                      max={10000}
                      step={1}
                      value={maxRangeValue}
                      onChange={(event) => setMaxRangeValue(event.target.value)}
                      aria-invalid={Boolean(fieldErrors?.maxRange)}
                      aria-describedby="max-range-description max-range-error"
                      className="min-h-11"
                    />
                    <FieldMessage
                      id="max-range-error"
                      error={fieldErrors?.maxRange}
                    />
                  </Field>
                </div>
                <ExcludedNumbersEditor
                  minRange={minRange}
                  maxRange={maxRange}
                  serverError={fieldErrors?.excludedNumbers}
                  pending={pending}
                  onDirty={() => setDirty(true)}
                  numbers={excludedNumbers}
                  onNumbersChange={setExcludedNumbers}
                />
              </FieldGroup>
            </FieldSet>
            <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground" aria-live="polite">
                {(state.success && !dirty) || !dirty
                  ? "All changes saved"
                  : "Unsaved changes"}
                {settings?.updatedAt
                  ? ` · Saved ${formatSavedAt(settings.updatedAt)}`
                  : null}
              </div>
              <Button
                type="submit"
                disabled={pending}
                variant="default"
                size="lg"
              >
                {pending ? "Saving…" : "Save settings"}
              </Button>
            </div>
          </fieldset>
          <SettingsPreview
            title={title}
            description={description}
            accentColor={accentColor}
            logoAlt={logoAlt}
            logoUrl={
              replacementLogoUrl
                ? replacementLogoUrl
                : logoMarkedForRemoval
                  ? undefined
                  : currentLogoUrl
            }
            minRange={minRange}
            maxRange={maxRange}
            excludedNumbers={excludedNumbers}
          />
        </div>
      </form>
    </>
  );
}
