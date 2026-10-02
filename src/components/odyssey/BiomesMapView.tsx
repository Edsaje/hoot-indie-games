import React from 'react';
import {
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { OdysseySaveState, OdysseyBiomeId } from '../../types/odyssey';
import { ODYSSEY_BIOMES } from '../../data/odysseyData';
import {
  formatOdysseyNumber,
  switchBiome,
  unlockBiome,
} from '../../services/odysseyEngineService';
import { soundFx } from '../../utils/audio';

interface BiomesMapViewProps {
  state: OdysseySaveState;
  onStateChange: (newState: OdysseySaveState) => void;
  onBackToArena: () => void;
}

export const BiomesMapView: React.FC<BiomesMapViewProps> = ({
  state,
  onStateChange,
  onBackToArena,
}) => {
  const handleTravel = (biomeId: OdysseyBiomeId) => {
    soundFx.playClick();
    const next = switchBiome(state, biomeId);
    onStateChange(next);
    onBackToArena();
  };

  const handleUnlock = (biomeId: OdysseyBiomeId) => {
    const { success, nextState } = unlockBiome(state, biomeId);
    if (success) {
      soundFx.playVictory();
      onStateChange(nextState);
      onBackToArena();
    } else {
      soundFx.playError();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* 1. Header Carte */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#06241b]/95 border border-[#78350f] backdrop-blur-md mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
            🗺️
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Carte des Mondes & Biomes
            </h2>
            <p className="text-xs text-slate-300">
              Voyagez à travers les 6 régions sacrées de l’univers indépendant.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-cyan-300 font-bold">Sève Disponible</div>
            <div className="text-lg sm:text-2xl font-black font-mono text-cyan-400 flex items-center justify-end gap-1">
              <span>💧</span>
              <span>{formatOdysseyNumber(state.starSap)}</span>
            </div>
          </div>

          <button
            onClick={onBackToArena}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚔️</span>
            <span>Retour Combat</span>
          </button>
        </div>
      </div>

      {/* 2. Grille des 6 Biomes */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {ODYSSEY_BIOMES.map((biome) => {
          const isUnlocked = biome.index <= state.highestBiomeUnlocked;
          const isCurrent = state.currentBiomeId === biome.id;
          const canUnlock =
            biome.index === state.highestBiomeUnlocked + 1 &&
            state.starSap >= biome.unlockRequirement.starSapCost;
          const isNextToUnlock = biome.index === state.highestBiomeUnlocked + 1;

          return (
            <div
              key={biome.id}
              className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between shadow-2xl overflow-hidden bg-gradient-to-b ${
                biome.bgGradient
              } ${
                isCurrent
                  ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20'
                  : isUnlocked
                  ? 'border-[#78350f] hover:border-amber-500/60'
                  : 'border-slate-800/80 opacity-70'
              }`}
            >
              {/* Header Biome */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{biome.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                          Monde {biome.index} / 6
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-amber-500 text-slate-950">
                            Actuel
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">{biome.name}</h3>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-amber-200/90 font-medium italic mb-1">{biome.tagline}</p>
                <p className="text-xs text-slate-300/80 mb-4">{biome.description}</p>
              </div>

              {/* Bouton d'Action */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-slate-400">
                  {isUnlocked
                    ? `Routes franchies : ${state.highestRouteUnlocked[biome.id] || 1}/5`
                    : `Coût : 💧 ${formatOdysseyNumber(biome.unlockRequirement.starSapCost)}`}
                </span>

                {isUnlocked ? (
                  <button
                    disabled={isCurrent}
                    onClick={() => handleTravel(biome.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-transform flex items-center gap-1.5 cursor-pointer shadow-md ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/20'
                    }`}
                  >
                    <span>{isCurrent ? 'Exploration en cours' : 'Voyager'}</span>
                    {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                ) : isNextToUnlock ? (
                  <button
                    disabled={!canUnlock}
                    onClick={() => handleUnlock(biome.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-transform flex items-center gap-1.5 cursor-pointer shadow-md ${
                      canUnlock
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:scale-105 active:scale-95 shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <span>Débloquer</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500 italic">
                    Terminez le monde {biome.index - 1} d’abord
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
