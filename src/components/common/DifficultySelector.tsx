import React from 'react';
import { soundFx } from '../../utils/audio';

export type GameDifficulty = 'novice' | 'standard' | 'expert';

interface DifficultySelectorProps {
  difficulty: GameDifficulty;
  onSelect: (diff: GameDifficulty) => void;
  disabled?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  difficulty,
  onSelect,
  disabled = false,
}) => {
  const options: Array<{ id: GameDifficulty; label: string; icon: string; desc: string }> = [
    { id: 'novice', label: 'Chouetteau', icon: '🐣', desc: 'Détente & indices généreux' },
    { id: 'standard', label: 'Hibou', icon: '🦉', desc: 'Expérience équilibrée standard' },
    { id: 'expert', label: 'Grand-Duc', icon: '🦅', desc: 'Défi expert & essais réduits' },
  ];

  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-[#131a29] border border-[#1e293b] rounded-2xl max-w-sm mx-auto mb-4 select-none">
      {options.map((opt) => {
        const active = difficulty === opt.id;
        return (
          <button
            key={opt.id}
            disabled={disabled}
            onClick={() => {
              soundFx.playClick();
              onSelect(opt.id);
            }}
            title={opt.desc}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              active
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-102'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
