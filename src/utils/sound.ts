// Atmospheric Lo-Fi Chillhop & Cinematic Studio Backsound Engine for Zeevisual Portfolio
// No click/hover beeps — plays a warm, relaxing multi-instrument background soundtrack
// (Warm Rhodes Electric Piano chords, Deep Sub-Bass, Soft Lo-Fi Beat & Dreamy Bell Melody).

class BacksoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private userMuted: boolean = false;
  private stepTimer: number | null = null;
  private currentStep: number = 0;
  private listeners: Set<(playing: boolean) => void> = new Set();
  private autoStartBound: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('zeevisual_backsound_muted');
      this.userMuted = savedMute === 'true';

      // Auto-start backsound on first user interaction if not muted
      if (!this.userMuted) {
        this.autoStartBound = () => {
          if (!this.userMuted && !this.isPlaying) {
            this.start();
          }
          this.removeAutoStartListeners();
        };
        window.addEventListener('pointerdown', this.autoStartBound, { once: true, passive: true });
        window.addEventListener('keydown', this.autoStartBound, { once: true, passive: true });
      }
    }
  }

  private removeAutoStartListeners() {
    if (this.autoStartBound && typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', this.autoStartBound);
      window.removeEventListener('keydown', this.autoStartBound);
      this.autoStartBound = null;
    }
  }

  public subscribe(cb: (playing: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.isPlaying);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      // Master volume & warm studio compressor/filter
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public start(): boolean {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return false;

    if (this.isPlaying) return true;
    this.isPlaying = true;
    this.userMuted = false;
    localStorage.setItem('zeevisual_backsound_muted', 'false');
    this.removeAutoStartListeners();

    // Smooth fade-in
    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(0.22, now + 1.2);

    // 75 BPM -> 16th note = 200ms per step (16 steps per bar, 64 steps per 4-bar loop)
    const stepMs = 200;
    this.scheduleStep();
    this.stepTimer = window.setInterval(() => {
      this.scheduleStep();
    }, stepMs);

    this.notify();
    return true;
  }

  public stop(): boolean {
    if (!this.isPlaying) return false;
    this.isPlaying = false;
    this.userMuted = true;
    localStorage.setItem('zeevisual_backsound_muted', 'true');

    if (this.stepTimer !== null) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    }

    this.notify();
    return false;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      return this.stop();
    } else {
      return this.start();
    }
  }

  // --- Musical Synthesis Helpers ---

  // 1. Warm Rhodes Electric Piano + Ambient Pad Chord Voice
  private playRhodesChord(freqs: number[], durationSec: number) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, now);
    filter.frequency.exponentialRampToValueAtTime(480, now + durationSec);
    filter.connect(this.masterGain);

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Slight chorus detune for lush stereo warmth
      osc1.frequency.setValueAtTime(f, now);
      osc2.frequency.setValueAtTime(f * 1.0025, now);

      // Gentle strum stagger (18ms per note)
      const startAt = now + idx * 0.018;
      voiceGain.gain.setValueAtTime(0.0001, startAt);
      voiceGain.gain.linearRampToValueAtTime(0.085 / freqs.length, startAt + 0.08);
      voiceGain.gain.exponentialRampToValueAtTime(0.035 / freqs.length, startAt + durationSec * 0.5);
      voiceGain.gain.exponentialRampToValueAtTime(0.0005, startAt + durationSec);

      osc1.connect(voiceGain);
      osc2.connect(voiceGain);
      voiceGain.connect(filter);

      osc1.start(startAt);
      osc2.start(startAt);
      osc1.stop(startAt + durationSec + 0.05);
      osc2.stop(startAt + durationSec + 0.05);
    });
  }

  // 2. Deep Warm Sub-Bass Note
  private playBassNote(freq: number, durationSec: number) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + durationSec + 0.04);
  }

  // 3. Dreamy Bell / Kalimba Melody Note with Echo
  private playMelodyNote(freq: number) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const playTap = (delaySec: number, amp: number) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + delaySec;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);

      gain.gain.setValueAtTime(0.0005, t);
      gain.gain.linearRampToValueAtTime(amp, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 1.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 1.15);
    };

    // Main note + 2 soft stereo delay echoes
    playTap(0, 0.048);
    playTap(0.3, 0.022);
    playTap(0.6, 0.01);
  }

  // 4. Soft Lo-Fi Kick Drum
  private playSoftKick() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  // 5. Soft Lo-Fi Rim / Brushed Hat
  private playSoftHat(isRim = false) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    if (isRim) {
      // Soft wooden rim tap
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.055);
      return;
    }

    // Subtle high brushed tick
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.025);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, now);

    gain.gain.setValueAtTime(0.012, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.028);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  private scheduleStep() {
    if (!this.isPlaying) return;
    const step = this.currentStep % 64; // 4 bars of 16 steps
    const stepInBar = step % 16;
    const bar = Math.floor(step / 16);

    // 4-Bar Lush Lo-Fi Jazz/Chillhop Chord Progression:
    // Bar 0: Fmaj9 (F2 | A3, C4, E4, G4)
    // Bar 1: Em7   (E2 | G3, B3, D4, F4)
    // Bar 2: Dm9   (D2 | F3, A3, C4, E4)
    // Bar 3: Cmaj9 (C2 | E3, G3, B3, D4)
    const chords = [
      { bass: 87.31, notes: [220.0, 261.63, 329.63, 392.0] },
      { bass: 82.41, notes: [196.0, 246.94, 293.66, 349.23] },
      { bass: 73.42, notes: [174.61, 220.0, 261.63, 329.63] },
      { bass: 65.41, notes: [164.81, 196.0, 246.94, 293.66] },
    ];

    const currentChord = chords[bar];

    // Chords on beat 1 (step 0) and soft re-voicing on step 10
    if (stepInBar === 0) {
      this.playRhodesChord(currentChord.notes, 3.0);
      this.playBassNote(currentChord.bass, 1.8);
    } else if (stepInBar === 10) {
      this.playBassNote(currentChord.bass * 1.5, 1.1);
    }

    // Soft Lo-Fi Beat Pattern
    if (stepInBar === 0 || stepInBar === 7 || stepInBar === 10) {
      this.playSoftKick();
    }
    if (stepInBar === 4 || stepInBar === 12) {
      this.playSoftHat(true); // Rimshot on beats 2 & 4
    }
    if (stepInBar % 2 === 0) {
      this.playSoftHat(false); // Gentle 8th-note brushed hat
    }

    // Sparse, Dreamy Pentatonic Kalimba/Bell Melody
    const melodyMap: Record<number, number> = {
      2: 523.25, // C5
      6: 659.25, // E5
      11: 587.33, // D5
      18: 783.99, // G5
      22: 659.25, // E5
      28: 523.25, // C5
      34: 440.0, // A4
      38: 523.25, // C5
      42: 659.25, // E5
      50: 587.33, // D5
      54: 523.25, // C5
      60: 440.0, // A4
    };

    if (melodyMap[step]) {
      this.playMelodyNote(melodyMap[step]);
    }

    this.currentStep = (this.currentStep + 1) % 64;
  }
}

export const backsoundManager = new BacksoundManager();
export const soundManager = backsoundManager;
// No-op stubs so any legacy imports never play click/hover sounds
export const playClickSound = (_type?: 'primary' | 'tab' | 'card') => {};
export const playHoverSound = () => {};
