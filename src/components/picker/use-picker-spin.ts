"use client";

import { useCallback, useRef, useState } from "react";

import type { PickerState } from "./picker-state.type";

export function usePickerSpin(pool: number[]) {
  const [state, setState] = useState<PickerState>({ status: "idle" });
  const intervalRef = useRef<number | null>(null);

  const clearIntervalSafe = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (pool.length === 0) {
      return;
    }

    clearIntervalSafe();
    setState({ status: "spinning", displayNumber: 0 });

    intervalRef.current = window.setInterval(() => {
      const displayNumber =
        pool[Math.floor(Math.random() * pool.length)];
      setState({ status: "spinning", displayNumber });
    }, 60);
  }, [clearIntervalSafe, pool]);

  const stop = useCallback(
    (onWinner: (winner: number) => void) => {
      clearIntervalSafe();

      if (pool.length === 0) {
        setState({ status: "exhausted" });
        return;
      }

      const winner = pool[Math.floor(Math.random() * pool.length)];
      onWinner(winner);
      setState({ status: "winner", winner });
    },
    [clearIntervalSafe, pool],
  );

  const reset = useCallback(() => {
    clearIntervalSafe();
    setState({ status: "idle" });
  }, [clearIntervalSafe]);

  return { state, start, stop, reset };
}
