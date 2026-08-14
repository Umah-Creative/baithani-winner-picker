"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ImagePlusIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

type LogoState =
  | { kind: "empty" }
  | { kind: "existing" }
  | { kind: "replacement"; file: File; url: string }
  | { kind: "marked-removal" };

type LogoVisualState = {
  visible: boolean;
  previewUrl?: string;
  markedForRemoval: boolean;
};

type LogoUploadFieldProps = {
  hasLogo: boolean;
  existingLogoAlt: string;
  updatedAt: string;
  error?: string;
  pending: boolean;
  onDirty: () => void;
  onVisualChange: (state: LogoVisualState) => void;
};

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;
}

export function LogoUploadField(props: LogoUploadFieldProps) {
  const {
    hasLogo,
    existingLogoAlt,
    updatedAt,
    error,
    pending,
    onDirty,
    onVisualChange,
  } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [state, setState] = useState<LogoState>(
    hasLogo ? { kind: "existing" } : { kind: "empty" }
  );
  const [clientError, setClientError] = useState<string>();
  const [dragActive, setDragActive] = useState(false);
  const existingLogoUrl = hasLogo
    ? `/api/media/logo?v=${encodeURIComponent(updatedAt)}`
    : undefined;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function releasePreview() {
    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
  }

  function transition(nextState: LogoState) {
    if (state.kind === "replacement" && nextState !== state) {
      releasePreview();
    }

    setState(nextState);
    onVisualChange({
      visible:
        nextState.kind === "existing" || nextState.kind === "replacement",
      previewUrl: nextState.kind === "replacement" ? nextState.url : undefined,
      markedForRemoval: nextState.kind === "marked-removal",
    });
    onDirty();
  }

  function resetNativeInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function rejectFile(message: string) {
    resetNativeInput();
    if (state.kind === "replacement") {
      releasePreview();
      const fallbackState: LogoState = hasLogo
        ? { kind: "existing" }
        : { kind: "empty" };
      setState(fallbackState);
      onVisualChange({
        visible: hasLogo,
        previewUrl: undefined,
        markedForRemoval: false,
      });
    }
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

    if (state.kind === "replacement") releasePreview();
    const url =
      typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(file)
        : "";
    previewUrlRef.current = url;
    setClientError(undefined);
    setState({ kind: "replacement", file, url });
    onVisualChange({
      visible: true,
      previewUrl: url || undefined,
      markedForRemoval: false,
    });
    onDirty();
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    selectFile(event.dataTransfer.files[0], true);
  }

  function markForRemoval() {
    resetNativeInput();
    transition(hasLogo ? { kind: "marked-removal" } : { kind: "empty" });
  }

  function undoRemoval() {
    transition(hasLogo ? { kind: "existing" } : { kind: "empty" });
  }

  const message = clientError ?? error;
  const imageUrl = state.kind === "replacement" ? state.url : existingLogoUrl;
  const imageAlt =
    state.kind === "replacement"
      ? `Preview of ${state.file.name}`
      : existingLogoAlt;

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
      <input
        type="hidden"
        name="removeLogo"
        value={state.kind === "marked-removal" ? "on" : ""}
      />

      <div
        data-testid="logo-dropzone"
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragActive(false);
          }
        }}
        onDrop={onDrop}
        className={cn(
          "flex min-h-48 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-input bg-muted/30 p-5 text-center transition-colors",
          dragActive && "border-primary bg-primary/10",
          pending && "pointer-events-none opacity-50"
        )}
      >
        {state.kind === "empty" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <ImagePlusIcon className="size-6 text-primary" aria-hidden="true" />
            <span className="font-medium text-foreground">
              Drop a logo here or browse files
            </span>
            <span className="text-xs">PNG, JPEG, WebP, GIF — max 5 MB</span>
          </button>
        ) : state.kind === "marked-removal" ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-3">
            <Trash2Icon
              className="size-6 text-destructive"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">
                Logo marked for removal
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Current logo stays live until settings are saved.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={undoRemoval}>
              <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
              Undo removal
            </Button>
          </div>
        ) : (
          <>
            <div className="flex min-h-28 w-full items-center justify-center rounded-lg bg-background/70 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={imageAlt}
                className="max-h-28 max-w-full object-contain"
              />
            </div>
            {state.kind === "replacement" ? (
              <div className="max-w-full">
                <p className="truncate text-sm font-medium text-foreground">
                  {state.file.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatFileSize(state.file.size)} · replacement selected
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Current event logo
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlusIcon data-icon="inline-start" aria-hidden="true" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={markForRemoval}
              >
                <Trash2Icon data-icon="inline-start" aria-hidden="true" />
                Remove
              </Button>
            </div>
          </>
        )}
      </div>
      {message ? <FieldError id="logo-error">{message}</FieldError> : null}
    </Field>
  );
}
