import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  Lock,
  Crown,
  FastForward,
  Droplets,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';
import type { OdysseySaveState, OdysseyBiomeId } from '../../types/odyssey';
import { ODYSSEY_BIOMES, ODYSSEY_ROUTES } from '../../data/odysseyData';
import {
  formatOdysseyNumber,
  switchBiome,
  switchRoute,
  unlockBiome,
  getCurrentBiome,
  saveOdysseyState,
} from '../../services/odysseyEngineService';
import { getRouteMastery } from '../../data/odysseyRouteDex';
import { soundFx } from '../../utils/audio';

interface OdysseyRouteBurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  state: OdysseySaveState;
  onStateChange: (newState: OdysseySaveState) => void;
}

export const OdysseyRouteBurgerMenu: React.FC<OdysseyRouteBurgerMenuProps> = ({
  isOpen,
  onClose,
  state,
  onStateChange,
}) => {
  const [selectedBiomeId, setSelectedBiomeId] = useState<OdysseyBiomeId>(state.currentBiomeId);

  // Synchronisation du biome sélectionné à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setSelectedBiomeId(state.currentBiomeId);
    }
  }, [isOpen, state.currentBiomeId]);

  // Fermeture par touche Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedBiome = getCurrentBiome(selectedBiomeId);
  const routesForBiome = ODYSSEY_ROUTES.filter((r) => r.biomeId === selectedBiomeId);
  const maxRouteUnlocked = state.highestRouteUnlocked[selectedBiomeId] || 1;

  const handleSelectRoute = (routeNumber: number) => {
    if (routeNumber > maxRouteUnlocked) {
      soundFx.playError();
      return;
    }
    soundFx.playClick();
    let next = state;
    if (state.currentBiomeId !== selectedBiomeId) {
      next = switchBiome(next, selectedBiomeId);
    }
    next = switchRoute(next, routeNumber);
    saveOdysseyState(next);
    onStateChange(next);
    onClose();
  };

  const handleUnlockBiome = (biomeId: OdysseyBiomeId) => {
    const { success, nextState } = unlockBiome(state, biomeId);
    if (success) {
      soundFx.playVictory();
      setSelectedBiomeId(biomeId);
      saveOdysseyState(nextState);
      onStateChange(nextState);
    } else {
      soundFx.playError();
    }
  };

  const handleToggleAutoAdvance = (checked: boolean) => {
    soundFx.playClick();
    const nextState = { ...state, autoAdvance: checked };
    saveOdysseyState(nextState);
    onStateChange(nextState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      {/* Arrière-plan avec flou */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Tiroir Modal Mobile-First */}
      <div className="relative w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] bg-[#03150f] border-t-2 sm:border-2 border-[#78350f] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-200">
        {/* Header avec bouton fermer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-emerald-950/80 bg-[#06241b]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Changer de Route</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  R{state.currentRouteNumber} active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Téléportation rapide vers n'importe quelle route débloquée
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Fermer le menu des routes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Sélecteur horizontal des 6 Biomes */}
        <div className="p-3 sm:p-4 border-b border-emerald-950/60 bg-[#02100a]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
            1. Choisissez un Royaume Sylvestre
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {ODYSSEY_BIOMES.map((b) => {
              const isUnlocked = b.index <= state.highestBiomeUnlocked;
              const isSelected = b.id === selectedBiomeId;
              const isCurrent = b.id === state.currentBiomeId;

              return (
                <button
                  key={b.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedBiomeId(b.id);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                      : isUnlocked
                      ? 'bg-slate-900/90 text-slate-300 hover:text-white border-white/10 hover:bg-slate-800'
                      : 'bg-slate-950/60 text-slate-600 border-white/5 opacity-75'
                  }`}
                >
                  {isUnlocked ? (
                    <span className="text-[10px] font-mono">{b.index}.</span>
                  ) : (
                    <Lock className="w-3 h-3 text-slate-500" />
                  )}
                  <span>{b.name.replace(/^(La |Le |Les )/, '')}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Liste des 5 Routes du biome sélectionné */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 scrollbar-thin">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
            <span>2. Routes de {selectedBiome.name}</span>
            <span>Progression : {maxRouteUnlocked}/5</span>
          </div>

          {/* Si le biome est verrouillé, proposer de le débloquer */}
          {selectedBiome.index > state.highestBiomeUnlocked ? (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">{selectedBiome.name} est scellé</h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Coût de déverrouillage : {formatOdysseyNumber(selectedBiome.unlockRequirement.starSapCost)} Sève Cosmique
                </p>
              </div>

              {selectedBiome.index === state.highestBiomeUnlocked + 1 ? (
                <button
                  disabled={state.starSap < selectedBiome.unlockRequirement.starSapCost}
                  onClick={() => handleUnlockBiome(selectedBiome.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                    state.starSap >= selectedBiome.unlockRequirement.starSapCost
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:brightness-110 active:scale-95'
                      : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Débloquer ce Royaume</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-600">
                  Débloquez d'abord le Monde {selectedBiome.index - 1}
                </span>
              )}
            </div>
          ) : (
            routesForBiome.map((route) => {
              const rNum = route.routeNumber;
              const isBoss = route.isBossRoute;
              const isUnlocked = rNum <= maxRouteUnlocked;
              const isCurrent =
                state.currentBiomeId === selectedBiomeId && state.currentRouteNumber === rNum;
              const kills = (state.routeKills && state.routeKills[route.id]) || 0;
              const mastery = getRouteMastery(route.id, state.capturedGames);

              return (
                <div
                  key={route.id}
                  onClick={() => isUnlocked && handleSelectRoute(rNum)}
                  className={`w-full p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-400/80 shadow-lg shadow-amber-500/10'
                      : isUnlocked
                      ? 'bg-[#06241b]/80 border-white/10 hover:border-amber-500/40 hover:bg-[#06241b] cursor-pointer active:scale-[0.99]'
                      : 'bg-slate-950/60 border-slate-900 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Côté Gauche : Badge Route & Titre */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 border ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                          : isBoss
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                          : isUnlocked
                          ? 'bg-slate-900 text-slate-200 border-slate-700'
                          : 'bg-slate-950 text-slate-600 border-slate-900'
                      }`}
                    >
                      {isBoss ? (
                        <Crown className="w-5 h-5 text-amber-400" />
                      ) : (
                        <span>R{rNum}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-white truncate">
                          {route.name}
                        </h4>
                        {mastery.isMastered && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            ★ Maîtrisée
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                        <span>Lvl {route.monsterLevel}</span>
                        <span>•</span>
                        <span>PV de base : {formatOdysseyNumber(route.baseHp)}</span>
                        <span>•</span>
                        <span className={kills >= route.requiredKillsToAdvance ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          {kills}/{route.requiredKillsToAdvance} vaincus
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Côté Droit : Statut ou Bouton Rejoindre */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isCurrent ? (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-sm flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>En cours</span>
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRoute(rNum);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Rejoindre</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 text-slate-500 text-xs font-mono">
                        <Lock className="w-3 h-3" />
                        <span>Bloquée</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer avec option Auto-Progression & Solde Sève */}
        <div className="p-3 sm:p-4 bg-[#06241b] border-t border-emerald-950/80 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(state.autoAdvance)}
              onChange={(e) => handleToggleAutoAdvance(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-950 cursor-pointer accent-amber-500"
            />
            <span className="flex items-center gap-1.5">
              <FastForward className={`w-4 h-4 ${state.autoAdvance ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Auto-progression vers la route suivante</span>
            </span>
          </label>

          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 font-bold">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatOdysseyNumber(state.starSap)} Sève disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
};
