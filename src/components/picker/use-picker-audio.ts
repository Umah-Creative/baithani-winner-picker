"use client";

import { useEffect, useRef, useState } from "react";

import { AudioEngine } from "./AudioEngine";

export function usePickerAudio() {
  const [muted, setMuted] = useState(true);
  const engineRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new AudioEngine();
    }
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return {
    muted,
    toggleMuted: () => setMuted((current) => !current),
    startTicking: () => engineRef.current?.startTicking(muted),
    stopTicking: () => engineRef.current?.stopTicking(),
    playWin: () => void engineRef.current?.playWin(muted),
  };
}
