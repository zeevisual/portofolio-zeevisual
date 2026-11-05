// Atmospheric Lo-Fi Chillhop & Cinematic Studio Backsound Engine for Zeevisual Portfolio
// Features boosted studio volume with DynamicsCompressor & automatic pause during video previews.

class BacksoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isPlaying: boolean = false;
  private userMuted: boolean = false;
  private pausedByVideo: boolean = false;
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
          if (!this.userMuted && !this.isPlaying && !this.pausedByVideo) {
            this.start();
          }
          this.removeAutoStartListeners();
        };
        window.addEventListener('pointerdown', this.autoStartBound, { once: true, passive: true });
        window.addEventListener('keydown', this.autoStartBound, { once: true, passive: true });
      }

      // Automatically pause backsound whenever any <video> element starts playing
      document.addEventListener(
        'play',
        (e) => {
          const target = e.target as HTMLElement | null;
          if (target && target.tagName === 'VIDEO') {
            this.pauseForVideo();
          }
        },
        true
      );
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

      // Studio Dynamics Compressor for rich, full-bodied loudness without clipping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(3.5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.008, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.22, this.ctx.currentTime);

      // Boosted Master Volume (0.62 gain into compressor = clear, warm, audible presence)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.62, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
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
    this.pausedByVideo = false;
    localStorage.setItem('zeevisual_backsound_muted', 'false');
    this.removeAutoStartListeners();

    // Smooth fade-in to boosted volume (0.62)
    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.01, now);
    this.masterGain.gain.linearRampToValueAtTime(0.62, now + 0.8);

    const stepMs = 200; // 75 BPM
    this.scheduleStep();
    if (this.stepTimer !== null) clearInterval(this.stepTimer);
    this.stepTimer = window.setInterval(() => {
      this.scheduleStep();
    }, stepMs);

    this.notify();
    return true;
  }

  public stop(): boolean {
    this.pausedByVideo = false;
    if (!this.isPlaying) {
      this.userMuted = true;
      localStorage.setItem('zeevisual_backsound_muted', 'true');
      return false;
    }
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
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    }

    this.notify();
    return false;
  }

  /**
   * Automatically called when a video preview modal opens or a video plays.
   * Stops the music immediately without overwriting the user's mute preference.
   */
  public pauseForVideo(): void {
    if (this.isPlaying) {
      this.pausedByVideo = true;
      this.isPlaying = false;

      if (this.stepTimer !== null) {
        clearInterval(this.stepTimer);
        this.stepTimer = null;
      }

      if (this.ctx && this.masterGain) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      }

      this.notify();
    } else if (!this.userMuted) {
      // Prevent auto-start from firing while watching a video
      this.pausedByVideo = true;
    }
  }

  /**
   * Automatically called when the video preview modal closes.
   * Resumes the music if it was paused by video and not manually muted by user.
   */
  public resumeAfterVideo(): void {
    if (this.pausedByVideo && !this.userMuted) {
      this.pausedByVideo = false;
      this.start();
    } else {
      this.pausedByVideo = false;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      return this.stop();
    } else {
      return this.start();
    }
  }

  // --- Musical Synthesis Helpers (Boosted Gains for Rich Audibility) ---

  // 1. Warm Rhodes Electric Piano + Ambient Pad Chord Voice
  private playRhodesChord(freqs: number[], durationSec: number) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1450, now);
    filter.frequency.exponentialRampToValueAtTime(580, now + durationSec);
    filter.connect(this.masterGain);

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(f, now);
      osc2.frequency.setValueAtTime(f * 1.003, now);

      const startAt = now + idx * 0.018;
      voiceGain.gain.setValueAtTime(0.0001, startAt);
      voiceGain.gain.linearRampToValueAtTime(0.24 / freqs.length, startAt + 0.06);
      voiceGain.gain.exponentialRampToValueAtTime(0.11 / freqs.length, startAt + durationSec * 0.55);
      voiceGain.gain.exponentialRampToValueAtTime(0.001, startAt + durationSec);

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
    const sub = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq * 2, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(310, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    sub.start(now);
    osc.stop(now + durationSec + 0.04);
    sub.stop(now + durationSec + 0.04);
  }

  // 3. Dreamy Bell / Kalimba Melody Note with Echo
  private playMelodyNote(freq: number) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const playTap = (delaySec: number, amp: number) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + delaySec;
      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(amp, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 1.15);

      osc.connect(filter);
      overtone.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      overtone.start(t);
      osc.stop(t + 1.2);
      overtone.stop(t + 1.2);
    };

    playTap(0, 0.14);
    playTap(0.3, 0.065);
    playTap(0.6, 0.028);
  }

  // 4. Soft Lo-Fi Kick Drum
  private playSoftKick() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.13);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // 5. Soft Lo-Fi Rim / Brushed Hat
  private playSoftHat(isRim = false) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    if (isRim) {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
      return;
    }

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(3400, now);
    osc.frequency.exponentialRampToValueAtTime(1900, now + 0.028);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200, now);

    gain.gain.setValueAtTime(0.038, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.032);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  private scheduleStep() {
    if (!this.isPlaying) return;
    const step = this.currentStep % 64;
    const stepInBar = step % 16;
    const bar = Math.floor(step / 16);

    const chords = [
      { bass: 87.31, notes: [220.0, 261.63, 329.63, 392.0] },
      { bass: 82.41, notes: [196.0, 246.94, 293.66, 349.23] },
      { bass: 73.42, notes: [174.61, 220.0, 261.63, 329.63] },
      { bass: 65.41, notes: [164.81, 196.0, 246.94, 293.66] },
    ];

    const currentChord = chords[bar];

    if (stepInBar === 0) {
      this.playRhodesChord(currentChord.notes, 3.0);
      this.playBassNote(currentChord.bass, 1.8);
    } else if (stepInBar === 10) {
      this.playBassNote(currentChord.bass * 1.5, 1.1);
    }

    if (stepInBar === 0 || stepInBar === 7 || stepInBar === 10) {
      this.playSoftKick();
    }
    if (stepInBar === 4 || stepInBar === 12) {
      this.playSoftHat(true);
    }
    if (stepInBar % 2 === 0) {
      this.playSoftHat(false);
    }

    const melodyMap: Record<number, number> = {
      2: 523.25,
      6: 659.25,
      11: 587.33,
      18: 783.99,
      22: 659.25,
      28: 523.25,
      34: 440.0,
      38: 523.25,
      42: 659.25,
      50: 587.33,
      54: 523.25,
      60: 440.0,
    };

    if (melodyMap[step]) {
      this.playMelodyNote(melodyMap[step]);
    }

    this.currentStep = (this.currentStep + 1) % 64;
  }
}

export const backsoundManager = new BacksoundManager();
export const soundManager = backsoundManager;
export const playClickSound = (_type?: 'primary' | 'tab' | 'card') => {};
export const playHoverSound = () => {};
