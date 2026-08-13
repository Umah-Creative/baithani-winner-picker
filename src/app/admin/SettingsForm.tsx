"use client";

import { useActionState } from "react";

import { updateEventSettings, type ActionState } from "@/lib/actions";
import type { EventSettingsView } from "@/lib/event-settings.type";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

type SettingsFormProps = {
  settings: EventSettingsView | null;
};

export function SettingsForm(props: SettingsFormProps) {
  const { settings } = props;
  const [state, formAction, pending] = useActionState(
    updateEventSettings,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <label className="block text-sm font-medium text-white/70">
        Title
        <input
          type="text"
          name="title"
          required
          defaultValue={settings?.title ?? ""}
          className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-[var(--brand)]"
        />
        {state.fieldErrors?.title ? (
          <span className="mt-1 block text-xs text-red-300">
            {state.fieldErrors.title}
          </span>
        ) : null}
      </label>

      <label className="block text-sm font-medium text-white/70">
        Description
        <textarea
          name="description"
          defaultValue={settings?.description ?? ""}
          className="mt-2 min-h-24 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-[var(--brand)]"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-white/70">
          Accent color
          <input
            type="color"
            name="accentColor"
            defaultValue={settings?.accentColor ?? "#f0b429"}
            className="mt-2 block h-12 w-full cursor-pointer rounded-lg border border-white/20 bg-white/10"
          />
          {state.fieldErrors?.accentColor ? (
            <span className="mt-1 block text-xs text-red-300">
              {state.fieldErrors.accentColor}
            </span>
          ) : null}
        </label>

        <div className="block text-sm font-medium text-white/70">
          <span>Logo</span>
          {settings?.hasLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/api/media/logo"
              alt={settings.logoAlt}
              className="mt-2 max-h-24 w-auto rounded-lg border border-white/10 object-contain"
            />
          ) : (
            <p className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/40">
              No logo uploaded yet
            </p>
          )}
          <input
            type="file"
            name="logo"
            accept="image/*"
            className="mt-2 block w-full text-sm text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white"
          />
          {settings?.hasLogo ? (
            <label className="mt-2 flex items-center gap-2 text-sm font-normal text-white/70">
              <input type="checkbox" name="removeLogo" />
              Remove current logo
            </label>
          ) : null}
          {state.fieldErrors?.logo ? (
            <span className="mt-1 block text-xs text-red-300">
              {state.fieldErrors.logo}
            </span>
          ) : null}
        </div>
      </div>

      <label className="block text-sm font-medium text-white/70">
        Logo alt text
        <input
          type="text"
          name="logoAlt"
          defaultValue={settings?.logoAlt ?? ""}
          className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-[var(--brand)]"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-white/70">
          Min range
          <input
            type="number"
            name="minRange"
            required
            defaultValue={settings?.minRange ?? 1}
            className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-[var(--brand)]"
          />
          {state.fieldErrors?.minRange ? (
            <span className="mt-1 block text-xs text-red-300">
              {state.fieldErrors.minRange}
            </span>
          ) : null}
        </label>

        <label className="block text-sm font-medium text-white/70">
          Max range
          <input
            type="number"
            name="maxRange"
            required
            defaultValue={settings?.maxRange ?? 1000}
            className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-[var(--brand)]"
          />
          {state.fieldErrors?.maxRange ? (
            <span className="mt-1 block text-xs text-red-300">
              {state.fieldErrors.maxRange}
            </span>
          ) : null}
        </label>
      </div>

      <label className="block text-sm font-medium text-white/70">
        Excluded numbers (comma-separated)
        <input
          type="text"
          name="excludedNumbers"
          defaultValue={settings?.excludedNumbers.join(", ") ?? ""}
          placeholder="13, 42, 99"
          className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-[var(--brand)]"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-300">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-300">Settings saved.</p>
      ) : null}

      <Button type="submit" disabled={pending} variant="primary" className="w-full">
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
