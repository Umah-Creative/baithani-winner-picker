const MASTER_LEVEL = 1;
const MAKEUP_GAIN = 1.6;
const MIN_GAIN = 0.001;
const SILENCE_GAIN = 0.0001;

export type AudioPhase = {
  context: AudioContext;
  startAt: number;
};

export type ToneOptions = {
  frequency: number;
  startAt: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
  endFrequency?: number;
};

export type NoiseOptions = {
  startAt: number;
  duration: number;
  gain: number;
  filterType: BiquadFilterType;
  frequency: number;
  endFrequency?: number;
  q?: number;
};

export class WebAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private makeupGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private sources = new Set<AudioScheduledSourceNode>();
  private timers = new Set<number>();

  protected get activeContext(): AudioContext | null {
    return this.context;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

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

    if (this.context.state === "suspended") void this.context.resume();
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

  protected preparePhase(muted: boolean): AudioPhase | null {
    this.stopAll();
    if (muted) return null;

    const context = this.ensureContext();
    const masterGain = this.masterGain;
    if (!context || !masterGain) return null;

    const now = context.currentTime;
    const startAt = now + 0.035;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(MASTER_LEVEL, startAt);
    return { context, startAt };
  }

  protected playTone(context: AudioContext, options: ToneOptions) {
    const {
      frequency,
      startAt,
      duration,
      gain: peakGain,
      type = "sine",
      endFrequency,
    } = options;
    const masterGain = this.masterGain;
    if (!masterGain) return;

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

  protected playNoise(context: AudioContext, options: NoiseOptions) {
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
    if (!masterGain || !this.noiseBuffer) return;

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

  protected scheduleTimer(callback: () => void, delay: number) {
    const timer = window.setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
  }

  protected trackTimer(timer: number) {
    this.timers.add(timer);
  }

  stopAll() {
    for (const timer of this.timers) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    }
    this.timers.clear();

    const context = this.context;
    const masterGain = this.masterGain;
    if (!context || !masterGain) return;

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
