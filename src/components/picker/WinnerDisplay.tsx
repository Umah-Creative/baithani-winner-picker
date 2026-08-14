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
    <div className="relative flex min-h-[300px] w-full items-center justify-center pb-4">
      {exhausted ? (
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">
            All numbers drawn
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Reset drawn numbers to draw again.
          </p>
        </div>
      ) : displayNumber !== null ? (
        <div className="relative flex flex-col items-center">
          {isWinner ? (
            <span className="mb-4 rounded-full border border-border bg-muted px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground backdrop-blur">
              Winner
            </span>
          ) : null}
          <div
            className="relative text-[clamp(6rem,22vw,15rem)] font-black leading-none tabular-nums transition-transform duration-200"
            style={{
              color: isWinner ? accent : "var(--foreground)",
              textShadow: isWinner
                ? `0 0 24px color-mix(in oklab, ${accent} 70%, transparent), 0 0 60px color-mix(in oklab, ${accent} 45%, transparent)`
                : "0 0 16px color-mix(in oklab, var(--foreground) 25%, transparent)",
              transform: isWinner ? "scale(1.04)" : "scale(1)",
            }}
          >
            {displayNumber}
          </div>
          {isWinner ? (
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-25 blur-3xl"
              style={{ background: accent }}
            />
          ) : null}
        </div>
      ) : (
        <p className="text-xl font-medium text-muted-foreground">
          Press START to draw a winner
        </p>
      )}

      <span role="status" className="sr-only">
        {isWinner ? `Winner: ${state.winner}` : ""}
      </span>
    </div>
  );
}
