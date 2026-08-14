"use client";

import { AnimatePresence, m } from "motion/react";

import { Badge } from "@/components/ui/badge";

import type { PickerState } from "../picker-state.type";

type WinnerDisplayProps = {
  state: PickerState;
  reduceMotion: boolean;
  canStartNewSession: boolean;
};

export function WinnerDisplay(props: WinnerDisplayProps) {
  const { state, reduceMotion, canStartNewSession } = props;

  const displayNumber =
    state.status === "spinning" || state.status === "revealing"
      ? state.displayNumber
      : state.status === "winner"
        ? state.winner
        : null;

  const exhausted = state.status === "exhausted";
  const isWinner = state.status === "winner";
  const isRevealing = state.status === "revealing";

  return (
    <div className="winner-stage relative flex min-h-[clamp(17rem,42vh,31rem)] w-full items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {exhausted ? (
          <m.div
            key="exhausted"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl">
              All numbers drawn
            </p>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              {canStartNewSession
                ? "Start a new session to return numbers to the draw pool."
                : "Adjust the range to create an eligible number."}
            </p>
          </m.div>
        ) : displayNumber !== null ? (
          <m.div
            key={isWinner ? `winner-${displayNumber}` : "active-draw"}
            initial={
              isWinner && !reduceMotion
                ? { opacity: 0, scale: 0.72, filter: "blur(18px)" }
                : false
            }
            animate={
              isWinner && !reduceMotion
                ? {
                    opacity: 1,
                    scale: [0.72, 1.08, 1],
                    filter: "blur(0px)",
                  }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{
              duration: isWinner ? 0.65 : 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex flex-col items-center"
          >
            {isWinner ? (
              <m.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.18, duration: 0.32 }}
                className="mb-4"
              >
                <Badge variant="winner">Winner</Badge>
              </m.div>
            ) : (
              <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase sm:text-base">
                {isRevealing ? "Revealing winner" : "Drawing"}
              </p>
            )}

            <div
              className="winner-number relative font-mono text-[clamp(6rem,24vw,17rem)] font-black leading-[0.82] tracking-[-0.04em] tabular-nums"
              data-winner={isWinner || undefined}
            >
              {displayNumber}
            </div>

            {isWinner && !reduceMotion ? (
              <m.div
                aria-hidden="true"
                initial={{ opacity: 0.75, scale: 0.45 }}
                animate={{ opacity: 0, scale: 1.65 }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className="winner-shockwave pointer-events-none absolute inset-[18%] -z-10 rounded-full border"
              />
            ) : null}
          </m.div>
        ) : (
          <m.div
            key="idle"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-xl text-center"
          >
            <p className="text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
              Ready? Let’s pick a winner.
            </p>
            <p className="mt-4 text-base text-muted-foreground sm:text-xl">
              Press Start when everyone’s ready.
            </p>
          </m.div>
        )}
      </AnimatePresence>

      <span role="status" aria-live="polite" className="sr-only">
        {isWinner
          ? `Winner: ${state.winner}`
          : isRevealing
            ? "Revealing winner"
            : ""}
      </span>
    </div>
  );
}
