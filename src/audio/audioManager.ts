/**
 * Central Audio Manager — singleton pattern
 * Single AudioContext shared across all audio operations.
 */

type OscType = OscillatorType;

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicIntervalId: ReturnType<typeof setInterval> | null = null;
  private bgAudio: HTMLAudioElement | null = null;
  private proximityAnimId: number | null = null;
  private proximityOsc: OscillatorNode | null = null;
  private proximityGain: GainNode | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  playSound(freq: number, type: OscType = 'sine', duration = 0.1, volume = 0.1, sfxVolume = 1): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume * sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  startBackgroundMusic(musicVolume: number): void {
    if (this.bgAudio) return;
    const audio = new Audio('/background-music.mp3');
    audio.loop = true;
    audio.volume = Math.min(1, Math.max(0, musicVolume));
    audio.play().catch(() => {});
    this.bgAudio = audio;
  }

  stopBackgroundMusic(): void {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
      this.bgAudio = null;
    }
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  startProximityAudio(
    musicVolume: number,
    getPlayerPos: () => { x: number; y: number },
    exitPos: { x: number; y: number }
  ): void {
    this.stopProximityAudio();
    const ctx = this.getCtx();
    const masterGain = ctx.createGain();
    const panner = ctx.createPanner();
    masterGain.connect(ctx.destination);
    panner.connect(masterGain);
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(panner);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    osc.start();
    this.proximityOsc = osc;
    this.proximityGain = g;
    const update = () => {
      const pos = getPlayerPos();
      const dx = exitPos.x - pos.x;
      const dy = exitPos.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const vol = Math.max(0, 1 - dist / 15) * musicVolume * 0.2;
      g.gain.setTargetAtTime(vol, ctx.currentTime, 0.1);
      panner.setPosition(dx / 5, 0, dy / 5);
      this.proximityAnimId = requestAnimationFrame(update);
    };
    this.proximityAnimId = requestAnimationFrame(update);
  }

  stopProximityAudio(): void {
    if (this.proximityAnimId !== null) { cancelAnimationFrame(this.proximityAnimId); this.proximityAnimId = null; }
    if (this.proximityOsc) { try { this.proximityOsc.stop(); } catch (_) {} this.proximityOsc = null; }
    this.proximityGain = null;
  }

  stopAll(): void {
    this.stopBackgroundMusic();
    this.stopProximityAudio();
  }
}

export const audioManager = new AudioManager();
