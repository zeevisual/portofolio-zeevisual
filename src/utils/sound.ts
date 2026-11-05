// Futuristic Sci-Fi & iOS Luxury UI Audio Synthesizer for Zeevisual Portfolio
// Multi-layered Web Audio API engine with resonant BiquadFilters, haptic sub-impulse, and harmonic overtones.

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private lastHoverTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zeevisual_sound');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('zeevisual_sound', String(this.enabled));
    }
    if (this.enabled) {
      this.playClick('card');
    }
    return this.enabled;
  }

  /**
   * Subtle futuristic HUD micro-tick on hover (throttled so it's never spammy)
   */
  public playHover(): void {
    const nowMs = performance.now();
    if (nowMs - this.lastHoverTime < 75) return;
    this.lastHoverTime = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2480, now);
      osc.frequency.exponentialRampToValueAtTime(1240, now + 0.022);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2100, now);
      filter.Q.setValueAtTime(2.5, now);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.022);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.024);
    } catch {
      // Ignore audio context restrictions
    }
  }

  /**
   * Plays a futuristic, studio-crafted UI sound:
   * - 'primary': Haptic sub-thump + resonant glassy harmonic chime (Nav links, primary buttons)
   * - 'tab': Crisp holographic mode-switch chirp (Showcase tabs, category filters, slide controls)
   * - 'card': Dual-stage cyber shutter + rising harmonic portal chime (Opening project/certificate)
   */
  public playClick(type: 'primary' | 'tab' | 'card' = 'primary'): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'tab') {
        // Futuristic Holographic Switch (Two-tone high-tech chirp with resonant filter)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1174.66, now); // D6
        osc1.frequency.exponentialRampToValueAtTime(1760.0, now + 0.048); // A6

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2349.32, now); // D7 sparkle
        osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.035);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(4200, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        filter.Q.setValueAtTime(3.0, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.13, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.055);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.058);
        osc2.stop(now + 0.058);
        return;
      }

      if (type === 'card') {
        // Stage 1: Cyber Shutter Transient + Stage 2: Warm Rising Sci-Fi Fifth Chord
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(190, now);
        sub.frequency.exponentialRampToValueAtTime(45, now + 0.065);
        subGain.gain.setValueAtTime(0.18, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.07);

        // Stage 2: Crystalline Harmonic Chime
        const chime1 = ctx.createOscillator();
        const chime2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const chimeGain = ctx.createGain();

        chime1.type = 'sine';
        chime1.frequency.setValueAtTime(659.25, now + 0.018); // E5
        chime1.frequency.exponentialRampToValueAtTime(987.77, now + 0.11); // B5

        chime2.type = 'triangle';
        chime2.frequency.setValueAtTime(1318.51, now + 0.018); // E6
        chime2.frequency.exponentialRampToValueAtTime(1975.53, now + 0.11); // B6

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(4800, now + 0.018);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

        chimeGain.gain.setValueAtTime(0.001, now);
        chimeGain.gain.setValueAtTime(0.11, now + 0.02);
        chimeGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.13);

        chime1.connect(filter);
        chime2.connect(filter);
        filter.connect(chimeGain);
        chimeGain.connect(ctx.destination);

        chime1.start(now + 0.018);
        chime2.start(now + 0.018);
        chime1.stop(now + 0.135);
        chime2.stop(now + 0.135);
        return;
      }

      // Default 'primary': iPhone / visionOS Haptic Thump + Futuristic Glass Pluck
      // 1. Haptic Sub-Impulse
      const haptic = ctx.createOscillator();
      const hapticGain = ctx.createGain();
      haptic.type = 'sine';
      haptic.frequency.setValueAtTime(165, now);
      haptic.frequency.exponentialRampToValueAtTime(46, now + 0.05);
      hapticGain.gain.setValueAtTime(0.18, now);
      hapticGain.gain.exponentialRampToValueAtTime(0.001, now + 0.052);
      haptic.connect(hapticGain);
      hapticGain.connect(ctx.destination);
      haptic.start(now);
      haptic.stop(now + 0.055);

      // 2. Futuristic Glassy Harmonic Pluck
      const lead = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const glassGain = ctx.createGain();

      lead.type = 'sine';
      lead.frequency.setValueAtTime(1046.5, now); // C6
      lead.frequency.exponentialRampToValueAtTime(783.99, now + 0.065); // G5

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(1567.98, now); // G6
      overtone.frequency.exponentialRampToValueAtTime(1174.66, now + 0.05); // D6

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3800, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + 0.07);
      filter.Q.setValueAtTime(2.2, now);

      glassGain.gain.setValueAtTime(0.001, now);
      glassGain.gain.linearRampToValueAtTime(0.12, now + 0.004);
      glassGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.072);

      lead.connect(filter);
      overtone.connect(filter);
      filter.connect(glassGain);
      glassGain.connect(ctx.destination);

      lead.start(now);
      overtone.start(now);
      lead.stop(now + 0.075);
      overtone.stop(now + 0.075);
    } catch {
      // Ignore audio context errors on restricted devices
    }
  }
}

export const soundManager = new SoundManager();
export const playClickSound = (type: 'primary' | 'tab' | 'card' = 'primary') =>
  soundManager.playClick(type);
export const playHoverSound = () => soundManager.playHover();
