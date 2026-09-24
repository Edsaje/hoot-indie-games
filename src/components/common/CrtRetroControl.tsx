import React from 'react';
import { Tv } from 'lucide-react';
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
  return (
    <button
      type="button"
      onClick={() => {
        soundFx.playClick();
        onToggle();
      }}
      className={`fixed bottom-6 left-6 z-[60] flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 shadow-2xl backdrop-blur-md transition-all cursor-pointer group active:scale-95 ${
        isActive
          ? 'bg-[#06241b] border-amber-500 text-amber-300 shadow-amber-500/25 hover:border-amber-400'
          : 'bg-[#0b0f19] border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
      }`}
      title={isActive ? 'Désactiver le Mode Rétro CRT' : 'Activer le Mode Rétro CRT'}
      aria-label="Mode Rétro CRT Cathodique"
    >
      <Tv className={`w-4 h-4 ${isActive ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
      <span className="text-xs font-black tracking-wide">
        CRT : {isActive ? 'ON' : 'OFF'}
      </span>
      <span
        className={`w-2 h-2 rounded-full ${
          isActive ? 'bg-amber-400 shadow-sm shadow-amber-400 animate-ping' : 'bg-slate-500'
        }`}
      />
    </button>
  );
};
