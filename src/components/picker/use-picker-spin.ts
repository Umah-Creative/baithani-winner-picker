"use client";

import { useCallback, useRef, useState } from "react";

import type { PickerState } from "./picker-state.type";

type SpinOptions = {
  pool: number[];
  reduceMotion: boolean;
};

export function usePickerSpin({ pool, reduceMotion }: SpinOptions) {
  const [state, setState] = useState<PickerState>({ status: "idle" });
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (pool.length === 0) {
      return;
    }

    clearTimers();
    setState({ status: "spinning", displayNumber: 0 });

    intervalRef.current = window.setInterval(
      () => {
        const displayNumber = pool[Math.floor(Math.random() * pool.length)];
        setState({ status: "spinning", displayNumber });
      },
      reduceMotion ? 500 : 60
    );
  }, [clearTimers, pool, reduceMotion]);

  const stop = useCallback(
    (onWinner: (winner: number) => void) => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (pool.length === 0) {
        setState({ status: "exhausted" });
        return;
      }

      const winner = pool[Math.floor(Math.random() * pool.length)];

      if (reduceMotion) {
        onWinner(winner);
        setState({ status: "winner", winner });
        return;
      }

      // Reveal: decelerate over ~2.3s, then land on the winner.
      const revealDelays = [70, 90, 120, 170, 250, 360, 520, 720];
      let step = 0;

      const tick = () => {
        if (step >= revealDelays.length) {
          onWinner(winner);
          setState({ status: "winner", winner });
          return;
        }

        const displayNumber = pool[Math.floor(Math.random() * pool.length)];
        setState({ status: "spinning", displayNumber });

        timeoutRef.current = window.setTimeout(tick, revealDelays[step]);
        step += 1;
      };

      tick();
    },
    [pool, reduceMotion]
  );

  const reset = useCallback(() => {
    clearTimers();
    setState({ status: "idle" });
  }, [clearTimers]);

  return { state, start, stop, reset };
}
