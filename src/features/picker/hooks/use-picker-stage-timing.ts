"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { NEXT_DRAW_DELAY_MS } from "../picker.constant";

export function usePickerStageTiming(reduceMotion: boolean) {
  const [nextDrawReady, setNextDrawReady] = useState(true);
  const nextDrawTimerRef = useRef<number | null>(null);

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

  const markNextDrawReady = useCallback(() => {
    setNextDrawReady(true);
  }, []);

  useEffect(() => clearNextDrawTimer, [clearNextDrawTimer]);

  return {
    nextDrawReady,
    clearNextDrawTimer,
    prepareNextDraw,
    markNextDrawReady,
  };
}
