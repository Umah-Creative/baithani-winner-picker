import { WebAudioEngine } from "./web-audio-engine";

export class PickerSoundEngine extends WebAudioEngine {
  private playWoodblock(context: AudioContext, startAt: number) {
    this.playNoise(context, {
      startAt,
      duration: 0.025,
      gain: 0.035,
      filterType: "bandpass",
      frequency: 1800,
      q: 4,
    });
    this.playTone(context, {
      startAt,
      duration: 0.045,
      gain: 0.045,
      frequency: 620,
      endFrequency: 480,
      type: "triangle",
    });
  }

  private playSnare(context: AudioContext, startAt: number, intensity: number) {
    this.playNoise(context, {
      startAt,
      duration: 0.07,
      gain: 0.045 + intensity * 0.032,
      filterType: "bandpass",
      frequency: 1700 + intensity * 900,
      q: 0.8,
    });
    this.playTone(context, {
      startAt,
      duration: 0.115,
      gain: 0.055 + intensity * 0.035,
      frequency: 90,
      endFrequency: 66,
    });
    this.playTone(context, {
      startAt,
      duration: 0.045,
      gain: 0.03 + intensity * 0.025,
      frequency: 220 + intensity * 120,
      endFrequency: 150,
      type: "triangle",
    });
  }

  startDraw(muted: boolean) {
    const phase = this.preparePhase(muted);
    if (!phase) return;

    const { context, startAt } = phase;
    this.playTone(context, {
      startAt,
      duration: 0.2,
      gain: 0.09,
      frequency: 392,
      type: "triangle",
    });
    this.playTone(context, {
      startAt: startAt + 0.085,
      duration: 0.24,
      gain: 0.1,
      frequency: 523.25,
      type: "triangle",
    });

    this.scheduleTimer(() => {
      const context = this.activeContext;
      if (!context) return;
      this.playWoodblock(context, context.currentTime);
      const interval = window.setInterval(() => {
        const activeContext = this.activeContext;
        if (activeContext) {
          this.playWoodblock(activeContext, activeContext.currentTime);
        }
      }, 110);
      this.trackTimer(interval);
    }, 250);
  }

  startReveal(muted: boolean, durationMs: number) {
    const phase = this.preparePhase(muted);
    if (!phase) return;

    const { context, startAt } = phase;
    const duration = durationMs / 1000;
    let elapsed = 0;
    while (elapsed < duration) {
      const progress = elapsed / duration;
      this.playSnare(context, startAt + elapsed, progress);
      elapsed += 0.13 - progress * 0.075;
    }
    this.playNoise(context, {
      startAt,
      duration,
      gain: 0.032,
      filterType: "lowpass",
      frequency: 520,
      endFrequency: 4200,
      q: 0.7,
    });
    this.playTone(context, {
      startAt,
      duration,
      gain: 0.03,
      frequency: 174.61,
      endFrequency: 261.63,
    });
  }

  playWinner(muted: boolean) {
    const phase = this.preparePhase(muted);
    if (!phase) return;

    const { context, startAt } = phase;
    const impactAt = startAt + 0.08;
    this.playTone(context, {
      startAt: impactAt,
      duration: 0.5,
      gain: 0.2,
      frequency: 86,
      endFrequency: 48,
    });
    this.playNoise(context, {
      startAt: impactAt,
      duration: 0.9,
      gain: 0.055,
      filterType: "highpass",
      frequency: 2800,
      endFrequency: 7200,
      q: 0.6,
    });

    const fanfare = [
      { frequency: 523.25, delay: 0.06 },
      { frequency: 659.25, delay: 0.16 },
      { frequency: 783.99, delay: 0.26 },
      { frequency: 1046.5, delay: 0.4 },
    ];
    fanfare.forEach(({ frequency, delay }, index) => {
      this.playTone(context, {
        startAt: impactAt + delay,
        duration: index === fanfare.length - 1 ? 0.82 : 0.58,
        gain: index === fanfare.length - 1 ? 0.13 : 0.1,
        frequency,
        type: "triangle",
      });
    });
  }
}
