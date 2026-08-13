export class AudioEngine {
  private context: AudioContext | null = null;
  private tickTimer: number | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") {
      return null;
    }

    if (!this.context) {
      this.context = new AudioContext();
    }

    if (this.context.state === "suspended") {
      void this.context.resume();
    }

    return this.context;
  }

  startTicking(muted: boolean) {
    if (muted) {
      return;
    }

    const context = this.ensureContext();
    if (!context) {
      return;
    }

    this.stopTicking();
    this.tickTimer = window.setInterval(() => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 2200;
      oscillator.type = "square";
      gain.gain.value = 0.015;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.03);
    }, 60);
  }

  stopTicking() {
    if (this.tickTimer !== null) {
      window.clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  playWin(muted: boolean) {
    if (muted) {
      return;
    }

    const context = this.ensureContext();
    if (!context) {
      return;
    }

    const now = context.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.12;
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.55);
    });
  }

  dispose() {
    this.stopTicking();
    void this.context?.close();
    this.context = null;
  }
}
