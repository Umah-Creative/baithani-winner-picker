"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PickerSoundEngine } from "../audio/picker-sound-engine";

export type PickerAudioEngine = Pick<
  PickerSoundEngine,
  "startDraw" | "startReveal" | "playWinner" | "stopAll" | "dispose"
>;

export type PickerAudioEngineFactory = () => PickerAudioEngine;

const createPickerAudioEngine: PickerAudioEngineFactory = () =>
  new PickerSoundEngine();

export function usePickerAudio(
  createEngine: PickerAudioEngineFactory = createPickerAudioEngine
) {
  const [muted, setMuted] = useState(false);
  const engineRef = useRef<PickerAudioEngine | null>(null);

  useEffect(() => {
    const engine = createEngine();
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [createEngine]);

  const toggleMuted = useCallback(() => {
    setMuted((currentMuted) => {
      const nextMuted = !currentMuted;

      if (nextMuted) {
        engineRef.current?.stopAll();
      }

      return nextMuted;
    });
  }, []);

  const startDraw = useCallback(() => {
    engineRef.current?.startDraw(muted);
  }, [muted]);

  const startReveal = useCallback(
    (durationMs: number) => {
      engineRef.current?.startReveal(muted, durationMs);
    },
    [muted]
  );

  const playWinner = useCallback(() => {
    engineRef.current?.playWinner(muted);
  }, [muted]);

  const stopAll = useCallback(() => {
    engineRef.current?.stopAll();
  }, []);

  return useMemo(
    () => ({
      muted,
      toggleMuted,
      startDraw,
      startReveal,
      playWinner,
      stopAll,
    }),
    [muted, playWinner, startDraw, startReveal, stopAll, toggleMuted]
  );
}
