class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
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

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play a simple frequency with envelope
  public playTone(freq: number, type: OscillatorType = 'sine', duration = 0.2, gainLevel = 0.15) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  // Play a sequence of musical notes
  public playMelody(notes: Array<{ freq: number; duration: number }>) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      let timeOffset = ctx.currentTime;
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const durSec = note.duration / 1000;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, timeOffset);

        gain.gain.setValueAtTime(0.001, timeOffset);
        gain.gain.linearRampToValueAtTime(0.2, timeOffset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, timeOffset + durSec);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(timeOffset);
        osc.stop(timeOffset + durSec);

        timeOffset += durSec;
      });
    } catch {
      // AudioContext unavailable
    }
  }

  // Sound effects
  public playCorrect() {
    if (this.isMuted) return;
    this.playTone(523.25, 'triangle', 0.15, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.15, 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.25, 0.25), 200); // G5
  }

  public playIncorrect() {
    if (this.isMuted) return;
    this.playTone(220, 'sawtooth', 0.2, 0.15); // A3
    setTimeout(() => this.playTone(196, 'sawtooth', 0.35, 0.18), 150); // G3
  }

  public playTick() {
    if (this.isMuted) return;
    this.playTone(800, 'sine', 0.05, 0.08);
  }

  public playStamp() {
    if (this.isMuted) return;
    // Heavy satisfying mechanical stamp "thump"
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  public playVictory() {
    if (this.isMuted) return;
    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.3, 0.22), idx * 120);
    });
  }

  // Speak native cultural phrases
  public speakPhrase(text: string, lang = 'en-US') {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis unsupported
    }
  }
}

export const soundEngine = new SoundEngine();
