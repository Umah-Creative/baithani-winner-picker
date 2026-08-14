"use client";

import { useEffect, useMemo, useState } from "react";

import type { EventSettingsView } from "@/lib/event-settings.type";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

import { ConfettiLayer } from "./ConfettiLayer";
import { DrawnNumbers } from "./DrawnNumbers";
import { RangeControls } from "./RangeControls";
import { useCandidatePool } from "./use-candidate-pool";
import { usePickerAudio } from "./use-picker-audio";
import { usePickerSpin } from "./use-picker-spin";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import { WinnerDisplay } from "./WinnerDisplay";

const STORAGE_KEY = "baithani-winner-picker:drawn-numbers";

type PickerProps = {
  settings: EventSettingsView;
};

export function Picker(props: PickerProps) {
  const { settings } = props;

  const [min, setMin] = useState(settings.minRange);
  const [max, setMax] = useState(settings.maxRange);
  const reduceMotion = usePrefersReducedMotion();

  const normalizedMin = min < max ? min : max;
  const normalizedMax = max > min ? max : min;

  const { candidates, drawnNumbers, drawnCount, draw, undoLast, reset } =
    useCandidatePool({
      min: normalizedMin,
      max: normalizedMax,
      excluded: settings.excludedNumbers,
      storageKey: STORAGE_KEY,
    });

  const {
    state,
    start,
    stop,
    reset: resetSpin,
  } = usePickerSpin({
    pool: candidates,
    reduceMotion,
  });
  const audio = usePickerAudio();

  const spinning = state.status === "spinning";
  const exhausted = useMemo(() => candidates.length === 0, [candidates.length]);

  const handleToggle = () => {
    if (spinning) {
      audio.stopTicking();
      stop((winner) => {
        draw(winner);
        audio.stopDrumroll();
        audio.playWin();
      });
      audio.startDrumroll();
    } else {
      start();
      audio.startTicking();
    }
  };

  const handleReset = () => {
    resetSpin();
    reset();
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      "Clear all drawn numbers? This cannot be undone."
    );
    if (confirmed) {
      handleReset();
    }
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
      <ConfettiLayer
        active={state.status === "winner"}
        accent={settings.accentColor}
        reduceMotion={reduceMotion}
      />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <header className="flex flex-col items-center text-center">
        {settings.hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/api/media/logo"
            alt={settings.logoAlt}
            className="h-auto max-h-56 w-auto max-w-[420px] object-contain drop-shadow-[0_0_35px_var(--brand)] sm:max-h-64"
          />
        ) : (
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            {settings.title}
          </h1>
        )}
        {settings.hasLogo && settings.title ? (
          <p className="mt-4 text-xl font-semibold text-muted-foreground sm:text-2xl">
            {settings.title}
          </p>
        ) : null}
      </header>

      <section className="flex w-full flex-1 flex-col items-center justify-center gap-6 py-8">
        <RangeControls
          min={min}
          max={max}
          disabled={spinning}
          onMinChange={setMin}
          onMaxChange={setMax}
        />

        <WinnerDisplay state={state} accent={settings.accentColor} />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={handleToggle}
            disabled={exhausted && !spinning}
            variant={spinning ? "secondary" : "default"}
            size="lg"
          >
            {spinning ? "STOP" : "START"}
          </Button>
          <Button
            onClick={audio.toggleMuted}
            variant="ghost"
            size="default"
            aria-pressed={audio.muted}
          >
            {audio.muted ? "Unmute" : "Mute"}
          </Button>
        </div>

        {drawnCount > 0 ? (
          <DrawnNumbers
            drawnNumbers={drawnNumbers}
            onUndoLast={undoLast}
            onClear={handleClear}
          />
        ) : null}
      </section>

      <footer className="pb-4 text-center text-sm text-muted-foreground">
        &copy; 2023 - {new Date().getFullYear()} Powered by{" "}
        <strong className="font-semibold text-foreground">
          Multimedia Baithani
        </strong>
        .
      </footer>
    </main>
  );
}
