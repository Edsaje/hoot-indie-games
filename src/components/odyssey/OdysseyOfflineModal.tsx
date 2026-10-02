import React from 'react';
import { Sparkles } from 'lucide-react';
import type { OfflineGainsSummary } from '../../types/odyssey';
import { formatOdysseyNumber } from '../../services/odysseyEngineService';
import { soundFx } from '../../utils/audio';

interface OdysseyOfflineModalProps {
  summary: OfflineGainsSummary;
  onClaim: () => void;
}

export const OdysseyOfflineModal: React.FC<OdysseyOfflineModalProps> = ({
  summary,
  onClaim,
}) => {
  const hours = Math.floor(summary.elapsedSeconds / 3600);
  const minutes = Math.floor((summary.elapsedSeconds % 3600) / 60);

  const durationStr =
    hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${Math.max(1, minutes)} minute(s)`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#06241b] border-2 border-[#78350f] text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/30 mb-4 animate-bounce">
          🌙
        </div>

        <h3 className="text-xl font-black text-white mb-1">
          De retour au Sanctuaire !
        </h3>
        <p className="text-xs text-slate-300 mb-5">
          Pendant votre repos ({durationStr}), vos chouettes et compagnons ont continué l’expédition sylvestre.
        </p>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 mb-6 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Monstres Vaincus</span>
            <span className="font-bold text-white">
              ~{formatOdysseyNumber(summary.monstersDefeatedEstimate)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Sève Récoltée</span>
            <span className="text-base font-black text-cyan-400 flex items-center gap-1">
              <span>💧</span>
              <span>+{formatOdysseyNumber(summary.starSapEarned)}</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playVictory();
            onClaim();
          }}
          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Récolter et Reprendre l’Odyssée</span>
        </button>
      </div>
    </div>
  );
};
