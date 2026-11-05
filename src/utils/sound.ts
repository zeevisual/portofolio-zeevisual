// Web Audio API Interactive UI Sound Synthesizer for Zeevisual Portfolio
// Produces crisp, tactile camera/glass UI click & tab sounds with zero external network latency.

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      this.playClick('primary');
    }
    return this.enabled;
  }

  /**
   * Plays a crisp, pleasant UI click sound.
   * - 'primary': Warm harmonic glass/shutter click for buttons & nav links
   * - 'tab': Crisp camera dial tick for category tabs & slide arrows
   * - 'card': Soft double-transient shutter sound when opening a project/certificate
   */
  public playClick(type: 'primary' | 'tab' | 'card' = 'primary'): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'tab') {
        // Crisp mechanical dial tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.045);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        return;
      }

      if (type === 'card') {
        // Subtle camera shutter + warm chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(520, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.09);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(260, now);
        osc2.frequency.exponentialRampToValueAtTime(440, now + 0.07);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.1);
        osc2.stop(now + 0.1);
        return;
      }

      // Default 'primary': Crisp tactile pop + subtle harmonic overtone
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.06);

      sub.type = 'triangle';
      sub.frequency.setValueAtTime(1240, now);
      sub.frequency.exponentialRampToValueAtTime(620, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.07);
      sub.stop(now + 0.05);
    } catch {
      // Ignore audio context errors on restricted devices
    }
  }
}

export const soundManager = new SoundManager();
export const playClickSound = (type: 'primary' | 'tab' | 'card' = 'primary') =>
  soundManager.playClick(type);
