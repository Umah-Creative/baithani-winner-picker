const MASTER_LEVEL = 1.0;
const MAKEUP_GAIN = 1.6;
const MIN_GAIN = 0.001;
const SILENCE_GAIN = 0.0001;

type PhaseStart = {
  context: AudioContext;
  startAt: number;
};

type ToneOptions = {
  frequency: number;
  startAt: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
  endFrequency?: number;
};

type NoiseOptions = {
  startAt: number;
  duration: number;
  gain: number;
  filterType: BiquadFilterType;
  frequency: number;
  endFrequency?: number;
  q?: number;
};

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private makeupGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private sources = new Set<AudioScheduledSourceNode>();
  private timers = new Set<number>();

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") {
      return null;
    }

    if (!this.context) {
      const context = new AudioContext();
      const masterGain = context.createGain();
      const compressor = context.createDynamicsCompressor();
      const makeupGain = context.createGain();

      masterGain.gain.value = MASTER_LEVEL;
      compressor.threshold.value = -18;
      compressor.knee.value = 16;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.22;
      makeupGain.gain.value = MAKEUP_GAIN;

      masterGain.connect(compressor);
      compressor.connect(makeupGain);
      makeupGain.connect(context.destination);

      this.context = context;
      this.masterGain = masterGain;
      this.compressor = compressor;
      this.makeupGain = makeupGain;
      this.noiseBuffer = this.createNoiseBuffer(context);
    }

    if (this.context.state === "suspended") {
      void this.context.resume();
    }

    return this.context;
  }

  private createNoiseBuffer(context: AudioContext): AudioBuffer {
    const buffer = context.createBuffer(
      1,
      context.sampleRate,
      context.sampleRate
    );
    const samples = buffer.getChannelData(0);

    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  private track(source: AudioScheduledSourceNode) {
    this.sources.add(source);
    source.addEventListener("ended", () => this.sources.delete(source), {
      once: true,
    });
  }

  private preparePhase(muted: boolean): PhaseStart | null {
    this.stopAll();

    if (muted) {
      return null;
    }

    const context = this.ensureContext();
    const masterGain = this.masterGain;
    if (!context || !masterGain) {
      return null;
    }

    const now = context.currentTime;
    const startAt = now + 0.035;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(MASTER_LEVEL, startAt);

    return { context, startAt };
  }

  private playTone(context: AudioContext, options: ToneOptions) {
    const {
      frequency,
      startAt,
      duration,
      gain: peakGain,
      type = "sine",
      endFrequency,
    } = options;
    const masterGain = this.masterGain;
    if (!masterGain) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const attackEnd = startAt + Math.min(0.012, duration * 0.2);
    const stopAt = startAt + duration;
    const fadeFloor = Math.min(MIN_GAIN, peakGain * 0.1);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, stopAt);
    }

    gain.gain.setValueAtTime(fadeFloor, startAt);
    gain.gain.exponentialRampToValueAtTime(peakGain, attackEnd);
    gain.gain.exponentialRampToValueAtTime(fadeFloor, stopAt);

    oscillator.connect(gain);
    gain.connect(masterGain);
    this.track(oscillator);
    oscillator.start(startAt);
    oscillator.stop(stopAt + 0.02);
  }

  private playNoise(context: AudioContext, options: NoiseOptions) {
    const {
      startAt,
      duration,
      gain: peakGain,
      filterType,
      frequency,
      endFrequency,
      q = 1,
    } = options;
    const masterGain = this.masterGain;
    if (!masterGain || !this.noiseBuffer) {
      return;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const attackEnd = startAt + Math.min(0.01, duration * 0.18);
    const stopAt = startAt + duration;
    const fadeFloor = Math.min(MIN_GAIN, peakGain * 0.1);

    source.buffer = this.noiseBuffer;
    source.loop = duration > this.noiseBuffer.duration;
    filter.type = filterType;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(frequency, startAt);
    if (endFrequency) {
      filter.frequency.exponentialRampToValueAtTime(endFrequency, stopAt);
    }

    gain.gain.setValueAtTime(fadeFloor, startAt);
    gain.gain.exponentialRampToValueAtTime(peakGain, attackEnd);
    gain.gain.exponentialRampToValueAtTime(fadeFloor, stopAt);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    this.track(source);
    source.start(startAt);
    source.stop(stopAt + 0.02);
  }

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
      type: "sine",
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

  private scheduleTimer(callback: () => void, delay: number) {
    const timer = window.setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
  }

  startDraw(muted: boolean) {
    const phase = this.preparePhase(muted);
    if (!phase) {
      return;
    }

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
      if (!this.context) {
        return;
      }

      this.playWoodblock(this.context, this.context.currentTime);
      const interval = window.setInterval(() => {
        if (this.context) {
          this.playWoodblock(this.context, this.context.currentTime);
        }
      }, 110);
      this.timers.add(interval);
    }, 250);
  }

  startReveal(muted: boolean, durationMs: number) {
    const phase = this.preparePhase(muted);
    if (!phase) {
      return;
    }

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
      type: "sine",
    });
  }

  playWinner(muted: boolean) {
    const phase = this.preparePhase(muted);
    if (!phase) {
      return;
    }

    const { context, startAt } = phase;
    const impactAt = startAt + 0.08;
    this.playTone(context, {
      startAt: impactAt,
      duration: 0.5,
      gain: 0.2,
      frequency: 86,
      endFrequency: 48,
      type: "sine",
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

  stopAll() {
    for (const timer of this.timers) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    }
    this.timers.clear();

    const context = this.context;
    const masterGain = this.masterGain;
    if (!context || !masterGain) {
      return;
    }

    const now = context.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(
      Math.max(masterGain.gain.value, SILENCE_GAIN),
      now
    );
    masterGain.gain.linearRampToValueAtTime(SILENCE_GAIN, now + 0.015);

    for (const source of this.sources) {
      try {
        source.stop(now + 0.02);
      } catch {
        // Source may have ended between iteration and cancellation.
      }
    }
  }

  dispose() {
    this.stopAll();
    void this.context?.close();
    this.sources.clear();
    this.noiseBuffer = null;
    this.masterGain = null;
    this.compressor = null;
    this.makeupGain = null;
    this.context = null;
  }
}
