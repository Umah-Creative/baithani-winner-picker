"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

type ConfettiLayerProps = {
  winner: number | null;
  accent: string;
  reduceMotion: boolean;
};

const CELEBRATION_CYCLE_MS = 3000;

export function ConfettiLayer(props: ConfettiLayerProps) {
  const { winner, accent, reduceMotion } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (winner === null || reduceMotion || !canvasRef.current) {
      return;
    }

    const burst = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
      disableForReducedMotion: true,
    });

    const colors = [accent, "#fff8fc", "#ffd166", "#f4a6d7"];
    const cycleTimers: number[] = [];
    let cycleTimer: number | null = null;
    let active = true;

    const clearCycleTimers = () => {
      cycleTimers.forEach((timer) => window.clearTimeout(timer));
      cycleTimers.length = 0;
    };

    const stopCelebration = () => {
      clearCycleTimers();
      if (cycleTimer !== null) {
        window.clearInterval(cycleTimer);
        cycleTimer = null;
      }
    };

    const fireCeremony = () => {
      if (!active || document.hidden) {
        return;
      }

      void burst({
        particleCount: 90,
        angle: 58,
        spread: 55,
        startVelocity: 54,
        ticks: 160,
        origin: { x: 0.02, y: 0.72 },
        colors,
      });
      void burst({
        particleCount: 90,
        angle: 122,
        spread: 55,
        startVelocity: 54,
        ticks: 160,
        origin: { x: 0.98, y: 0.72 },
        colors,
      });

      const schedule = (callback: () => void, delay: number) => {
        const timer = window.setTimeout(() => {
          const timerIndex = cycleTimers.indexOf(timer);
          if (timerIndex >= 0) {
            cycleTimers.splice(timerIndex, 1);
          }
          if (active && !document.hidden) {
            callback();
          }
        }, delay);
        cycleTimers.push(timer);
      };

      schedule(() => {
        void burst({
          particleCount: 110,
          spread: 120,
          startVelocity: 34,
          gravity: 0.85,
          ticks: 150,
          origin: { x: 0.5, y: 0.05 },
          colors,
        });
      }, 350);
      schedule(() => {
        void burst({
          particleCount: 48,
          angle: 68,
          spread: 70,
          startVelocity: 42,
          ticks: 120,
          origin: { x: 0.12, y: 0.62 },
          colors,
        });
      }, 1050);
      schedule(() => {
        void burst({
          particleCount: 48,
          angle: 112,
          spread: 70,
          startVelocity: 42,
          ticks: 110,
          origin: { x: 0.88, y: 0.62 },
          colors,
        });
      }, 1750);
    };

    const startCelebration = () => {
      if (!active || document.hidden || cycleTimer !== null) {
        return;
      }

      fireCeremony();
      cycleTimer = window.setInterval(fireCeremony, CELEBRATION_CYCLE_MS);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCelebration();
        burst.reset();
        return;
      }

      startCelebration();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startCelebration();

    return () => {
      active = false;
      stopCelebration();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      burst.reset();
    };
  }, [winner, accent, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
}
