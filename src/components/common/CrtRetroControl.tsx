import React, { useState } from 'react';
import { Tv, X, Sparkles, ChevronUp } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface CrtRetroControlProps {
  isActive: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export const CrtRetroControl: React.FC<CrtRetroControlProps> = ({
  isActive,
  onToggle,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => {
          soundFx.playClick();
          setIsMinimized(false);
        }}
        className={`fixed bottom-6 left-6 z-[60] flex items-center gap-2 p-2.5 rounded-2xl border-2 shadow-2xl backdrop-blur-md transition-all cursor-pointer group ${
          isActive
            ? 'bg-[#06241b] border-amber-500 text-amber-300 shadow-amber-500/20'
            : 'bg-[#0b0f19] border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
        }`}
        title="Ouvrir le panneau du Mode Rétro CRT Cathodique"
      >
        <Tv className={`w-4 h-4 ${isActive ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
        <span className="text-[11px] font-bold pr-1">
          CRT : {isActive ? 'ON' : 'OFF'}
        </span>
        <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-white" />
      </button>
    );
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-6 z-[60] flex items-center gap-3 bg-[#06241b] border-2 border-amber-500/70 rounded-2xl px-4 py-3 shadow-2xl shadow-amber-500/20 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md max-w-xs sm:max-w-sm"
    >
      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
        <Tv className="w-5 h-5 animate-pulse" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider text-amber-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Code Konami Débloqué</span>
        </div>
        <p className="text-xs font-bold text-white truncate">
          Mode Rétro CRT Cathodique
        </p>
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onToggle();
            }}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`} />
            <span>{isActive ? 'Désactiver CRT' : 'Activer CRT'}</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          soundFx.playClick();
          setIsMinimized(true);
        }}
        title="Réduire le panneau CRT"
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};
