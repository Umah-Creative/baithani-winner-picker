"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

type ConfettiLayerProps = {
  active: boolean;
  accent: string;
  reduceMotion: boolean;
};

export function ConfettiLayer(props: ConfettiLayerProps) {
  const { active, accent, reduceMotion } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || reduceMotion || !canvasRef.current) {
      return;
    }

    const burst = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    void burst({
      particleCount: 140,
      spread: 90,
      startVelocity: 45,
      origin: { y: 0.6 },
      colors: [accent, "#ffffff", "#ffd166"],
    });

    return () => {
      burst.reset();
    };
  }, [active, accent, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
