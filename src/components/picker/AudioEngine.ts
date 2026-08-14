export class AudioEngine {
  private context: AudioContext | null = null;
  private tickTimer: number | null = null;
  private rollTimer: number | null = null;

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
      oscillator.frequency.value = 880;
      oscillator.type = "triangle";
      gain.gain.value = 0.02;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.04);
    }, 60);
  }

  stopTicking() {
    if (this.tickTimer !== null) {
      window.clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  startDrumroll(muted: boolean) {
    if (muted) {
      return;
    }

    const context = this.ensureContext();
    if (!context) {
      return;
    }

    this.stopDrumroll();
    this.rollTimer = window.setInterval(() => {
      const now = context.currentTime;

      const body = context.createOscillator();
      const bodyGain = context.createGain();
      body.frequency.value = 90;
      body.type = "sine";
      bodyGain.gain.setValueAtTime(0.06, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      body.connect(bodyGain);
      bodyGain.connect(context.destination);
      body.start(now);
      body.stop(now + 0.13);

      const attack = context.createOscillator();
      const attackGain = context.createGain();
      attack.frequency.value = 220 + Math.random() * 120;
      attack.type = "triangle";
      attackGain.gain.value = 0.04;
      attack.connect(attackGain);
      attackGain.connect(context.destination);
      attack.start(now);
      attack.stop(now + 0.06);
    }, 120);
  }

  stopDrumroll() {
    if (this.rollTimer !== null) {
      window.clearInterval(this.rollTimer);
      this.rollTimer = null;
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
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 1046.5];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.1;
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.13, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.65);
    });
  }

  dispose() {
    this.stopTicking();
    this.stopDrumroll();
    void this.context?.close();
    this.context = null;
  }
}
