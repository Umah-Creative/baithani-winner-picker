"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Play, RefreshCcw, Sparkles } from "lucide-react";
import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";

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
import { AppFooter } from "@/components/layout/AppFooter";
import { Button } from "@/components/ui/button";
import { createBrandPalette } from "@/lib/brand-color";
import type { EventSettingsView } from "@/lib/event-settings.type";

import { ConfettiLayer } from "./ConfettiLayer";
import { DrawnNumbers } from "./DrawnNumbers";
import { PickerToolbar } from "./PickerToolbar";
import { RangeControls } from "./RangeControls";
import { useCandidatePool } from "./use-candidate-pool";
import { usePickerAudio } from "./use-picker-audio";
import { usePickerSpin } from "./use-picker-spin";
import { WinnerDisplay } from "./WinnerDisplay";

const STORAGE_KEY = "baithani-winner-picker:drawn-numbers";
const NEXT_DRAW_DELAY_MS = 1200;
const REVEAL_DURATION_MS = 2300;
const MIN_RANGE = 1;
const MAX_RANGE = 10_000;

type PickerProps = {
  settings: EventSettingsView;
};

function getRangeError(minValue: string, maxValue: string): string | null {
  if (minValue.trim() === "" || maxValue.trim() === "") {
    return "Enter both minimum and maximum numbers.";
  }

  const min = Number(minValue);
  const max = Number(maxValue);

  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    return "Range values must be whole numbers.";
  }

  if (min < MIN_RANGE || max > MAX_RANGE) {
    return `Use numbers from ${MIN_RANGE.toLocaleString()} to ${MAX_RANGE.toLocaleString()}.`;
  }

  if (min >= max) {
    return "Minimum must be lower than maximum.";
  }

  return null;
}

export function Picker(props: PickerProps) {
  const { settings } = props;
  const [minValue, setMinValue] = useState(String(settings.minRange));
  const [maxValue, setMaxValue] = useState(String(settings.maxRange));
  const [nextDrawReady, setNextDrawReady] = useState(true);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const nextDrawTimerRef = useRef<number | null>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const rangeError = getRangeError(minValue, maxValue);
  const brandPalette = useMemo(
    () => createBrandPalette(settings.accentColor),
    [settings.accentColor]
  );

  const min = rangeError ? 1 : Number(minValue);
  const max = rangeError ? 0 : Number(maxValue);
  const { candidates, drawnNumbers, drawnCount, draw, undoLast, reset } =
    useCandidatePool({
      min,
      max,
      excluded: settings.excludedNumbers,
      storageKey: STORAGE_KEY,
    });
  const {
    state,
    start,
    reveal,
    reset: resetStage,
  } = usePickerSpin({
    pool: candidates,
    reduceMotion,
  });
  const audio = usePickerAudio();

  const active = state.status === "spinning" || state.status === "revealing";
  const exhausted = rangeError === null && candidates.length === 0;
  const canStartNewSession = exhausted && drawnCount > 0;

  const clearNextDrawTimer = useCallback(() => {
    if (nextDrawTimerRef.current !== null) {
      window.clearTimeout(nextDrawTimerRef.current);
      nextDrawTimerRef.current = null;
    }
  }, []);

  const prepareNextDraw = useCallback(() => {
    clearNextDrawTimer();
    setNextDrawReady(false);
    nextDrawTimerRef.current = window.setTimeout(
      () => {
        setNextDrawReady(true);
        nextDrawTimerRef.current = null;
      },
      reduceMotion ? 0 : NEXT_DRAW_DELAY_MS
    );
  }, [clearNextDrawTimer, reduceMotion]);

  const handleStart = useCallback(() => {
    if (rangeError || exhausted) {
      return;
    }

    clearNextDrawTimer();
    setNextDrawReady(true);
    if (start()) {
      audio.startDraw();
    }
  }, [audio, clearNextDrawTimer, exhausted, rangeError, start]);

  const handleReveal = useCallback(() => {
    const revealing = reveal((winner) => {
      draw(winner);
      audio.playWinner();
      prepareNextDraw();
    });

    if (revealing && !reduceMotion) {
      audio.startReveal(REVEAL_DURATION_MS);
    }
  }, [audio, draw, prepareNextDraw, reduceMotion, reveal]);

  const handlePrimaryAction = useCallback(() => {
    if (canStartNewSession) {
      setNewSessionOpen(true);
      return;
    }

    if (state.status === "spinning") {
      handleReveal();
      return;
    }

    if (state.status === "idle" || state.status === "winner") {
      handleStart();
    }
  }, [canStartNewSession, handleReveal, handleStart, state.status]);

  const handleRequestNewSession = useCallback(() => {
    if (!active && drawnCount > 0) {
      setNewSessionOpen(true);
    }
  }, [active, drawnCount]);

  const resetForRangeChange = useCallback(() => {
    clearNextDrawTimer();
    audio.stopAll();
    resetStage();
    setNextDrawReady(true);
  }, [audio, clearNextDrawTimer, resetStage]);

  const handleMinChange = useCallback(
    (value: string) => {
      resetForRangeChange();
      setMinValue(value);
    },
    [resetForRangeChange]
  );

  const handleMaxChange = useCallback(
    (value: string) => {
      resetForRangeChange();
      setMaxValue(value);
    },
    [resetForRangeChange]
  );

  const handleUndoLast = useCallback(() => {
    clearNextDrawTimer();
    audio.stopAll();
    undoLast();
    resetStage();
    setNextDrawReady(true);
  }, [audio, clearNextDrawTimer, resetStage, undoLast]);

  const handleNewSession = useCallback(() => {
    clearNextDrawTimer();
    audio.stopAll();
    reset();
    resetStage();
    setNextDrawReady(true);
    setNewSessionOpen(false);
  }, [audio, clearNextDrawTimer, reset, resetStage]);

  useEffect(() => clearNextDrawTimer, [clearNextDrawTimer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "BUTTON" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      handlePrimaryAction();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrimaryAction]);

  const primaryLabel = (() => {
    if (state.status === "spinning") {
      return "Reveal winner";
    }
    if (state.status === "revealing") {
      return "Revealing winner…";
    }
    if (canStartNewSession) {
      return "Start new session";
    }
    if (state.status === "winner") {
      return "Draw next winner";
    }
    if (exhausted) {
      return "All numbers drawn";
    }
    return "Start draw";
  })();
  const primaryDisabled =
    Boolean(rangeError) ||
    state.status === "revealing" ||
    (exhausted && !canStartNewSession) ||
    (state.status === "winner" && !nextDrawReady && !canStartNewSession);
  const stageState =
    exhausted && state.status === "idle"
      ? ({ status: "exhausted" } as const)
      : state;
  const winner = state.status === "winner" ? state.winner : null;
  const brandStyle = {
    "--brand": settings.accentColor,
    "--primary": settings.accentColor,
    "--primary-foreground": brandPalette.foreground,
    "--brand-display-light": brandPalette.displayLight,
    "--brand-display-dark": brandPalette.displayDark,
  } as CSSProperties;

  return (
    <LazyMotion features={domAnimation}>
      <m.main
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="picker-shell relative isolate flex min-h-svh flex-col overflow-x-hidden px-4 py-4 sm:px-7 sm:py-6 lg:px-10"
        style={brandStyle}
      >
        <ConfettiLayer
          winner={winner}
          accent={settings.accentColor}
          reduceMotion={reduceMotion}
        />

        <header className="relative z-50 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {settings.hasLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/media/logo?v=${encodeURIComponent(settings.updatedAt)}`}
                alt={settings.logoAlt}
                className="event-logo max-h-16 w-auto max-w-24 shrink-0 object-contain sm:max-h-24 sm:max-w-44 lg:max-h-28 lg:max-w-52"
              />
            ) : null}
            <div className="min-w-0">
              <h1 className="line-clamp-2 text-base leading-tight font-bold tracking-[-0.025em] text-foreground sm:line-clamp-1 sm:text-3xl lg:text-4xl">
                {settings.title}
              </h1>
              {settings.description ? (
                <p className="mt-1 hidden max-w-xl truncate text-sm text-muted-foreground md:block">
                  {settings.description}
                </p>
              ) : null}
            </div>
          </div>
          <PickerToolbar
            muted={audio.muted}
            onToggleMuted={audio.toggleMuted}
          />
        </header>

        <section className="relative z-10 mx-auto flex w-full max-w-[110rem] flex-1 flex-col items-center justify-center py-3 sm:py-4">
          <RangeControls
            min={minValue}
            max={maxValue}
            disabled={active}
            error={rangeError}
            onMinChange={handleMinChange}
            onMaxChange={handleMaxChange}
          />

          <WinnerDisplay
            state={stageState}
            reduceMotion={reduceMotion}
            canStartNewSession={canStartNewSession}
          />

          <div className="flex w-full flex-col items-center gap-3 px-1">
            <Button
              onClick={handlePrimaryAction}
              disabled={primaryDisabled}
              variant="stage"
              size="stage"
              className="w-full sm:w-auto"
            >
              {canStartNewSession ? (
                <RefreshCcw data-icon="inline-start" className="size-5" />
              ) : state.status === "spinning" ||
                state.status === "revealing" ? (
                <Sparkles data-icon="inline-start" className="size-5" />
              ) : (
                <Play
                  data-icon="inline-start"
                  className="size-5 fill-current"
                />
              )}
              {primaryLabel}
            </Button>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Press <kbd>Space</kbd> to{" "}
              {state.status === "spinning" ? "reveal" : "continue"}
            </p>
          </div>
        </section>

        <div className="relative z-10 mx-auto w-full max-w-4xl">
          <DrawnNumbers
            drawnNumbers={drawnNumbers}
            disabled={active}
            reduceMotion={reduceMotion}
            onUndoLast={handleUndoLast}
            onRequestNewSession={handleRequestNewSession}
          />
        </div>

        <AlertDialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start a new draw session?</AlertDialogTitle>
              <AlertDialogDescription>
                This clears all drawn numbers and returns them to the draw pool.
                Event settings and range stay unchanged. <br /> <br />
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep current session</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleNewSession}
              >
                Start new session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AppFooter />
        {drawnCount > 0 ? (
          <span className="sr-only">{drawnCount} numbers drawn.</span>
        ) : null}
      </m.main>
    </LazyMotion>
  );
}
