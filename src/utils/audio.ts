import { useState, useEffect } from 'react';

export interface AudioSettings {
  soundEnabled: boolean;
  masterVolume: number; // 0.0 to 1.0
  sfxVolume: number;    // 0.0 to 1.0
  musicVolume: number;  // 0.0 to 1.0
}

// Web Audio API synth generator for sound effects and global audio management
class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private masterVolume: number = 0.8;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.7;

  private masterGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedEnabled = localStorage.getItem('hoot_sound_enabled');
        if (savedEnabled !== null) {
          this.soundEnabled = savedEnabled === 'true';
        }

        const savedMaster = localStorage.getItem('hoot_master_volume');
        if (savedMaster !== null) {
          const val = parseFloat(savedMaster);
          if (!isNaN(val)) this.masterVolume = Math.max(0, Math.min(1, val));
        }

        const savedSfx = localStorage.getItem('hoot_sfx_volume');
        if (savedSfx !== null) {
          const val = parseFloat(savedSfx);
          if (!isNaN(val)) this.sfxVolume = Math.max(0, Math.min(1, val));
        }

        const savedMusic = localStorage.getItem('hoot_music_volume');
        if (savedMusic !== null) {
          const val = parseFloat(savedMusic);
          if (!isNaN(val)) this.musicVolume = Math.max(0, Math.min(1, val));
        }
      } catch {
        // Ignorer les erreurs d'accès à localStorage (mode navigation privée stricte)
      }
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        this.masterGainNode = this.ctx.createGain();
        this.sfxGainNode = this.ctx.createGain();
        this.musicGainNode = this.ctx.createGain();

        this.sfxGainNode.connect(this.masterGainNode);
        this.musicGainNode.connect(this.masterGainNode);
        this.masterGainNode.connect(this.ctx.destination);

        this.applyGains();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private applyGains() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.masterGainNode) {
      const effectiveMaster = this.soundEnabled ? this.masterVolume : 0;
      this.masterGainNode.gain.cancelScheduledValues(now);
      this.masterGainNode.gain.setValueAtTime(effectiveMaster, now);
    }
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.cancelScheduledValues(now);
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, now);
    }
    if (this.musicGainNode) {
      this.musicGainNode.gain.cancelScheduledValues(now);
      this.musicGainNode.gain.setValueAtTime(this.musicVolume, now);
    }
  }

  private notifySettingsChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('hoot_audio_settings_changed', {
          detail: this.getAudioSettings(),
        })
      );
    }
  }

  public getAudioSettings(): AudioSettings {
    return {
      soundEnabled: this.soundEnabled,
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
    };
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hoot_sound_enabled', String(this.soundEnabled));
      } catch {
        // Ignorer
      }
    }
    this.applyGains();
    this.notifySettingsChange();
  }

  public toggleSound(): boolean {
    const next = !this.soundEnabled;
    this.setSoundEnabled(next);
    if (next) {
      this.playChime();
    }
    return next;
  }

  public setMasterVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.masterVolume = clamped;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hoot_master_volume', clamped.toFixed(2));
      } catch {
        // Ignorer
      }
    }
    this.applyGains();
    this.notifySettingsChange();
  }

  public setSfxVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.sfxVolume = clamped;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hoot_sfx_volume', clamped.toFixed(2));
      } catch {
        // Ignorer
      }
    }
    this.applyGains();
    this.notifySettingsChange();
  }

  public setMusicVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.musicVolume = clamped;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hoot_music_volume', clamped.toFixed(2));
      } catch {
        // Ignorer
      }
    }
    this.applyGains();
    this.notifySettingsChange();
  }

  public resetVolumes(): void {
    this.soundEnabled = true;
    this.masterVolume = 0.8;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.7;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hoot_sound_enabled', 'true');
        localStorage.setItem('hoot_master_volume', '0.80');
        localStorage.setItem('hoot_sfx_volume', '0.80');
        localStorage.setItem('hoot_music_volume', '0.70');
      } catch {
        // Ignorer
      }
    }
    this.applyGains();
    this.notifySettingsChange();
  }

  private getSfxDestination(): AudioNode | null {
    const ctx = this.initCtx();
    if (!ctx) return null;
    return this.sfxGainNode || ctx.destination;
  }

  public getMusicDestination(): AudioNode | null {
    const ctx = this.initCtx();
    if (!ctx) return null;
    return this.musicGainNode || ctx.destination;
  }

  // Play a soft card click
  public playClick() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(dest);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore audio failure
    }
  }

  // Play error buzz / shake sound
  public playError() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(dest);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignore
    }
  }

  // Play victory chime
  public playVictory() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // Play soft chime
  public playChime() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(dest);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  }

  // Owl "Hoot" easter egg sound
  public playOwlHoot() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      // First hoot
      const hoot = (delay: number, duration: number, startFreq: number, peakFreq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const t = ctx.currentTime + delay;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.linearRampToValueAtTime(peakFreq, t + duration * 0.4);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.9, t + duration);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.15, t + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + duration);
      };

      hoot(0, 0.25, 280, 340);
      hoot(0.35, 0.4, 300, 380);
    } catch {
      // Ignore
    }
  }

  // Achievement unlocked fanfare
  public playAchievement() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.07;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  // Quick success ding
  public playSuccess() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(dest);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  }

  // Soft pop sound
  public playPop() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(dest);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Ignore
    }
  }

  // Authentic 8-bit retro chiptune jingle for Konami Code
  public playKonamiJingle() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      // Classic rapid 8-bit fanfare arpeggio (C5 -> E5 -> G5 -> B5 -> C6 -> E6 -> G6 -> C7)
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51, 1567.98, 2093.0];
      const stepTime = 0.055;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square'; // Authentic 8-bit square pulse wave
        const t = ctx.currentTime + idx * stepTime;
        osc.frequency.setValueAtTime(freq, t);

        const duration = idx === notes.length - 1 ? 0.35 : stepTime * 0.9;
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + duration);
      });
    } catch {
      // Ignore
    }
  }

  // Authentic 1982 Vectrex cathode vector hum & phosphor unlock power-up
  public playVectrexUnlock() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;
      const t = ctx.currentTime;

      // 1. Vector cathode charge sweep (sawtooth)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(60, t);
      osc1.frequency.exponentialRampToValueAtTime(320, t + 0.4);
      gain1.gain.setValueAtTime(0.001, t);
      gain1.gain.linearRampToValueAtTime(0.15, t + 0.1);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc1.connect(gain1);
      gain1.connect(dest);
      osc1.start(t);
      osc1.stop(t + 0.45);

      // 2. High phosphor resonance chime (triangle vector harmonics)
      const pings = [880, 1174.66, 1760, 2349.32];
      pings.forEach((freq, i) => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        const pingTime = t + 0.25 + i * 0.08;
        osc2.frequency.setValueAtTime(freq, pingTime);
        gain2.gain.setValueAtTime(0.12, pingTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, pingTime + 0.3);
        osc2.connect(gain2);
        gain2.connect(dest);
        osc2.start(pingTime);
        osc2.stop(pingTime + 0.3);
      });
    } catch {
      // Ignore
    }
  }

  // Enchanted wooden leaf kalimba / flute note
  public playLeafNote(freq: number) {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;
      const t = ctx.currentTime;

      // 1. Primary organic tone (triangle wave with warm resonance)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);

      gain1.gain.setValueAtTime(0.001, t);
      gain1.gain.linearRampToValueAtTime(0.18, t + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

      osc1.connect(gain1);
      gain1.connect(dest);
      osc1.start(t);
      osc1.stop(t + 0.55);

      // 2. High harmonic shimmer (sine wave an octave above)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, t);

      gain2.gain.setValueAtTime(0.001, t);
      gain2.gain.linearRampToValueAtTime(0.06, t + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc2.connect(gain2);
      gain2.connect(dest);
      osc2.start(t);
      osc2.stop(t + 0.35);
    } catch {
      // Ignore
    }
  }

  // Triumphant Coucou Hibou jingle on discovery of the leaf piano easter egg
  public playCoucouHibouJingle() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;
      const t = ctx.currentTime;
      const jingleNotes = [
        { freq: 659.25, delay: 0.00, dur: 0.22 }, // Mi
        { freq: 587.33, delay: 0.24, dur: 0.22 }, // Ré
        { freq: 523.25, delay: 0.48, dur: 0.22 }, // Do
        { freq: 587.33, delay: 0.72, dur: 0.38 }, // Ré
        { freq: 659.25, delay: 1.20, dur: 0.22 }, // Mi
        { freq: 587.33, delay: 1.44, dur: 0.22 }, // Ré
        { freq: 523.25, delay: 1.68, dur: 0.22 }, // Do
        { freq: 587.33, delay: 1.92, dur: 0.38 }, // Ré
        { freq: 659.25, delay: 2.38, dur: 0.20 }, // Mi
        { freq: 587.33, delay: 2.60, dur: 0.20 }, // Ré
        { freq: 659.25, delay: 2.82, dur: 0.20 }, // Mi
        { freq: 587.33, delay: 3.04, dur: 0.20 }, // Ré
        { freq: 523.25, delay: 3.28, dur: 0.65 }, // Do
      ];

      jingleNotes.forEach(({ freq, delay, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const noteTime = t + delay;
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + dur);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(noteTime);
        osc.stop(noteTime + dur);
      });
    } catch {
      // Ignore
    }
  }

  // Bruitage physique de déchirure de sachet / booster métallisé (foil rip)
  public playBoosterTear() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;

      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.42);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.55));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(3600, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(900, now + 0.4);
      filter.Q.setValueAtTime(4.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      whiteNoise.start(now);

      // Harmonique de déchirement aigu
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

      oscGain.gain.setValueAtTime(0.04, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  // Tranchant de lame / taillade au clic dans l'Odyssée
  public playSlash(isCrit: boolean = false) {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;
      const t = ctx.currentTime;

      // 1. Whoosh / tranchant rapide
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isCrit ? 'sawtooth' : 'triangle';

      const startFreq = isCrit ? 920 : 680;
      const endFreq = isCrit ? 160 : 120;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + (isCrit ? 0.12 : 0.08));

      const initialGain = isCrit ? 0.15 : 0.08;
      gain.gain.setValueAtTime(initialGain, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isCrit ? 0.13 : 0.08));

      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + (isCrit ? 0.13 : 0.08));

      // 2. Si coup critique, impact percutant et clochette d'impact
      if (isCrit) {
        const ping = ctx.createOscillator();
        const pingGain = ctx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(1100, t);
        ping.frequency.exponentialRampToValueAtTime(1760, t + 0.14);
        pingGain.gain.setValueAtTime(0.07, t);
        pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        ping.connect(pingGain);
        pingGain.connect(dest);
        ping.start(t);
        ping.stop(t + 0.16);
      }
    } catch {
      // Ignore
    }
  }

  // Éclat de sève / récolte de butin
  public playSapBurst() {
    if (!this.soundEnabled || this.masterVolume <= 0 || this.sfxVolume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const dest = this.getSfxDestination() || ctx.destination;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.exponentialRampToValueAtTime(1040, t + 0.09);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Ignore
    }
  }
}

export const soundFx = new AudioManager();

/**
 * Hook React réactif pour s'abonner aux réglages audio globaux du site.
 */
export function useAudioSettings() {
  const [settings, setSettings] = useState<AudioSettings>(() => soundFx.getAudioSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(soundFx.getAudioSettings());
    };

    window.addEventListener('hoot_audio_settings_changed', handleUpdate);
    return () => {
      window.removeEventListener('hoot_audio_settings_changed', handleUpdate);
    };
  }, []);

  return {
    soundEnabled: settings.soundEnabled,
    masterVolume: settings.masterVolume,
    sfxVolume: settings.sfxVolume,
    musicVolume: settings.musicVolume,
    toggleSound: () => soundFx.toggleSound(),
    setSoundEnabled: (enabled: boolean) => soundFx.setSoundEnabled(enabled),
    setMasterVolume: (vol: number) => soundFx.setMasterVolume(vol),
    setSfxVolume: (vol: number) => soundFx.setSfxVolume(vol),
    setMusicVolume: (vol: number) => soundFx.setMusicVolume(vol),
    resetVolumes: () => soundFx.resetVolumes(),
    playTestSfx: () => soundFx.playSuccess(),
    playChime: () => soundFx.playChime(),
    playOwlHoot: () => soundFx.playOwlHoot(),
    playSlash: (isCrit?: boolean) => soundFx.playSlash(isCrit),
  };
}
