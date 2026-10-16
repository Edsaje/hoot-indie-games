import type { SoundSynthesisConfig } from '../data/blindtestPuzzles';

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
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
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
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
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
    // Libération immédiate du buffer brut pour économiser la RAM
    rawBufferCache.delete(url);

    // Limitation du cache décodé à 5 entrées max (FIFO)
    if (decodedBufferCache.size >= 5) {
      const oldestKey = decodedBufferCache.keys().next().value;
      if (oldestKey) {
        decodedBufferCache.delete(oldestKey);
      }
    }
    decodedBufferCache.set(url, decoded);
    return decoded;
  } catch (err) {
    console.warn(`[BlindTestAudio] Décodage échoué pour ${url}:`, err);
    return null;
  }
}

export class BlindTestAudioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlindTestAudioError';
  }
}

export interface PlayBlindTestOptions {
  ctx: AudioContext;
  audioUrl?: string;
  audioConfig?: SoundSynthesisConfig;
  playDuration: number;
  masterGain: GainNode;
}

export interface PlayBlindTestHandle {
  stop: () => void;
  isOfficialClip: boolean;
  startTime: number;
}

/**
 * Joue l'extrait musical officiel MP3 du jeu sélectionné.
 * Règle 0 Hallucination : si le fichier ne peut pas être lu, aucune mélodie inventée n'est jouée.
 */
export async function playBlindTestAudioClip({
  ctx,
  audioUrl,
  playDuration,
  masterGain,
}: PlayBlindTestOptions): Promise<PlayBlindTestHandle> {
  const startTime = ctx.currentTime + 0.04;

  if (!audioUrl) {
    throw new BlindTestAudioError("Aucun extrait audio officiel n'est disponible pour ce jeu.");
  }

  const buffer = await getOrDecodeAudioBuffer(ctx, audioUrl);
  if (!buffer) {
    throw new BlindTestAudioError("Impossible de charger la piste audio officielle (erreur réseau ou fichier introuvable).");
  }

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
    startTime,
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
