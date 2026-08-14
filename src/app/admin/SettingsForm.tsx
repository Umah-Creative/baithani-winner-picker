"use client";

import { useActionState } from "react";

import { updateEventSettings, type ActionState } from "@/lib/actions";
import type { EventSettingsView } from "@/lib/event-settings.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

type SettingsFormProps = {
  settings: EventSettingsView | null;
};

export function SettingsForm(props: SettingsFormProps) {
  const { settings } = props;
  const [state, formAction, pending] = useActionState(
    updateEventSettings,
    initialState
  );

  return (
    <form
      action={formAction}
      className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <label className="block text-sm font-medium text-muted-foreground">
        Title
        <Input
          type="text"
          name="title"
          required
          defaultValue={settings?.title ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.title)}
          aria-describedby={
            state.fieldErrors?.title ? "title-error" : undefined
          }
          className="mt-2"
        />
        {state.fieldErrors?.title ? (
          <span
            id="title-error"
            role="alert"
            className="mt-1 block text-xs text-destructive"
          >
            {state.fieldErrors.title}
          </span>
        ) : null}
      </label>

      <label className="block text-sm font-medium text-muted-foreground">
        Description
        <textarea
          name="description"
          defaultValue={settings?.description ?? ""}
          className="mt-2 min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-muted-foreground">
          Accent color
          <input
            type="color"
            name="accentColor"
            defaultValue={settings?.accentColor ?? "#d076b4"}
            className="mt-2 block h-12 w-full cursor-pointer rounded-lg border border-input bg-background"
          />
          {state.fieldErrors?.accentColor ? (
            <span role="alert" className="mt-1 block text-xs text-destructive">
              {state.fieldErrors.accentColor}
            </span>
          ) : null}
        </label>

        <div className="block text-sm font-medium text-muted-foreground">
          <span>Logo</span>
          {settings?.hasLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/api/media/logo"
              alt={settings.logoAlt}
              className="mt-2 max-h-24 w-auto rounded-lg border border-border object-contain"
            />
          ) : (
            <p className="mt-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              No logo uploaded yet
            </p>
          )}
          <input
            type="file"
            name="logo"
            accept="image/*"
            className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground"
          />
          {settings?.hasLogo ? (
            <label className="mt-2 flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <input type="checkbox" name="removeLogo" />
              Remove current logo
            </label>
          ) : null}
          {state.fieldErrors?.logo ? (
            <span role="alert" className="mt-1 block text-xs text-destructive">
              {state.fieldErrors.logo}
            </span>
          ) : null}
        </div>
      </div>

      <label className="block text-sm font-medium text-muted-foreground">
        Logo alt text
        <Input
          type="text"
          name="logoAlt"
          defaultValue={settings?.logoAlt ?? ""}
          className="mt-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-muted-foreground">
          Min range
          <Input
            type="number"
            name="minRange"
            required
            defaultValue={settings?.minRange ?? 1}
            aria-invalid={Boolean(state.fieldErrors?.minRange)}
            className="mt-2"
          />
          {state.fieldErrors?.minRange ? (
            <span role="alert" className="mt-1 block text-xs text-destructive">
              {state.fieldErrors.minRange}
            </span>
          ) : null}
        </label>

        <label className="block text-sm font-medium text-muted-foreground">
          Max range
          <Input
            type="number"
            name="maxRange"
            required
            defaultValue={settings?.maxRange ?? 1000}
            aria-invalid={Boolean(state.fieldErrors?.maxRange)}
            className="mt-2"
          />
          {state.fieldErrors?.maxRange ? (
            <span role="alert" className="mt-1 block text-xs text-destructive">
              {state.fieldErrors.maxRange}
            </span>
          ) : null}
        </label>
      </div>

      <label className="block text-sm font-medium text-muted-foreground">
        Excluded numbers (comma-separated)
        <Input
          type="text"
          name="excludedNumbers"
          defaultValue={settings?.excludedNumbers.join(", ") ?? ""}
          placeholder="13, 42, 99"
          className="mt-2"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-foreground">
          Settings saved.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        variant="default"
        className="w-full"
      >
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
