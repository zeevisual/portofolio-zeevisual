// Backsound Audio Manager for Zeevisual Portfolio
// Track: Lo-Fi Japanese Chill by Infraction - Tokyo Streets (https://youtu.be/VZQAGK4Hr4k)
// Features smooth fade-in/fade-out, auto-loop, and automatic pause during video previews.

class BacksoundManager {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private userMuted: boolean = false;
  private pausedByVideo: boolean = false;
  private fadeTimer: number | null = null;
  private readonly targetVolume: number = 0.65;
  private listeners: Set<(playing: boolean) => void> = new Set();
  private autoStartBound: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('zeevisual_backsound_muted');
      this.userMuted = savedMute === 'true';

      // Preload audio element so it starts playing immediately on interaction
      this.ensureAudio();

      // Auto-start backsound on first user interaction if not muted
      if (!this.userMuted) {
        this.autoStartBound = () => {
          if (!this.userMuted && !this.isPlaying && !this.pausedByVideo) {
            this.start();
          }
        };
        window.addEventListener('pointerdown', this.autoStartBound, { passive: true });
        window.addEventListener('keydown', this.autoStartBound, { passive: true });
        window.addEventListener('touchstart', this.autoStartBound, { passive: true });
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
      window.removeEventListener('touchstart', this.autoStartBound);
      this.autoStartBound = null;
    }
  }

  private ensureAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.audio) {
      const audio = document.createElement('audio');
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = this.targetVolume;

      // Primary source: high-quality Opus WebM; Fallback: AAC M4A (for iOS Safari)
      const srcWebm = document.createElement('source');
      srcWebm.src = '/audio/backsound.webm';
      srcWebm.type = 'audio/webm; codecs=opus';

      const srcM4a = document.createElement('source');
      srcM4a.src = '/audio/backsound.m4a';
      srcM4a.type = 'audio/mp4';

      audio.appendChild(srcWebm);
      audio.appendChild(srcM4a);
      this.audio = audio;
    }
    return this.audio;
  }

  private clearFade() {
    if (this.fadeTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  private fadeVolumeTo(target: number, durationMs: number, onComplete?: () => void) {
    const audio = this.audio;
    if (!audio || typeof window === 'undefined') {
      onComplete?.();
      return;
    }
    this.clearFade();
    const startVol = audio.volume;
    const diff = target - startVol;
    const steps = Math.max(1, Math.floor(durationMs / 25));
    let currentStep = 0;

    this.fadeTimer = window.setInterval(() => {
      currentStep++;
      const progress = Math.min(1, currentStep / steps);
      audio.volume = Math.max(0, Math.min(1, startVol + diff * progress));
      if (progress >= 1) {
        this.clearFade();
        onComplete?.();
      }
    }, 25);
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

  public start(): boolean {
    const audio = this.ensureAudio();
    if (!audio) return false;

    this.userMuted = false;
    this.pausedByVideo = false;
    localStorage.setItem('zeevisual_backsound_muted', 'false');

    if (this.isPlaying && !audio.paused) {
      this.removeAutoStartListeners();
      return true;
    }

    audio.volume = 0.05;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.removeAutoStartListeners();
          this.notify();
          this.fadeVolumeTo(this.targetVolume, 600);
        })
        .catch(() => {
          // Browser blocked autoplay until direct user gesture; keep listeners active
          this.isPlaying = false;
          this.notify();
        });
    } else {
      this.isPlaying = true;
      this.removeAutoStartListeners();
      this.notify();
      this.fadeVolumeTo(this.targetVolume, 600);
    }

    return true;
  }

  public stop(savePreference: boolean = true) {
    this.isPlaying = false;
    if (savePreference) {
      this.userMuted = true;
      localStorage.setItem('zeevisual_backsound_muted', 'true');
      this.removeAutoStartListeners();
    }
    this.notify();

    const audio = this.audio;
    if (audio) {
      this.fadeVolumeTo(0, 300, () => {
        if (!this.isPlaying) {
          audio.pause();
        }
      });
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop(true);
      return false;
    } else {
      this.start();
      return true;
    }
  }

  /**
   * Automatically pause backsound when a video preview modal is opened or a video is played.
   */
  public pauseForVideo() {
    this.pausedByVideo = true;
    if (this.isPlaying) {
      this.stop(false);
    }
  }

  /**
   * Automatically resume backsound when the video preview modal is closed (unless user muted it manually).
   */
  public resumeAfterVideo() {
    if (!this.pausedByVideo) return;
    this.pausedByVideo = false;
    if (!this.userMuted && !this.isPlaying) {
      this.start();
    }
  }
}

export const backsoundManager = new BacksoundManager();
