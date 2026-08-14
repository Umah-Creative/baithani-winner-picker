"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ACCEPTED_LOGO_MIME_TYPES,
  MAX_LOGO_BYTES,
} from "../event-settings.constant";

export type LogoState =
  | { kind: "empty" }
  | { kind: "existing" }
  | { kind: "replacement"; file: File; url: string }
  | { kind: "marked-removal" };

export type LogoVisualState = {
  visible: boolean;
  previewUrl?: string;
  markedForRemoval: boolean;
};

type UseLogoUploadOptions = {
  hasLogo: boolean;
  existingLogoAlt: string;
  updatedAt: string;
  onDirty: () => void;
  onVisualChange: (state: LogoVisualState) => void;
};

const acceptedLogoTypes = new Set<string>(ACCEPTED_LOGO_MIME_TYPES);

export function useLogoUpload(options: UseLogoUploadOptions) {
  const { hasLogo, existingLogoAlt, updatedAt, onDirty, onVisualChange } =
    options;
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

  function resetNativeInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function publish(nextState: LogoState) {
    setState(nextState);
    onVisualChange({
      visible:
        nextState.kind === "existing" || nextState.kind === "replacement",
      previewUrl: nextState.kind === "replacement" ? nextState.url : undefined,
      markedForRemoval: nextState.kind === "marked-removal",
    });
    onDirty();
  }

  function transition(nextState: LogoState) {
    if (state.kind === "replacement" && nextState !== state) releasePreview();
    publish(nextState);
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
    if (!acceptedLogoTypes.has(file.type)) {
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
    publish({ kind: "replacement", file, url });
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

  return {
    state,
    clientError,
    dragActive,
    fileInputRef,
    imageUrl: state.kind === "replacement" ? state.url : existingLogoUrl,
    imageAlt:
      state.kind === "replacement"
        ? `Preview of ${state.file.name}`
        : existingLogoAlt,
    setDragActive,
    onInputChange,
    onDrop,
    markForRemoval,
    undoRemoval,
  };
}
