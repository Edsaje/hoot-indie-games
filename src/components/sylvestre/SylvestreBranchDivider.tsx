import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { SylvestreLeaf } from './SylvestreLeaf';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';

interface SylvestreBranchDividerProps {
  className?: string;
  withLeaves?: boolean;
  glow?: 'emerald' | 'amber' | 'none';
}

interface LeafKey {
  id: string;
  note: string;
  freq: number;
  left: string;
  top: string;
  variant: 'emerald' | 'moss' | 'gold' | 'amber' | 'ivy';
  size: number;
  rotation: number;
  flip?: boolean;
}

const LEAF_KEYS: LeafKey[] = [
  { id: 'leaf-c', note: 'Do', freq: 523.25, left: '26%', top: '-6px', variant: 'emerald', size: 19, rotation: -25 },
  { id: 'leaf-d', note: 'Ré', freq: 587.33, left: '33%', top: '-2px', variant: 'moss', size: 15, rotation: 15 },
  { id: 'leaf-e', note: 'Mi', freq: 659.25, left: '40%', top: '-9px', variant: 'emerald', size: 19, rotation: -12 },
  { id: 'leaf-f', note: 'Fa', freq: 698.46, left: '47%', top: '-11px', variant: 'ivy', size: 16, rotation: 20 },
  { id: 'leaf-g', note: 'Sol', freq: 783.99, left: '54%', top: '-8px', variant: 'emerald', size: 19, rotation: -8 },
  { id: 'leaf-a', note: 'La', freq: 880.0, left: '61%', top: '7px', variant: 'moss', size: 17, rotation: 70 },
  { id: 'leaf-b', note: 'Si', freq: 987.77, left: '68%', top: '5px', variant: 'gold', size: 14, rotation: 85 },
];

export const SylvestreBranchDivider: React.FC<SylvestreBranchDividerProps> = ({
  className = '',
  withLeaves = true,
  glow = 'emerald',
}) => {
  let unlockAchievement: ((id: string) => void) | undefined;
  try {
    const ach = useAchievements();
    unlockAchievement = ach.unlockAchievement;
  } catch {
    // Graceful fallback outside provider
  }

  const [activeNotePopup, setActiveNotePopup] = useState<{ id: string; note: string } | null>(null);
  const [easterEggUnlocked, setEasterEggUnlocked] = useState<boolean>(false);
  const playedNotesRef = useRef<string[]>([]);
  const clearPopupTimeoutRef = useRef<number | null>(null);

  const checkMelody = (notes: string[]): boolean => {
    // Join last 7 notes with hyphen
    const seq = notes.slice(-7).join('-');
    const patterns = [
      'Do-Mi-Sol-Sol', // Dans la forêt...
      'Do-Mi-Sol-Sol-Sol',
      'Do-Mi-Sol-Sol-La-Sol',
      'Sol-Mi-Sol-Mi', // Coucou, hibou !
      'Sol-Mi-Sol',
      'Do-Mi-Sol',
    ];
    return patterns.some((p) => seq.endsWith(p));
  };

  const handleLeafClick = (leaf: LeafKey) => {
    soundFx.playLeafNote(leaf.freq);

    // Visual note badge popup
    setActiveNotePopup({ id: leaf.id, note: leaf.note });
    if (clearPopupTimeoutRef.current) {
      window.clearTimeout(clearPopupTimeoutRef.current);
    }
    clearPopupTimeoutRef.current = window.setTimeout(() => {
      setActiveNotePopup(null);
    }, 850);

    // Track note sequence
    playedNotesRef.current = [...playedNotesRef.current.slice(-10), leaf.note];

    // Check for "Coucou Hibou"
    if (checkMelody(playedNotesRef.current)) {
      soundFx.playCoucouHibouJingle();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#10b981', '#34d399', '#fbbf24', '#fef08a'],
      });

      if (unlockAchievement) {
        unlockAchievement('sylvestre_foliage_piano');
      }

      setEasterEggUnlocked(true);
      playedNotesRef.current = [];
      setTimeout(() => {
        setEasterEggUnlocked(false);
      }, 7000);
    }
  };

  return (
    <div className={`relative w-full flex items-center justify-center my-6 select-none ${className}`}>
      {/* Floating Easter Egg Discovery Banner */}
      {easterEggUnlocked && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 border border-amber-400/70 rounded-2xl shadow-2xl text-xs font-black text-amber-300 animate-in zoom-in-95 fade-in duration-300 whitespace-nowrap">
          <span className="text-xl animate-bounce">🦉</span>
          <div>
            <p className="text-amber-200 text-xs">
              Mélodie de "Coucou Hibou" débloquée !
            </p>
            <p className="text-[10px] text-emerald-300 font-bold">
              Le piano végétal s’anime • +30 Plumes Dorées de Sylvestre 🪶
            </p>
          </div>
        </div>
      )}

      {/* Central Branch Graphic */}
      <div className="relative w-full max-w-4xl h-7 flex items-center justify-center">
        <svg
          viewBox="0 0 800 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Wood bark gradient */}
            <linearGradient id="branchWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1f1612" stopOpacity="0" />
              <stop offset="15%" stopColor="#3d281a" />
              <stop offset="35%" stopColor="#5c3c26" />
              <stop offset="50%" stopColor="#7a4f32" />
              <stop offset="65%" stopColor="#5c3c26" />
              <stop offset="85%" stopColor="#3d281a" />
              <stop offset="100%" stopColor="#1f1612" stopOpacity="0" />
            </linearGradient>

            {/* Moss highlight gradient */}
            <linearGradient id="branchMossGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="25%" stopColor="#047857" stopOpacity="0" />
              <stop offset="40%" stopColor="#059669" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#059669" stopOpacity="0.7" />
              <stop offset="75%" stopColor="#047857" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Shadow line */}
          <path
            d="M0 16 Q200 13 400 16 Q600 19 800 16"
            stroke="#0b0806"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Main wooden branch with organic knots */}
          <path
            d="M20 14 C120 12 250 16 380 13 C410 12 430 11 460 14 C580 17 700 13 780 14"
            stroke="url(#branchWoodGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Upper branch bark highlight */}
          <path
            d="M60 13 C180 11 310 14 420 12 C520 14 660 12 740 13"
            stroke="#94633f"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Moss cushions on top of the branch */}
          <path
            d="M320 11 Q350 9 380 11 Q410 8 440 11 Q470 9 500 11"
            stroke="url(#branchMossGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Tiny knotted twigs */}
          <path
            d="M260 14 Q275 8 290 6"
            stroke="#5c3c26"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M510 14 Q530 20 545 22"
            stroke="#5c3c26"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M390 12 Q395 5 405 3"
            stroke="#5c3c26"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        {/* Central enchanted gemstone / owl crest node */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <div
            className={`w-3.5 h-3.5 rotate-45 rounded-sm border ${
              glow === 'amber'
                ? 'bg-amber-500/80 border-amber-300 shadow-[0_0_10px_#f59e0b]'
                : glow === 'emerald'
                ? 'bg-emerald-500/80 border-emerald-300 shadow-[0_0_10px_#10b981]'
                : 'bg-[#3d281a] border-[#7a4f32]'
            }`}
          />
        </div>

        {/* 7 Musical Leaves forming the Living Forest Piano */}
        {withLeaves && (
          <>
            {LEAF_KEYS.map((leaf) => {
              const isPitched = activeNotePopup?.id === leaf.id;
              return (
                <div
                  key={leaf.id}
                  className="absolute transition-transform duration-150 active:scale-90"
                  style={{ left: leaf.left, top: leaf.top }}
                >
                  {/* Floating musical note popup */}
                  {isPitched && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
                      ♪ {leaf.note}
                    </div>
                  )}

                  <SylvestreLeaf
                    variant={leaf.variant}
                    size={leaf.size}
                    rotation={leaf.rotation}
                    flip={leaf.flip}
                    title={`Feuille sonore : ${leaf.note} • Cliquez pour jouer`}
                    className={`transition-all duration-200 hover:scale-125 ${
                      isPitched ? 'filter drop-shadow-[0_0_8px_#f59e0b]' : ''
                    }`}
                    onClick={() => handleLeafClick(leaf)}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
