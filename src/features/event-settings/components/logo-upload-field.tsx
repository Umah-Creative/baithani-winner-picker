"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { ACCEPTED_LOGO_INPUT } from "../event-settings.constant";
import { useLogoUpload, type LogoVisualState } from "../hooks/use-logo-upload";
import { LogoEmptyState } from "./logo-empty-state";
import { LogoPreviewState } from "./logo-preview-state";
import { LogoRemovalState } from "./logo-removal-state";

type LogoUploadFieldProps = {
  hasLogo: boolean;
  existingLogoAlt: string;
  updatedAt: string;
  error?: string;
  pending: boolean;
  onDirty: () => void;
  onVisualChange: (state: LogoVisualState) => void;
};

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
          <LogoEmptyState
            pending={pending}
            onBrowse={() => fileInputRef.current?.click()}
          />
        ) : state.kind === "marked-removal" ? (
          <LogoRemovalState onUndo={undoRemoval} />
        ) : (
          <LogoPreviewState
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            replacementFile={
              state.kind === "replacement" ? state.file : undefined
            }
            onReplace={() => fileInputRef.current?.click()}
            onRemove={markForRemoval}
          />
        )}
      </div>
      {message ? <FieldError id="logo-error">{message}</FieldError> : null}
    </Field>
  );
}
