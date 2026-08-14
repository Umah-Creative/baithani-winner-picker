"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CandidatePoolOptions = {
  min: number;
  max: number;
  excluded: number[];
  storageKey: string;
};

type CandidatePoolResult = {
  candidates: number[];
  drawnNumbers: number[];
  drawnCount: number;
  draw: (winner: number) => void;
  undoLast: () => void;
  reset: () => void;
};

function readDrawnNumbers(storageKey: string): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is number => typeof value === "number");
  } catch {
    return [];
  }
}

export function useCandidatePool({
  min,
  max,
  excluded,
  storageKey,
}: CandidatePoolOptions): CandidatePoolResult {
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

  useEffect(() => {
    // Hydrate persisted draws on the client after mount to avoid a
    // server/client mismatch from localStorage access.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawnNumbers(readDrawnNumbers(storageKey));
  }, [storageKey]);

  const drawn = useMemo(() => new Set(drawnNumbers), [drawnNumbers]);

  const candidates = useMemo(() => {
    const excludedSet = new Set(excluded);
    const pool: number[] = [];

    for (let value = min; value <= max; value += 1) {
      if (!excludedSet.has(value) && !drawn.has(value)) {
        pool.push(value);
      }
    }

    return pool;
  }, [drawn, excluded, max, min]);

  const persist = useCallback(
    (nextDrawn: number[]) => {
      if (typeof window === "undefined") {
        return;
      }
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextDrawn));
      } catch {
        // Storage may be unavailable; the in-memory list still works for the session.
      }
    },
    [storageKey]
  );

  const draw = useCallback(
    (winner: number) => {
      setDrawnNumbers((current) => {
        const next = [...current, winner];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const undoLast = useCallback(() => {
    setDrawnNumbers((current) => {
      const next = current.slice(0, -1);
      persist(next);
      return next;
    });
  }, [persist]);

  const reset = useCallback(() => {
    setDrawnNumbers([]);
    persist([]);
  }, [persist]);

  return {
    candidates,
    drawnNumbers,
    drawnCount: drawnNumbers.length,
    draw,
    undoLast,
    reset,
  };
}
