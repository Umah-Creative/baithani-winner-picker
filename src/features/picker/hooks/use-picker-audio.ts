"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AudioEngine } from "../audio/audio-engine";

export function usePickerAudio() {
  const [muted, setMuted] = useState(false);
  const engineRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    const engine = new AudioEngine();
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

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
