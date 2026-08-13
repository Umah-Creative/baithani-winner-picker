"use client";

import type { PickerState } from "./picker-state.type";

type WinnerDisplayProps = {
  state: PickerState;
  accent: string;
};

export function WinnerDisplay(props: WinnerDisplayProps) {
  const { state, accent } = props;

  const displayNumber =
    state.status === "spinning"
      ? state.displayNumber
      : state.status === "winner"
        ? state.winner
        : null;

  const exhausted = state.status === "exhausted";
  const isWinner = state.status === "winner";

  return (
    <div
      className="relative flex min-h-[280px] w-full items-center justify-center"
      aria-live="polite"
    >
      {exhausted ? (
        <div className="text-center">
          <p className="text-2xl font-semibold text-white">All numbers drawn</p>
          <p className="mt-2 text-sm text-white/60">
            Reset drawn numbers to draw again.
          </p>
        </div>
      ) : displayNumber !== null ? (
        <div className="relative flex flex-col items-center">
          {isWinner ? (
            <span className="mb-4 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 backdrop-blur">
              Winner
            </span>
          ) : null}
          <div
            className="relative text-[clamp(6rem,22vw,16rem)] font-black leading-none tabular-nums transition-transform duration-200"
            style={{
              color: isWinner ? accent : "rgba(255,255,255,0.92)",
              textShadow: isWinner
                ? `0 0 30px ${accent}, 0 0 80px ${accent}, 0 0 140px ${accent}`
                : "0 0 24px rgba(255,255,255,0.35)",
              transform: isWinner ? "scale(1.06)" : "scale(1)",
            }}
          >
            {displayNumber}
          </div>
          {isWinner ? (
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-40 blur-3xl"
              style={{ background: accent }}
            />
          ) : null}
        </div>
      ) : (
        <p className="text-xl font-medium text-white/50">
          Press START to draw a winner
        </p>
      )}
    </div>
  );
}
