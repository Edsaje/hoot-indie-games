import { noteToFrequency, type SoundSynthesisConfig } from '../data/blindtestPuzzles';

// Caches en mémoire pour un démarrage instantané et sans latence
const rawBufferCache = new Map<string, ArrayBuffer>();
const decodedBufferCache = new Map<string, AudioBuffer>();
const inFlightRequests = new Map<string, Promise<ArrayBuffer | null>>();

/**
 * Précharge l'extrait audio en tâche de fond pour une écoute instantanée dès le clic.
 */
export async function preloadBlindTestAudio(url?: string): Promise<void> {
  if (!url || typeof window === 'undefined') return;
  if (rawBufferCache.has(url) || decodedBufferCache.has(url) || inFlightRequests.has(url)) {
    return;
  }

  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      rawBufferCache.set(url, ab);
      return ab;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, promise);
}

/**
 * Décode les données audio brutes en AudioBuffer Web Audio.
 */
export async function getOrDecodeAudioBuffer(
  ctx: AudioContext,
  url?: string
): Promise<AudioBuffer | null> {
  if (!url) return null;

  if (decodedBufferCache.has(url)) {
    return decodedBufferCache.get(url)!;
  }

  let ab = rawBufferCache.get(url);
  if (!ab) {
    if (inFlightRequests.has(url)) {
      ab = (await inFlightRequests.get(url)) || undefined;
    } else {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        ab = await res.arrayBuffer();
        rawBufferCache.set(url, ab);
      } catch {
        return null;
      }
    }
  }

  if (!ab) return null;

  try {
    // decodeAudioData détache le ArrayBuffer, on lui passe donc une copie
    const decoded = await ctx.decodeAudioData(ab.slice(0));
    decodedBufferCache.set(url, decoded);
    return decoded;
  } catch (err) {
    console.warn(`[BlindTestAudio] Décodage échoué pour ${url}, bascule sur synthé:`, err);
    return null;
  }
}

export interface PlayBlindTestOptions {
  ctx: AudioContext;
  audioUrl?: string;
  audioConfig: SoundSynthesisConfig;
  playDuration: number;
  masterGain: GainNode;
}

export interface PlayBlindTestHandle {
  stop: () => void;
  isOfficialClip: boolean;
}

/**
 * Joue l'extrait musical du jeu sélectionné.
 * Privilégie l'extrait officiel MP3 (authentique & dynamique).
 * Bascule en douceur sur le synthétiseur Web Audio si absent ou hors-ligne.
 */
export async function playBlindTestAudioClip({
  ctx,
  audioUrl,
  audioConfig,
  playDuration,
  masterGain,
}: PlayBlindTestOptions): Promise<PlayBlindTestHandle> {
  const startTime = ctx.currentTime + 0.04;

  // 1. Essai de lecture de la piste MP3 officielle
  if (audioUrl) {
    try {
      const buffer = await getOrDecodeAudioBuffer(ctx, audioUrl);
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const clipGain = ctx.createGain();
        // Fondu d'attaque court pour éviter tout claquement
        clipGain.gain.setValueAtTime(0.001, startTime);
        clipGain.gain.linearRampToValueAtTime(1.0, startTime + 0.035);

        // Fondu de sortie fluide à la fin du palier
        if (playDuration > 0.2) {
          clipGain.gain.setValueAtTime(1.0, startTime + playDuration - 0.12);
          clipGain.gain.linearRampToValueAtTime(0.001, startTime + playDuration);
        }

        source.connect(clipGain);
        clipGain.connect(masterGain);

        source.start(startTime, 0, playDuration);

        return {
          isOfficialClip: true,
          stop: () => {
            try {
              clipGain.gain.setValueAtTime(clipGain.gain.value, ctx.currentTime);
              clipGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.03);
              setTimeout(() => {
                try {
                  source.stop();
                } catch {
                  // Déjà arrêté
                }
              }, 35);
            } catch {
              try {
                source.stop();
              } catch {
                // Déjà arrêté
              }
            }
          },
        };
      }
    } catch {
      // Échec de chargement MP3, repli sur le synthétiseur ci-dessous
    }
  }

  // 2. Repli : Synthétiseur Web Audio harmonique (Lead + Sub bass)
  const melody = audioConfig.melody;
  const instrument = audioConfig.instrument;
  const nodes: { stop: () => void }[] = [];
  let noteTime = startTime;
  let noteIdx = 0;

  while (noteTime < startTime + playDuration && melody.length > 0) {
    const item = melody[noteIdx % melody.length];
    const loopPass = Math.floor(noteIdx / melody.length);
    const dur = item.duration;
    const freq = noteToFrequency(item.note, item.octave);

    const timeLeft = startTime + playDuration - noteTime;
    if (timeLeft <= 0.02) break;

    const effectiveDur = Math.min(dur, timeLeft);

    if (freq > 0) {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      if (instrument === 'chiptune') {
        osc.type = 'square';
      } else if (instrument === 'synth') {
        osc.type = 'sawtooth';
      } else if (instrument === 'piano' || instrument === 'guitar') {
        osc.type = 'triangle';
      } else if (instrument === 'bell') {
        osc.type = 'sine';
      } else {
        osc.type = 'sine';
      }

      osc.frequency.setValueAtTime(freq, noteTime);

      const attackTime = Math.min(0.04, effectiveDur * 0.2);
      noteGain.gain.setValueAtTime(0.001, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.28, noteTime + attackTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + effectiveDur);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + effectiveDur);
      nodes.push(osc);

      // Harmoniques pour les boucles avancées
      if (loopPass > 0 && freq > 65) {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = instrument === 'chiptune' ? 'triangle' : 'sine';
        subOsc.frequency.setValueAtTime(freq / 2, noteTime);

        subGain.gain.setValueAtTime(0.001, noteTime);
        subGain.gain.linearRampToValueAtTime(0.12, noteTime + attackTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, noteTime + effectiveDur);

        subOsc.connect(subGain);
        subGain.connect(masterGain);

        subOsc.start(noteTime);
        subOsc.stop(noteTime + effectiveDur);
        nodes.push(subOsc);
      }
    }

    noteTime += dur;
    noteIdx++;
  }

  return {
    isOfficialClip: false,
    stop: () => {
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch {
          // Déjà arrêté
        }
      });
    },
  };
}
