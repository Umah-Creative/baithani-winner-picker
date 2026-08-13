"use client";

import { useCallback, useMemo, useState } from "react";

type CandidatePoolOptions = {
  min: number;
  max: number;
  excluded: number[];
  storageKey: string;
};

type CandidatePoolResult = {
  candidates: number[];
  drawnCount: number;
  draw: (winner: number) => void;
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
  const [drawn, setDrawn] = useState<Set<number>>(
    () => new Set(readDrawnNumbers(storageKey)),
  );

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
    (nextDrawn: Set<number>) => {
      if (typeof window === "undefined") {
        return;
      }
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify(Array.from(nextDrawn)),
        );
      } catch {
        // Storage may be unavailable; the in-memory set still works for the session.
      }
    },
    [storageKey],
  );

  const draw = useCallback(
    (winner: number) => {
      setDrawn((current) => {
        const next = new Set(current);
        next.add(winner);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    setDrawn(new Set());
    persist(new Set());
  }, [persist]);

  return {
    candidates,
    drawnCount: drawn.size,
    draw,
    reset,
  };
}
