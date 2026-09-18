class GlobalSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private sfxVolume: number = 0.85;
  private musicVolume: number = 0.6;
  private lastHoverTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('passage_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedSfx = localStorage.getItem('passage_sound_sfx_vol');
      if (savedSfx !== null) {
        this.sfxVolume = parseFloat(savedSfx);
      }
      const savedMusic = localStorage.getItem('passage_sound_music_vol');
      if (savedMusic !== null) {
        this.musicVolume = parseFloat(savedMusic);
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
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

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('passage_sound_muted', String(muted));
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('passage_sound_sfx_vol', String(this.sfxVolume));
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('passage_sound_music_vol', String(this.musicVolume));
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  // Micro-interaction: Subtle card hover tick (throttled to avoid buzz)
  public playHover() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const now = performance.now();
    if (now - this.lastHoverTime < 50) return; // throttle
    this.lastHoverTime = now;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.02);

      const effectiveGain = 0.03 * this.sfxVolume * this.masterVolume;
      gain.gain.setValueAtTime(effectiveGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch {
      // Audio context blocked
    }
  }

  // Micro-interaction: Clean tactile card/pill button click
  public playClick() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

      const effectiveGain = 0.12 * this.sfxVolume * this.masterVolume;
      gain.gain.setValueAtTime(effectiveGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }

  // Cultural Quiz: Harmonic correct chord (A4 - C#5 - E5 chime)
  public playCorrect() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const freqs = [440, 554.37, 659.25, 880];
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        const gainLevel = 0.14 * this.sfxVolume * this.masterVolume;
        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(gainLevel, now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.45);
      });
    } catch {
      // ignore
    }
  }

  // Cultural Quiz: Damped low bell for incorrect guess
  public playIncorrect() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.25);

      const gainLevel = 0.09 * this.sfxVolume * this.masterVolume;
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // ignore
    }
  }

  // Physical Stamp Unlocking: Deep parchment stamp thud + metallic seal ring
  public playStamp() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Deep impact thud
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(120, now);
      thudOsc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

      const thudVol = 0.28 * this.sfxVolume * this.masterVolume;
      thudGain.gain.setValueAtTime(thudVol, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);

      thudOsc.start(now);
      thudOsc.stop(now + 0.22);

      // 2. High metallic seal resonance ring
      const ringOsc = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ringOsc.type = 'sine';
      ringOsc.frequency.setValueAtTime(987.77, now + 0.04); // B5
      ringOsc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // D6

      const ringVol = 0.1 * this.sfxVolume * this.masterVolume;
      ringGain.gain.setValueAtTime(ringVol, now + 0.04);
      ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      ringOsc.connect(ringGain);
      ringGain.connect(ctx.destination);

      ringOsc.start(now + 0.04);
      ringOsc.stop(now + 0.55);
    } catch {
      // ignore
    }
  }

  // Level Up / Rank Elevation Fanfare
  public playLevelUp() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [
        { f: 523.25, d: 0.1 }, // C5
        { f: 659.25, d: 0.1 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.5, d: 0.4 }, // C6
      ];

      let t = ctx.currentTime;
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, t);

        const vol = 0.18 * this.sfxVolume * this.masterVolume;
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + n.d);
        t += n.d * 0.85;
      });
    } catch {
      // ignore
    }
  }

  // High-impact victory fanfare chord
  public playVictory() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const chords = [
        [392, 493.88, 587.33], // G major
        [440, 554.37, 659.25], // A major
        [523.25, 659.25, 783.99, 1046.5], // C major flourish
      ];

      let t = ctx.currentTime;
      chords.forEach((chord, idx) => {
        const dur = idx === chords.length - 1 ? 0.65 : 0.2;
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          const vol = (0.12 / chord.length) * this.sfxVolume * this.masterVolume;
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.exponentialRampToValueAtTime(vol, t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + dur);
        });
        t += dur * 0.9;
      });
    } catch {
      // ignore
    }
  }
}

export const globalSoundEngine = new GlobalSoundEngine();
