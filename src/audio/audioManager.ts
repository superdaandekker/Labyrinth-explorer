/**
 * Central Audio Manager — singleton pattern
 * Single AudioContext shared across all audio operations.
 */

type OscType = OscillatorType;

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicIntervalId: ReturnType<typeof setInterval> | null = null;
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
    if (this.musicIntervalId !== null) return;
    const ctx = this.getCtx();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(musicVolume * 0.1, ctx.currentTime);
    const playNote = (freq: number, time: number, dur: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(0.1, time + 0.1);
      g.gain.linearRampToValueAtTime(0, time + dur);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(time);
      osc.stop(time + dur);
    };
    const melody = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
    let step = 0;
    this.musicIntervalId = setInterval(() => {
      playNote(melody[step % melody.length], ctx.currentTime, 1.5);
      step++;
    }, 2000);
  }

  stopBackgroundMusic(): void {
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
