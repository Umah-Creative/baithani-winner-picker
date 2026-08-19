"use client";

import { ImagePlusIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { ACCEPTED_LOGO_INPUT } from "../event-settings.constant";
import { useLogoUpload, type LogoVisualState } from "../hooks/use-logo-upload";

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

function getSafeLogoPreviewUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;

  if (value === "/api/media/logo" || value.startsWith("/api/media/logo?")) {
    return value;
  }

  if (typeof window === "undefined") return undefined;

  try {
    const parsed = new URL(value, window.location.origin);

    if (parsed.protocol === "blob:") {
      return parsed.origin === window.location.origin
        ? parsed.toString()
        : undefined;
    }

    return parsed.origin === window.location.origin &&
      parsed.pathname === "/api/media/logo"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
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
  const {
    state,
    clientError,
    dragActive,
    fileInputRef,
    imageUrl,
    imageAlt,
    setDragActive,
    onInputChange,
    onDrop,
    markForRemoval,
    undoRemoval,
  } = useLogoUpload({
    hasLogo,
    existingLogoAlt,
    updatedAt,
    onDirty,
    onVisualChange,
  });
  const message = clientError ?? error;
  const safeImageUrl = getSafeLogoPreviewUrl(imageUrl);

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
        accept={ACCEPTED_LOGO_INPUT}
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
              {safeImageUrl ? (
                <>
                  {/* Hook-generated blob URLs and the same-origin logo endpoint are URL-allowlisted above. */}
                  {/* codeql[js/xss-through-dom] */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={safeImageUrl}
                    alt={imageAlt}
                    className="max-h-28 max-w-full object-contain"
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Logo preview unavailable
                </p>
              )}
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
