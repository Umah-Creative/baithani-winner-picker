"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import type { EventSettingsView } from "@/features/event-settings/event-settings.type";

import {
  NEXT_DRAW_DELAY_MS,
  PICKER_STORAGE_KEY,
  REVEAL_DURATION_MS,
} from "../picker.constant";
import { getRangeError } from "../picker-range";
import { useCandidatePool } from "./use-candidate-pool";
import {
  usePickerAudio,
  type PickerAudioEngineFactory,
} from "./use-picker-audio";
import { usePickerSpin } from "./use-picker-spin";

type PickerControllerOptions = {
  audioEngineFactory?: PickerAudioEngineFactory;
};

export function usePickerController(
  settings: EventSettingsView,
  options: PickerControllerOptions = {}
) {
  const [minValue, setMinValue] = useState(String(settings.minRange));
  const [maxValue, setMaxValue] = useState(String(settings.maxRange));
  const [nextDrawReady, setNextDrawReady] = useState(true);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const nextDrawTimerRef = useRef<number | null>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const rangeError = getRangeError(minValue, maxValue);
  const min = rangeError ? 1 : Number(minValue);
  const max = rangeError ? 0 : Number(maxValue);
  const { candidates, drawnNumbers, drawnCount, draw, undoLast, reset } =
    useCandidatePool({
      min,
      max,
      excluded: settings.excludedNumbers,
      storageKey: PICKER_STORAGE_KEY,
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
  const audio = usePickerAudio(options.audioEngineFactory);
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
    if (rangeError || exhausted) return;

    clearNextDrawTimer();
    setNextDrawReady(true);
    if (start()) audio.startDraw();
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
    if (!active && drawnCount > 0) setNewSessionOpen(true);
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
      if (event.code !== "Space" || event.repeat) return;
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

  const primaryLabel =
    state.status === "spinning"
      ? "Reveal winner"
      : state.status === "revealing"
        ? "Revealing winner…"
        : canStartNewSession
          ? "Start new session"
          : state.status === "winner"
            ? "Draw next winner"
            : exhausted
              ? "All numbers drawn"
              : "Start draw";
  const primaryDisabled =
    Boolean(rangeError) ||
    state.status === "revealing" ||
    (exhausted && !canStartNewSession) ||
    (state.status === "winner" && !nextDrawReady && !canStartNewSession);
  const stageState =
    exhausted && state.status === "idle"
      ? ({ status: "exhausted" } as const)
      : state;

  return {
    minValue,
    maxValue,
    rangeError,
    reduceMotion,
    active,
    canStartNewSession,
    state,
    stageState,
    winner: state.status === "winner" ? state.winner : null,
    drawnNumbers,
    drawnCount,
    newSessionOpen,
    setNewSessionOpen,
    audio,
    primaryLabel,
    primaryDisabled,
    handlePrimaryAction,
    handleRequestNewSession,
    handleMinChange,
    handleMaxChange,
    handleUndoLast,
    handleNewSession,
  };
}
