"use client";

import { useCallback, useState } from "react";
import { useReducedMotion } from "motion/react";

import type { EventSettingsView } from "@/features/event-settings/event-settings.type";

import { PICKER_STORAGE_KEY, REVEAL_DURATION_MS } from "../picker.constant";
import { useCandidatePool } from "./use-candidate-pool";
import {
  usePickerAudio,
  type PickerAudioEngineFactory,
} from "./use-picker-audio";
import { usePickerKeyboardShortcut } from "./use-picker-keyboard-shortcut";
import { usePickerRange } from "./use-picker-range";
import { usePickerSpin } from "./use-picker-spin";
import { usePickerStageTiming } from "./use-picker-stage-timing";

type PickerControllerOptions = {
  audioEngineFactory?: PickerAudioEngineFactory;
};

export function usePickerController(
  settings: EventSettingsView,
  options: PickerControllerOptions = {}
) {
  const { minValue, maxValue, setMinValue, setMaxValue, rangeError, min, max } =
    usePickerRange(settings.minRange, settings.maxRange);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const reduceMotion = Boolean(useReducedMotion());
  const {
    nextDrawReady,
    clearNextDrawTimer,
    prepareNextDraw,
    markNextDrawReady,
  } = usePickerStageTiming(reduceMotion);
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

  const handleStart = useCallback(() => {
    if (rangeError || exhausted) return;

    clearNextDrawTimer();
    markNextDrawReady();
    if (start()) audio.startDraw();
  }, [
    audio,
    clearNextDrawTimer,
    exhausted,
    markNextDrawReady,
    rangeError,
    start,
  ]);

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
    markNextDrawReady();
  }, [audio, clearNextDrawTimer, markNextDrawReady, resetStage]);

  const handleMinChange = useCallback(
    (value: string) => {
      resetForRangeChange();
      setMinValue(value);
    },
    [resetForRangeChange, setMinValue]
  );
  const handleMaxChange = useCallback(
    (value: string) => {
      resetForRangeChange();
      setMaxValue(value);
    },
    [resetForRangeChange, setMaxValue]
  );
  const handleUndoLast = useCallback(() => {
    clearNextDrawTimer();
    audio.stopAll();
    undoLast();
    resetStage();
    markNextDrawReady();
  }, [audio, clearNextDrawTimer, markNextDrawReady, resetStage, undoLast]);
  const handleNewSession = useCallback(() => {
    clearNextDrawTimer();
    audio.stopAll();
    reset();
    resetStage();
    markNextDrawReady();
    setNewSessionOpen(false);
  }, [audio, clearNextDrawTimer, markNextDrawReady, reset, resetStage]);

  usePickerKeyboardShortcut(handlePrimaryAction);

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
