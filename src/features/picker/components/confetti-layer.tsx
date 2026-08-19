"use client";

import { useRef } from "react";

import { useConfettiCelebration } from "../hooks/use-confetti-celebration";

type ConfettiLayerProps = {
  winner: number | null;
  accent: string;
  reduceMotion: boolean;
};

export function ConfettiLayer(props: ConfettiLayerProps) {
  const { winner, accent, reduceMotion } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useConfettiCelebration({ canvasRef, winner, accent, reduceMotion });

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
}
