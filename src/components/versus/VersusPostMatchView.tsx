import React from 'react';
import { Trophy, Swords, Sparkles, RotateCcw } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import type { OpponentData } from './versusConstants';

interface VersusPostMatchViewProps {
  playerScore: number;
  opponentScore: number;
  opponent: OpponentData;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export const VersusPostMatchView: React.FC<VersusPostMatchViewProps> = ({
  playerScore,
  opponentScore,
  opponent,
  onRematch,
  onReturnToLobby,
}) => {
  const isVictory = playerScore > opponentScore;

  return (
    <div className="max-w-md mx-auto text-center py-10 px-6 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-2xl space-y-6">
      {isVictory ? (
        <>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1">
              Victoire Éclatante !
            </div>
            <h3 className="text-3xl font-black text-white">
              Score : {playerScore} - {opponentScore}
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Félicitations ! Vous avez terrassé {opponent.name} avec brio.
            </p>
          </div>

          <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl flex items-center justify-around text-xs">
            <div>
              <div className="text-[10px] uppercase text-slate-400">Plumes Gagnées</div>
              <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                +30
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Progression ELO</div>
              <div className="text-sm font-black text-emerald-400">+22</div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto shadow-xl">
            <Swords className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-black text-rose-400 uppercase tracking-wider mb-1">
              Défaite Honorable
            </div>
            <h3 className="text-3xl font-black text-white">
              Score : {playerScore} - {opponentScore}
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              {opponent.name} s'est montré plus rapide cette fois-ci.
            </p>
          </div>

          <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl flex items-center justify-around text-xs">
            <div>
              <div className="text-[10px] uppercase text-slate-400">Consolation</div>
              <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                +5 Plumes
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Progression ELO</div>
              <div className="text-sm font-black text-slate-400">-12</div>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => {
            soundFx.playClick();
            onRematch();
          }}
          className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Revanche
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            onReturnToLobby();
          }}
          className="flex-1 py-3 px-4 rounded-2xl bg-[#0b0f19] border border-[#1e293b] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          Retour au Salon
        </button>
      </div>
    </div>
  );
};
