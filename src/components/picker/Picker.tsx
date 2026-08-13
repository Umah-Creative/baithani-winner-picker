"use client";

import { useEffect, useMemo, useState } from "react";

import type { EventSettingsView } from "@/lib/event-settings.type";
import { Button } from "@/components/ui/button";

import { ConfettiLayer } from "./ConfettiLayer";
import { RangeControls } from "./RangeControls";
import { useCandidatePool } from "./use-candidate-pool";
import { usePickerAudio } from "./use-picker-audio";
import { usePickerSpin } from "./use-picker-spin";
import { WinnerDisplay } from "./WinnerDisplay";

const STORAGE_KEY = "baithani-winner-picker:drawn-numbers";

type PickerProps = {
  settings: EventSettingsView;
};

export function Picker(props: PickerProps) {
  const { settings } = props;

  const [min, setMin] = useState(settings.minRange);
  const [max, setMax] = useState(settings.maxRange);

  const normalizedMin = min < max ? min : max;
  const normalizedMax = max > min ? max : min;

  const { candidates, drawnCount, draw, reset } = useCandidatePool({
    min: normalizedMin,
    max: normalizedMax,
    excluded: settings.excludedNumbers,
    storageKey: STORAGE_KEY,
  });

  const { state, start, stop, reset: resetSpin } = usePickerSpin(candidates);
  const audio = usePickerAudio();

  const exhausted = useMemo(() => candidates.length === 0, [candidates.length]);

  const handleToggle = () => {
    if (state.status === "spinning") {
      stop((winner) => {
        draw(winner);
        audio.playWin();
      });
      audio.stopTicking();
    } else {
      start();
      audio.startTicking();
    }
  };

  const handleReset = () => {
    resetSpin();
    reset();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "BUTTON") {
        return;
      }

      event.preventDefault();
      handleToggle();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main
      className="relative flex min-h-svh flex-col items-center justify-between overflow-hidden px-6 py-10"
      style={
        {
          "--brand": settings.accentColor,
        } as React.CSSProperties
      }
    >
      <ConfettiLayer active={state.status === "winner"} accent={settings.accentColor} />

      <header className="flex flex-col items-center text-center">
        {settings.hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/api/media/logo"
            alt={settings.logoAlt}
            className="h-auto max-h-40 w-auto max-w-[260px] object-contain drop-shadow-[0_0_35px_var(--brand)]"
          />
        ) : (
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {settings.title}
          </h1>
        )}
        {settings.hasLogo && settings.title ? (
          <p className="mt-3 text-sm font-medium text-white/70">{settings.title}</p>
        ) : null}
      </header>

      <section className="flex w-full flex-1 flex-col items-center justify-center gap-6 py-8">
        <RangeControls min={min} max={max} onMinChange={setMin} onMaxChange={setMax} />

        <WinnerDisplay state={state} accent={settings.accentColor} />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={handleToggle}
            disabled={exhausted}
            variant={state.status === "spinning" ? "secondary" : "primary"}
            size="lg"
          >
            {state.status === "spinning" ? "STOP" : "START"}
          </Button>
          {drawnCount > 0 ? (
            <Button onClick={handleReset} variant="ghost" size="default">
              Reset drawn numbers
            </Button>
          ) : null}
          <Button
            onClick={audio.toggleMuted}
            variant="ghost"
            size="default"
            aria-pressed={audio.muted}
          >
            {audio.muted ? "Unmute" : "Mute"}
          </Button>
        </div>
      </section>
    </main>
  );
}
