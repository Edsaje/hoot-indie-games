import { INDIE_GAMES } from './games';
import type { Game } from '../types/game';

export interface NoteEvent {
  note: string; // e.g. "C", "D#", "Eb", "F", "G", "A", "B", "REST"
  octave: number; // e.g. 3, 4, 5
  duration: number; // Duration in seconds (e.g. 0.25, 0.5)
}

export interface SoundSynthesisConfig {
  instrument: 'piano' | 'chiptune' | 'synth' | 'guitar' | 'bass' | 'bell';
  bpm: number;
  melody: NoteEvent[];
}

export interface BlindTestClue {
  labelFr: string;
  labelEn: string;
  valueFr: string;
  valueEn: string;
}

export interface BlindTestPuzzle {
  id: string;
  date?: string;
  targetGame: Game;
  trackTitle: string;
  composer: string;
  audioConfig: SoundSynthesisConfig;
  clues: BlindTestClue[];
}

// Convertit un nom de note en fréquence Hertz
export function noteToFrequency(note: string, octave: number): number {
  if (note === 'REST' || !note) return 0;

  const noteOrder: Record<string, number> = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
  };

  const semitone = noteOrder[note];
  if (semitone === undefined) return 440;

  // MIDI number: C4 est 60, A4 est 69 (440 Hz)
  const midi = 12 * (octave + 1) + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Durées de dévoilement progressif en secondes
export const AUDIO_UNLOCK_DURATIONS = [1.5, 3.0, 6.0, 11.0, 18.0];

interface CuratedOST {
  gameId: string;
  trackTitle: string;
  composer: string;
  instrument: 'piano' | 'chiptune' | 'synth' | 'guitar' | 'bass' | 'bell';
  bpm: number;
  melody: NoteEvent[];
}

// Bibliothèque de thèmes musicaux cultes indés (Arrangements complets 18-20 secondes)
const CURATED_OSTS: CuratedOST[] = [
  {
    gameId: 'undertale',
    trackTitle: 'Megalovania',
    composer: 'Toby Fox',
    instrument: 'chiptune',
    bpm: 120,
    melody: [
      // Phrase 1 (Ré / D)
      { note: 'D', octave: 4, duration: 0.15 },
      { note: 'D', octave: 4, duration: 0.15 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'A', octave: 4, duration: 0.35 },
      { note: 'Ab', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'F', octave: 4, duration: 0.3 },
      { note: 'D', octave: 4, duration: 0.15 },
      { note: 'F', octave: 4, duration: 0.15 },
      { note: 'G', octave: 4, duration: 0.25 },
      // Phrase 2 (Do / C)
      { note: 'C', octave: 4, duration: 0.15 },
      { note: 'C', octave: 4, duration: 0.15 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'A', octave: 4, duration: 0.35 },
      { note: 'Ab', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'F', octave: 4, duration: 0.3 },
      { note: 'D', octave: 4, duration: 0.15 },
      { note: 'F', octave: 4, duration: 0.15 },
      { note: 'G', octave: 4, duration: 0.25 },
      // Phrase 3 (Si / B)
      { note: 'B', octave: 3, duration: 0.15 },
      { note: 'B', octave: 3, duration: 0.15 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'A', octave: 4, duration: 0.35 },
      { note: 'Ab', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'F', octave: 4, duration: 0.3 },
      { note: 'D', octave: 4, duration: 0.15 },
      { note: 'F', octave: 4, duration: 0.15 },
      { note: 'G', octave: 4, duration: 0.25 },
      // Phrase 4 (Si bémol / Bb)
      { note: 'Bb', octave: 3, duration: 0.15 },
      { note: 'Bb', octave: 3, duration: 0.15 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'A', octave: 4, duration: 0.35 },
      { note: 'Ab', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'F', octave: 4, duration: 0.3 },
      { note: 'D', octave: 4, duration: 0.15 },
      { note: 'F', octave: 4, duration: 0.15 },
      { note: 'G', octave: 4, duration: 0.25 },
      // Phrase 5 (Octave haute D)
      { note: 'D', octave: 5, duration: 0.15 },
      { note: 'D', octave: 5, duration: 0.15 },
      { note: 'D', octave: 6, duration: 0.3 },
      { note: 'A', octave: 5, duration: 0.35 },
      { note: 'Ab', octave: 5, duration: 0.3 },
      { note: 'G', octave: 5, duration: 0.3 },
      { note: 'F', octave: 5, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.15 },
      { note: 'F', octave: 5, duration: 0.15 },
      { note: 'G', octave: 5, duration: 0.25 },
      // Phrase 6 (Octave haute C)
      { note: 'C', octave: 5, duration: 0.15 },
      { note: 'C', octave: 5, duration: 0.15 },
      { note: 'D', octave: 6, duration: 0.3 },
      { note: 'A', octave: 5, duration: 0.35 },
      { note: 'Ab', octave: 5, duration: 0.3 },
      { note: 'G', octave: 5, duration: 0.3 },
      { note: 'F', octave: 5, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.15 },
      { note: 'F', octave: 5, duration: 0.15 },
      { note: 'G', octave: 5, duration: 0.25 },
      // Phrase 7 (Octave haute B)
      { note: 'B', octave: 4, duration: 0.15 },
      { note: 'B', octave: 4, duration: 0.15 },
      { note: 'D', octave: 6, duration: 0.3 },
      { note: 'A', octave: 5, duration: 0.35 },
      { note: 'Ab', octave: 5, duration: 0.3 },
      { note: 'G', octave: 5, duration: 0.3 },
      { note: 'F', octave: 5, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.15 },
      { note: 'F', octave: 5, duration: 0.15 },
      { note: 'G', octave: 5, duration: 0.25 },
      // Phrase 8 (Octave haute Bb - Final)
      { note: 'Bb', octave: 4, duration: 0.15 },
      { note: 'Bb', octave: 4, duration: 0.15 },
      { note: 'D', octave: 6, duration: 0.3 },
      { note: 'A', octave: 5, duration: 0.35 },
      { note: 'Ab', octave: 5, duration: 0.3 },
      { note: 'G', octave: 5, duration: 0.3 },
      { note: 'F', octave: 5, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.15 },
      { note: 'F', octave: 5, duration: 0.15 },
      { note: 'D', octave: 5, duration: 0.6 },
    ],
  },
  {
    gameId: 'celeste',
    trackTitle: 'First Steps',
    composer: 'Lena Raine',
    instrument: 'piano',
    bpm: 95,
    melody: [
      // Phrase 1 (Motif principal)
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'E', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.6 },
      { note: 'F', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.8 },
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'E', octave: 5, duration: 0.6 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.8 },
      // Phrase 2 (Réponse mélancolique)
      { note: 'F', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'C', octave: 5, duration: 0.6 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.6 },
      { note: 'E', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'C', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'E', octave: 4, duration: 0.6 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'C', octave: 5, duration: 0.8 },
      // Phrase 3 (Envolée émotionnelle)
      { note: 'E', octave: 5, duration: 0.5 },
      { note: 'G', octave: 5, duration: 0.5 },
      { note: 'F', octave: 5, duration: 0.5 },
      { note: 'E', octave: 5, duration: 0.5 },
      { note: 'D', octave: 5, duration: 0.5 },
      { note: 'C', octave: 5, duration: 0.5 },
      { note: 'D', octave: 5, duration: 0.5 },
      { note: 'E', octave: 5, duration: 0.7 },
      { note: 'C', octave: 5, duration: 0.5 },
      { note: 'A', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.5 },
      { note: 'C', octave: 5, duration: 1.2 },
    ],
  },
  {
    gameId: 'hollow_knight',
    trackTitle: 'Dirtmouth (Town Theme)',
    composer: 'Christopher Larkin',
    instrument: 'piano',
    bpm: 80,
    melody: [
      // Phrase 1 (Arrivée au village)
      { note: 'D', octave: 4, duration: 0.6 },
      { note: 'F', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.6 },
      { note: 'D', octave: 5, duration: 0.8 },
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'Bb', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.8 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'F', octave: 4, duration: 0.4 },
      { note: 'E', octave: 4, duration: 0.6 },
      { note: 'D', octave: 4, duration: 1.0 },
      // Phrase 2 (Solitude du Chevalier)
      { note: 'D', octave: 4, duration: 0.5 },
      { note: 'E', octave: 4, duration: 0.4 },
      { note: 'F', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.6 },
      { note: 'Bb', octave: 4, duration: 0.4 },
      { note: 'C', octave: 5, duration: 0.5 },
      { note: 'D', octave: 5, duration: 0.7 },
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.5 },
      { note: 'F', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.5 },
      { note: 'C#', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 1.0 },
      // Phrase 3 (Le vent sur les ruines)
      { note: 'F', octave: 4, duration: 0.6 },
      { note: 'A', octave: 4, duration: 0.5 },
      { note: 'C', octave: 5, duration: 0.6 },
      { note: 'E', octave: 5, duration: 0.8 },
      { note: 'D', octave: 5, duration: 0.6 },
      { note: 'A', octave: 4, duration: 0.5 },
      { note: 'F', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.5 },
      { note: 'E', octave: 4, duration: 0.5 },
      { note: 'C', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.6 },
      { note: 'D', octave: 4, duration: 1.2 },
    ],
  },
  {
    gameId: 'outer_wilds',
    trackTitle: 'Timber Hearth',
    composer: 'Andrew Prahlow',
    instrument: 'guitar',
    bpm: 88,
    melody: [
      // Phrase 1 (Picking guitare au coin du feu)
      { note: 'G', octave: 3, duration: 0.5 },
      { note: 'B', octave: 3, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.8 },
      { note: 'F#', octave: 4, duration: 0.5 },
      { note: 'E', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.8 },
      { note: 'B', octave: 3, duration: 0.5 },
      { note: 'C', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 1.0 },
      // Phrase 2 (Sifflement pastoral)
      { note: 'E', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.5 },
      { note: 'B', octave: 4, duration: 0.6 },
      { note: 'A', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.5 },
      { note: 'E', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.8 },
      { note: 'B', octave: 3, duration: 0.5 },
      { note: 'A', octave: 3, duration: 0.5 },
      { note: 'G', octave: 3, duration: 1.0 },
      // Phrase 3 (Banjo rustique des âtriens)
      { note: 'G', octave: 3, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.5 },
      { note: 'B', octave: 3, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.8 },
      { note: 'F#', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.5 },
      { note: 'A', octave: 4, duration: 0.6 },
      { note: 'D', octave: 4, duration: 0.5 },
      { note: 'B', octave: 3, duration: 0.5 },
      { note: 'G', octave: 3, duration: 1.0 },
      // Phrase 4 (L'horizon étoilé)
      { note: 'C', octave: 4, duration: 0.5 },
      { note: 'E', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.6 },
      { note: 'F#', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.6 },
      { note: 'B', octave: 3, duration: 0.5 },
      { note: 'A', octave: 3, duration: 0.5 },
      { note: 'G', octave: 3, duration: 1.5 },
    ],
  },
  {
    gameId: 'shovel_knight',
    trackTitle: 'Strike the Earth!',
    composer: 'Jake Kaufman (virt)',
    instrument: 'chiptune',
    bpm: 140,
    melody: [
      // Phrase 1 (Charge héroïque)
      { note: 'E', octave: 4, duration: 0.2 },
      { note: 'G', octave: 4, duration: 0.2 },
      { note: 'B', octave: 4, duration: 0.2 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.2 },
      { note: 'B', octave: 4, duration: 0.2 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'E', octave: 4, duration: 0.2 },
      { note: 'G', octave: 4, duration: 0.2 },
      { note: 'A', octave: 4, duration: 0.2 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'E', octave: 5, duration: 0.8 },
      // Phrase 2 (Coup de pelle)
      { note: 'G', octave: 5, duration: 0.3 },
      { note: 'F#', octave: 5, duration: 0.2 },
      { note: 'E', octave: 5, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.2 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'E', octave: 5, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.2 },
      { note: 'A', octave: 4, duration: 0.2 },
      { note: 'B', octave: 4, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'E', octave: 5, duration: 0.8 },
      // Phrase 3 (Courage et bravoure)
      { note: 'C', octave: 5, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'G', octave: 5, duration: 0.4 },
      { note: 'F#', octave: 5, duration: 0.3 },
      { note: 'E', octave: 5, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'E', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'A', octave: 4, duration: 0.3 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'E', octave: 5, duration: 1.0 },
      // Phrase 4 (L'aventure continue)
      { note: 'E', octave: 5, duration: 0.2 },
      { note: 'G', octave: 5, duration: 0.2 },
      { note: 'B', octave: 5, duration: 0.4 },
      { note: 'A', octave: 5, duration: 0.3 },
      { note: 'G', octave: 5, duration: 0.3 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'E', octave: 5, duration: 1.2 },
    ],
  },
  {
    gameId: 'hotline_miami',
    trackTitle: 'Hydrogen',
    composer: 'M|O|O|N',
    instrument: 'synth',
    bpm: 128,
    melody: [
      // Bar 1 (Pulsion synthwave sombre)
      { note: 'C', octave: 3, duration: 0.2 },
      { note: 'C', octave: 3, duration: 0.2 },
      { note: 'Eb', octave: 3, duration: 0.2 },
      { note: 'G', octave: 3, duration: 0.2 },
      { note: 'Bb', octave: 3, duration: 0.2 },
      { note: 'G', octave: 3, duration: 0.2 },
      { note: 'C', octave: 4, duration: 0.4 },
      { note: 'Bb', octave: 3, duration: 0.2 },
      { note: 'Ab', octave: 3, duration: 0.4 },
      { note: 'G', octave: 3, duration: 0.4 },
      { note: 'F', octave: 3, duration: 0.4 },
      // Bar 2 (Groove néon)
      { note: 'C', octave: 3, duration: 0.2 },
      { note: 'C', octave: 3, duration: 0.2 },
      { note: 'Eb', octave: 3, duration: 0.2 },
      { note: 'G', octave: 3, duration: 0.2 },
      { note: 'Bb', octave: 3, duration: 0.2 },
      { note: 'G', octave: 3, duration: 0.2 },
      { note: 'Eb', octave: 4, duration: 0.3 },
      { note: 'D', octave: 4, duration: 0.3 },
      { note: 'C', octave: 4, duration: 0.3 },
      { note: 'Bb', octave: 3, duration: 0.3 },
      { note: 'G', octave: 3, duration: 0.4 },
      // Bar 3 (Lead synthétique perçant)
      { note: 'C', octave: 4, duration: 0.2 },
      { note: 'C', octave: 4, duration: 0.2 },
      { note: 'Eb', octave: 4, duration: 0.2 },
      { note: 'G', octave: 4, duration: 0.2 },
      { note: 'Bb', octave: 4, duration: 0.2 },
      { note: 'G', octave: 4, duration: 0.2 },
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'Bb', octave: 4, duration: 0.2 },
      { note: 'Ab', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'F', octave: 4, duration: 0.4 },
      // Bar 4 (Rythmique hypnotique)
      { note: 'C', octave: 4, duration: 0.2 },
      { note: 'Eb', octave: 4, duration: 0.2 },
      { note: 'F', octave: 4, duration: 0.2 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'Bb', octave: 4, duration: 0.3 },
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'C', octave: 5, duration: 0.3 },
      { note: 'Bb', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'C', octave: 4, duration: 0.8 },
      // Bar 5 (Montée frénétique)
      { note: 'Eb', octave: 4, duration: 0.2 },
      { note: 'G', octave: 4, duration: 0.2 },
      { note: 'Bb', octave: 4, duration: 0.3 },
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'Eb', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'C', octave: 4, duration: 1.0 },
    ],
  },
  {
    gameId: 'hades',
    trackTitle: 'No Escape',
    composer: 'Darren Korb',
    instrument: 'guitar',
    bpm: 110,
    melody: [
      // Riff 1 (Légende du Tartare)
      { note: 'A', octave: 3, duration: 0.3 },
      { note: 'C', octave: 4, duration: 0.3 },
      { note: 'D', octave: 4, duration: 0.3 },
      { note: 'Eb', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.3 },
      { note: 'C', octave: 4, duration: 0.3 },
      { note: 'A', octave: 3, duration: 0.8 },
      { note: 'G', octave: 3, duration: 0.3 },
      { note: 'A', octave: 3, duration: 0.6 },
      // Riff 2 (Ascension des Enfers)
      { note: 'A', octave: 3, duration: 0.3 },
      { note: 'D', octave: 4, duration: 0.3 },
      { note: 'E', octave: 4, duration: 0.3 },
      { note: 'F', octave: 4, duration: 0.5 },
      { note: 'E', octave: 4, duration: 0.3 },
      { note: 'D', octave: 4, duration: 0.3 },
      { note: 'C', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'Eb', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'A', octave: 3, duration: 0.8 },
      // Riff 3 (Le courroux de Zagréus)
      { note: 'E', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'C', octave: 5, duration: 0.5 },
      { note: 'B', octave: 4, duration: 0.3 },
      { note: 'A', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'E', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.3 },
      { note: 'Eb', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'A', octave: 3, duration: 0.8 },
      // Riff 4 (Climax électro-bouzouki)
      { note: 'A', octave: 3, duration: 0.2 },
      { note: 'C', octave: 4, duration: 0.2 },
      { note: 'D', octave: 4, duration: 0.3 },
      { note: 'Eb', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.3 },
      { note: 'C', octave: 4, duration: 0.3 },
      { note: 'A', octave: 3, duration: 0.4 },
      { note: 'C', octave: 4, duration: 0.3 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 1.2 },
    ],
  },
  {
    gameId: 'stardew_valley',
    trackTitle: 'Overture & Spring',
    composer: 'ConcernedApe',
    instrument: 'bell',
    bpm: 100,
    melody: [
      // Melody 1 (Matin paisible à la ferme)
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.6 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.8 },
      { note: 'E', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 1.0 },
      // Melody 2 (Brise printanière)
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.5 },
      { note: 'G', octave: 5, duration: 0.7 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.5 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.5 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.6 },
      { note: 'G', octave: 4, duration: 0.8 },
      // Melody 3 (Chants d'oiseaux de Pélican Ville)
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.5 },
      { note: 'D', octave: 5, duration: 0.6 },
      { note: 'E', octave: 5, duration: 0.5 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.5 },
      { note: 'B', octave: 4, duration: 0.5 },
      { note: 'A', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 1.2 },
      // Melody 4 (Récoltes dorées)
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.5 },
      { note: 'G', octave: 5, duration: 0.8 },
      { note: 'F#', octave: 5, duration: 0.4 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.6 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 1.4 },
    ],
  },
  {
    gameId: 'balatro',
    trackTitle: 'Main Theme (Chill Jazz)',
    composer: 'Louis F.',
    instrument: 'bass',
    bpm: 85,
    melody: [
      // Bar 1 (Groove de cartes feutré)
      { note: 'F', octave: 2, duration: 0.5 },
      { note: 'Ab', octave: 2, duration: 0.4 },
      { note: 'C', octave: 3, duration: 0.5 },
      { note: 'Eb', octave: 3, duration: 0.6 },
      { note: 'D', octave: 3, duration: 0.4 },
      { note: 'Db', octave: 3, duration: 0.4 },
      { note: 'C', octave: 3, duration: 0.8 },
      { note: 'Bb', octave: 2, duration: 0.5 },
      { note: 'F', octave: 2, duration: 0.9 },
      // Bar 2 (Walking bass nocturne)
      { note: 'F', octave: 2, duration: 0.4 },
      { note: 'G', octave: 2, duration: 0.4 },
      { note: 'Ab', octave: 2, duration: 0.4 },
      { note: 'A', octave: 2, duration: 0.4 },
      { note: 'Bb', octave: 2, duration: 0.5 },
      { note: 'C', octave: 3, duration: 0.4 },
      { note: 'D', octave: 3, duration: 0.4 },
      { note: 'Eb', octave: 3, duration: 0.5 },
      { note: 'F', octave: 3, duration: 0.6 },
      { note: 'Eb', octave: 3, duration: 0.4 },
      { note: 'C', octave: 3, duration: 0.5 },
      { note: 'Ab', octave: 2, duration: 0.8 },
      // Bar 3 (Mélange du paquet & Multiplicateur)
      { note: 'Db', octave: 3, duration: 0.4 },
      { note: 'F', octave: 3, duration: 0.5 },
      { note: 'Ab', octave: 3, duration: 0.5 },
      { note: 'G', octave: 3, duration: 0.4 },
      { note: 'F', octave: 3, duration: 0.4 },
      { note: 'Eb', octave: 3, duration: 0.5 },
      { note: 'C', octave: 3, duration: 0.5 },
      { note: 'Bb', octave: 2, duration: 0.4 },
      { note: 'Ab', octave: 2, duration: 0.4 },
      { note: 'G', octave: 2, duration: 0.4 },
      { note: 'F', octave: 2, duration: 1.0 },
      // Bar 4 (Jackpot)
      { note: 'C', octave: 3, duration: 0.4 },
      { note: 'Eb', octave: 3, duration: 0.4 },
      { note: 'F', octave: 3, duration: 0.6 },
      { note: 'Ab', octave: 3, duration: 0.6 },
      { note: 'G', octave: 3, duration: 0.4 },
      { note: 'F', octave: 3, duration: 0.5 },
      { note: 'Eb', octave: 3, duration: 0.4 },
      { note: 'C', octave: 3, duration: 0.5 },
      { note: 'F', octave: 2, duration: 1.5 },
    ],
  },
  {
    gameId: 'sea_of_stars',
    trackTitle: 'Mountain Trail',
    composer: 'Eric W. Brown',
    instrument: 'synth',
    bpm: 130,
    melody: [
      // Part 1 (Le chemin des guerriers du solstice)
      { note: 'D', octave: 4, duration: 0.3 },
      { note: 'F#', octave: 4, duration: 0.3 },
      { note: 'A', octave: 4, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.6 },
      { note: 'C#', octave: 5, duration: 0.3 },
      { note: 'B', octave: 4, duration: 0.3 },
      { note: 'A', octave: 4, duration: 0.6 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'F#', octave: 4, duration: 0.3 },
      { note: 'E', octave: 4, duration: 0.6 },
      { note: 'D', octave: 4, duration: 1.0 },
      // Part 2 (Ascension montagneuse)
      { note: 'E', octave: 4, duration: 0.3 },
      { note: 'F#', octave: 4, duration: 0.3 },
      { note: 'G', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'C#', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.6 },
      { note: 'E', octave: 5, duration: 0.6 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.5 },
      { note: 'F#', octave: 4, duration: 0.8 },
      // Part 3 (Panorama 16-bit)
      { note: 'F#', octave: 5, duration: 0.4 },
      { note: 'E', octave: 5, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'C#', octave: 5, duration: 0.3 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'F#', octave: 4, duration: 0.3 },
      { note: 'E', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'E', octave: 4, duration: 0.4 },
      { note: 'F#', octave: 4, duration: 0.6 },
      { note: 'D', octave: 4, duration: 1.2 },
      // Part 4 (L'éclipse s'illumine)
      { note: 'A', octave: 4, duration: 0.3 },
      { note: 'B', octave: 4, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'F#', octave: 5, duration: 0.6 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.5 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'D', octave: 5, duration: 1.5 },
    ],
  },
  {
    gameId: 'gris',
    trackTitle: 'Gris Theme',
    composer: 'Berlinist',
    instrument: 'piano',
    bpm: 72,
    melody: [
      // Phrase 1 (La douleur du silence)
      { note: 'F', octave: 4, duration: 0.8 },
      { note: 'A', octave: 4, duration: 0.8 },
      { note: 'C', octave: 5, duration: 0.8 },
      { note: 'E', octave: 5, duration: 1.2 },
      { note: 'D', octave: 5, duration: 0.6 },
      { note: 'C', octave: 5, duration: 0.6 },
      { note: 'A', octave: 4, duration: 1.4 },
      // Phrase 2 (Larmes d'aquarelle)
      { note: 'D', octave: 4, duration: 0.7 },
      { note: 'F', octave: 4, duration: 0.7 },
      { note: 'A', octave: 4, duration: 0.8 },
      { note: 'D', octave: 5, duration: 1.0 },
      { note: 'C', octave: 5, duration: 0.6 },
      { note: 'Bb', octave: 4, duration: 0.6 },
      { note: 'A', octave: 4, duration: 0.8 },
      { note: 'G', octave: 4, duration: 0.6 },
      { note: 'F', octave: 4, duration: 0.6 },
      { note: 'E', octave: 4, duration: 1.2 },
      // Phrase 3 (L'envol et la renaissance des couleurs)
      { note: 'F', octave: 4, duration: 0.7 },
      { note: 'G', octave: 4, duration: 0.6 },
      { note: 'A', octave: 4, duration: 0.7 },
      { note: 'C', octave: 5, duration: 0.9 },
      { note: 'F', octave: 5, duration: 1.2 },
      { note: 'E', octave: 5, duration: 0.7 },
      { note: 'D', octave: 5, duration: 0.7 },
      { note: 'C', octave: 5, duration: 0.8 },
      { note: 'A', octave: 4, duration: 0.8 },
      { note: 'G', octave: 4, duration: 0.7 },
      { note: 'F', octave: 4, duration: 1.5 },
    ],
  },
  {
    gameId: 'slay_the_spire',
    trackTitle: 'The Spire (Exordium Theme)',
    composer: 'Clark Aboud',
    instrument: 'synth',
    bpm: 90,
    melody: [
      { note: 'D', octave: 3, duration: 0.6 },
      { note: 'F', octave: 3, duration: 0.5 },
      { note: 'A', octave: 3, duration: 0.5 },
      { note: 'C', octave: 4, duration: 0.8 },
      { note: 'Bb', octave: 3, duration: 0.5 },
      { note: 'A', octave: 3, duration: 0.5 },
      { note: 'G', octave: 3, duration: 0.8 },
      { note: 'E', octave: 3, duration: 0.5 },
      { note: 'F', octave: 3, duration: 0.5 },
      { note: 'D', octave: 3, duration: 1.2 },
      { note: 'D', octave: 3, duration: 0.5 },
      { note: 'F', octave: 3, duration: 0.5 },
      { note: 'G#', octave: 3, duration: 0.6 },
      { note: 'A', octave: 3, duration: 0.8 },
      { note: 'D', octave: 4, duration: 1.0 },
      { note: 'C', octave: 4, duration: 0.5 },
      { note: 'A', octave: 3, duration: 0.6 },
      { note: 'F', octave: 3, duration: 0.6 },
      { note: 'D', octave: 3, duration: 1.5 },
    ],
  },
  {
    gameId: 'cuphead',
    trackTitle: 'Inkwell Isle One',
    composer: 'Kristofer Maddigan',
    instrument: 'piano',
    bpm: 130,
    melody: [
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'Bb', octave: 4, duration: 0.3 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.3 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'G', octave: 4, duration: 0.6 },
      { note: 'A', octave: 4, duration: 0.3 },
      { note: 'Bb', octave: 4, duration: 0.3 },
      { note: 'B', octave: 4, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.5 },
      { note: 'C', octave: 5, duration: 0.4 },
      { note: 'A', octave: 4, duration: 0.4 },
      { note: 'F#', octave: 4, duration: 0.6 },
      { note: 'D', octave: 4, duration: 0.6 },
      { note: 'G', octave: 4, duration: 0.3 },
      { note: 'B', octave: 4, duration: 0.3 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'G', octave: 5, duration: 0.8 },
      { note: 'E', octave: 5, duration: 0.4 },
      { note: 'D', octave: 5, duration: 0.4 },
      { note: 'B', octave: 4, duration: 0.5 },
      { note: 'G', octave: 4, duration: 1.2 },
    ],
  },
  {
    gameId: 'dead_cells',
    trackTitle: "Prisoner's Awakening",
    composer: 'Yoann Laulan',
    instrument: 'guitar',
    bpm: 115,
    melody: [
      { note: 'D', octave: 3, duration: 0.4 },
      { note: 'A', octave: 3, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.5 },
      { note: 'F', octave: 4, duration: 0.6 },
      { note: 'E', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.4 },
      { note: 'C', octave: 4, duration: 0.6 },
      { note: 'A', octave: 3, duration: 0.8 },
      { note: 'Bb', octave: 3, duration: 0.4 },
      { note: 'C', octave: 4, duration: 0.4 },
      { note: 'D', octave: 4, duration: 0.6 },
      { note: 'F', octave: 4, duration: 0.8 },
      { note: 'E', octave: 4, duration: 0.5 },
      { note: 'C#', octave: 4, duration: 0.6 },
      { note: 'D', octave: 4, duration: 1.2 },
      { note: 'G', octave: 4, duration: 0.5 },
      { note: 'F', octave: 4, duration: 0.5 },
      { note: 'E', octave: 4, duration: 0.5 },
      { note: 'D', octave: 4, duration: 1.5 },
    ],
  },
  {
    gameId: 'tunic',
    trackTitle: 'Memory of a Memory',
    composer: 'Lifeformed & Janice Kwan',
    instrument: 'synth',
    bpm: 80,
    melody: [
      { note: 'A', octave: 4, duration: 0.6 },
      { note: 'C#', octave: 5, duration: 0.6 },
      { note: 'E', octave: 5, duration: 0.8 },
      { note: 'A', octave: 5, duration: 1.0 },
      { note: 'G#', octave: 5, duration: 0.6 },
      { note: 'E', octave: 5, duration: 0.6 },
      { note: 'C#', octave: 5, duration: 0.8 },
      { note: 'F#', octave: 4, duration: 0.6 },
      { note: 'A', octave: 4, duration: 0.6 },
      { note: 'C#', octave: 5, duration: 0.8 },
      { note: 'B', octave: 4, duration: 1.0 },
      { note: 'G#', octave: 4, duration: 0.8 },
      { note: 'E', octave: 4, duration: 1.2 },
      { note: 'A', octave: 4, duration: 0.8 },
      { note: 'C#', octave: 5, duration: 0.8 },
      { note: 'E', octave: 5, duration: 1.0 },
      { note: 'A', octave: 5, duration: 1.8 },
    ],
  },
];

// Simple deterministic hash
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Mulberry32
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildClues(game: Game, composer: string): BlindTestClue[] {
  // Clue 1: Composer & Era window
  const minYear = Math.max(2005, game.releaseYear - 2);
  const maxYear = Math.min(new Date().getFullYear(), game.releaseYear + 2);
  const clue1: BlindTestClue = {
    labelFr: 'Compositeur & Période',
    labelEn: 'Composer & Era',
    valueFr: `${composer} • Sorti entre ${minYear} et ${maxYear}`,
    valueEn: `${composer} • Released between ${minYear} and ${maxYear}`,
  };

  // Clue 2: Genres & Camera
  const clue2: BlindTestClue = {
    labelFr: 'Genres & Perspective',
    labelEn: 'Genres & Camera',
    valueFr: `${game.genre.slice(0, 3).join(', ')} • ${game.camera.fr}`,
    valueEn: `${game.genre.slice(0, 3).join(', ')} • ${game.camera.en}`,
  };

  // Clue 3: Exact Year & Art Style
  const clue3: BlindTestClue = {
    labelFr: 'Année & Style Graphique',
    labelEn: 'Year & Art Style',
    valueFr: `${game.releaseYear} • ${game.artStyle.fr}`,
    valueEn: `${game.releaseYear} • ${game.artStyle.en}`,
  };

  // Clue 4: Developer Studio
  const clue4: BlindTestClue = {
    labelFr: 'Studio Développeur',
    labelEn: 'Developer Studio',
    valueFr: game.developer,
    valueEn: game.developer,
  };

  // Clue 5: Tagline
  const clue5: BlindTestClue = {
    labelFr: "Phrase d'accroche",
    labelEn: 'Tagline',
    valueFr: `« ${game.hints.tagline.fr} »`,
    valueEn: `"${game.hints.tagline.en}"`,
  };

  return [clue1, clue2, clue3, clue4, clue5];
}

/**
 * Crée ou extrait la composition sonore pour un jeu
 */
function createSoundtrackForGame(game: Game): {
  trackTitle: string;
  composer: string;
  audioConfig: SoundSynthesisConfig;
} {
  const curated = CURATED_OSTS.find((ost) => ost.gameId === game.id);
  if (curated) {
    return {
      trackTitle: curated.trackTitle,
      composer: curated.composer,
      audioConfig: {
        instrument: curated.instrument,
        bpm: curated.bpm,
        melody: curated.melody,
      },
    };
  }

  // Fallback mélodique procédural harmonique adapté au jeu (Suite cinématographique 19.3 secondes)
  const composer = game.hints.composer || `${game.developer} Sound Team`;
  const defaultMelody: NoteEvent[] = [
    // Phrase 1 (Thème mystère)
    { note: 'D', octave: 4, duration: 0.4 },
    { note: 'F', octave: 4, duration: 0.4 },
    { note: 'A', octave: 4, duration: 0.4 },
    { note: 'D', octave: 5, duration: 0.8 },
    { note: 'C', octave: 5, duration: 0.4 },
    { note: 'G', octave: 4, duration: 0.4 },
    { note: 'Bb', octave: 4, duration: 0.6 },
    { note: 'A', octave: 4, duration: 1.0 },
    // Phrase 2 (Ascension)
    { note: 'F', octave: 4, duration: 0.4 },
    { note: 'E', octave: 4, duration: 0.4 },
    { note: 'D', octave: 4, duration: 0.5 },
    { note: 'F', octave: 4, duration: 0.4 },
    { note: 'G', octave: 4, duration: 0.4 },
    { note: 'A', octave: 4, duration: 0.6 },
    { note: 'C', octave: 5, duration: 0.6 },
    { note: 'D', octave: 5, duration: 0.8 },
    { note: 'E', octave: 5, duration: 1.0 },
    // Phrase 3 (Variation dramatique)
    { note: 'F', octave: 5, duration: 0.5 },
    { note: 'E', octave: 5, duration: 0.4 },
    { note: 'D', octave: 5, duration: 0.5 },
    { note: 'C', octave: 5, duration: 0.5 },
    { note: 'Bb', octave: 4, duration: 0.6 },
    { note: 'A', octave: 4, duration: 0.6 },
    { note: 'G', octave: 4, duration: 0.5 },
    { note: 'F', octave: 4, duration: 0.5 },
    { note: 'E', octave: 4, duration: 0.8 },
    // Phrase 4 (Résolution grandiose)
    { note: 'D', octave: 4, duration: 0.4 },
    { note: 'F', octave: 4, duration: 0.4 },
    { note: 'G', octave: 4, duration: 0.4 },
    { note: 'A', octave: 4, duration: 0.6 },
    { note: 'D', octave: 5, duration: 1.0 },
    { note: 'C#', octave: 5, duration: 0.6 },
    { note: 'D', octave: 5, duration: 1.6 },
  ];

  return {
    trackTitle: `Thème Principal — ${game.title}`,
    composer,
    audioConfig: {
      instrument: 'synth',
      bpm: 110,
      melody: defaultMelody,
    },
  };
}

/**
 * Génère le puzzle Blind Test quotidien pour une date donnée
 */
export function getDailyBlindTestPuzzle(dateString: string): BlindTestPuzzle {
  const seed = stringToHash(`blindtest_puzzle_${dateString}`);
  const rand = mulberry32(seed);

  // 80% du temps, privilégier un des thèmes emblématiques composés
  const curatedIds = CURATED_OSTS.map((o) => o.gameId);
  const eligibleGames = INDIE_GAMES.filter((g) => curatedIds.includes(g.id));

  let targetGame: Game;
  if (eligibleGames.length > 0 && rand() < 0.85) {
    const idx = Math.floor(rand() * eligibleGames.length);
    targetGame = eligibleGames[idx];
  } else {
    const idx = Math.floor(rand() * INDIE_GAMES.length);
    targetGame = INDIE_GAMES[idx];
  }

  const ostData = createSoundtrackForGame(targetGame);
  const clues = buildClues(targetGame, ostData.composer);

  return {
    id: `blindtest_${dateString}`,
    date: dateString,
    targetGame,
    trackTitle: ostData.trackTitle,
    composer: ostData.composer,
    audioConfig: ostData.audioConfig,
    clues,
  };
}

/**
 * Génère un puzzle Blind Test aléatoire pour les parties d'entraînement
 */
export function getRandomBlindTestPuzzle(seedSuffix = Date.now().toString()): BlindTestPuzzle {
  const seed = stringToHash(`blindtest_rand_${seedSuffix}`);
  const rand = mulberry32(seed);

  const curatedIds = CURATED_OSTS.map((o) => o.gameId);
  const eligibleGames = INDIE_GAMES.filter((g) => curatedIds.includes(g.id));

  let targetGame: Game;
  if (eligibleGames.length > 0 && rand() < 0.85) {
    const idx = Math.floor(rand() * eligibleGames.length);
    targetGame = eligibleGames[idx];
  } else {
    const idx = Math.floor(rand() * INDIE_GAMES.length);
    targetGame = INDIE_GAMES[idx];
  }

  const ostData = createSoundtrackForGame(targetGame);
  const clues = buildClues(targetGame, ostData.composer);

  return {
    id: `blindtest_random_${seedSuffix}`,
    targetGame,
    trackTitle: ostData.trackTitle,
    composer: ostData.composer,
    audioConfig: ostData.audioConfig,
    clues,
  };
}
