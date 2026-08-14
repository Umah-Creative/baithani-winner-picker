"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PickerState } from "./picker-state.type";

type SpinOptions = {
  pool: number[];
  reduceMotion: boolean;
};

type PendingReveal = {
  winner: number;
  onWinner: (winner: number) => void;
};

export function usePickerSpin({ pool, reduceMotion }: SpinOptions) {
  const [state, setState] = useState<PickerState>({ status: "idle" });
  const stateRef = useRef<PickerState>({ status: "idle" });
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const pendingRevealRef = useRef<PendingReveal | null>(null);

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

  const updateState = useCallback((next: PickerState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const start = useCallback((): boolean => {
    if (
      stateRef.current.status === "spinning" ||
      stateRef.current.status === "revealing"
    ) {
      return false;
    }

    if (pool.length === 0) {
      updateState({ status: "exhausted" });
      return false;
    }

    clearTimers();
    pendingRevealRef.current = null;
    updateState({ status: "spinning", displayNumber: pool[0] });

    if (!reduceMotion) {
      intervalRef.current = window.setInterval(() => {
        const displayNumber = pool[Math.floor(Math.random() * pool.length)];
        updateState({ status: "spinning", displayNumber });
      }, 60);
    }

    return true;
  }, [clearTimers, pool, reduceMotion, updateState]);

  const reveal = useCallback(
    (onWinner: (winner: number) => void): boolean => {
      if (stateRef.current.status !== "spinning") {
        return false;
      }

      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (pool.length === 0) {
        updateState({ status: "exhausted" });
        return false;
      }

      const winner = pool[Math.floor(Math.random() * pool.length)];

      if (reduceMotion) {
        onWinner(winner);
        updateState({ status: "winner", winner });
        return true;
      }

      const currentNumber = stateRef.current.displayNumber;
      pendingRevealRef.current = { winner, onWinner };
      updateState({ status: "revealing", displayNumber: currentNumber });

      const revealDelays = [70, 90, 120, 170, 250, 360, 520, 720];
      let step = 0;

      const tick = () => {
        if (step >= revealDelays.length) {
          pendingRevealRef.current = null;
          onWinner(winner);
          updateState({ status: "winner", winner });
          return;
        }

        const displayNumber = pool[Math.floor(Math.random() * pool.length)];
        updateState({ status: "revealing", displayNumber });

        timeoutRef.current = window.setTimeout(tick, revealDelays[step]);
        step += 1;
      };

      tick();
      return true;
    },
    [pool, reduceMotion, updateState]
  );

  const reset = useCallback(() => {
    clearTimers();
    pendingRevealRef.current = null;
    updateState({ status: "idle" });
  }, [clearTimers, updateState]);

  useEffect(() => {
    if (!reduceMotion) {
      return;
    }

    if (stateRef.current.status === "spinning") {
      clearTimers();
      return;
    }

    if (stateRef.current.status === "revealing" && pendingRevealRef.current) {
      const pendingReveal = pendingRevealRef.current;
      pendingRevealRef.current = null;
      clearTimers();
      pendingReveal.onWinner(pendingReveal.winner);
      updateState({ status: "winner", winner: pendingReveal.winner });
    }
  }, [clearTimers, reduceMotion, updateState]);

  useEffect(
    () => () => {
      clearTimers();
      pendingRevealRef.current = null;
    },
    [clearTimers]
  );

  return { state, start, reveal, reset };
}
