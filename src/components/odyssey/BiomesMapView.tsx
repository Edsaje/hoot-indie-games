import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  Sparkles,
  Map,
  Droplets,
  Sword,
  Crown,
  Trees,
  Gamepad2,
  Gem,
  Mountain,
  Flame,
  ArrowRight,
  Star,
  Compass,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { OdysseySaveState, OdysseyBiomeId } from '../../types/odyssey';
import { ODYSSEY_BIOMES, ODYSSEY_ROUTES } from '../../data/odysseyData';
import {
  formatOdysseyNumber,
  switchBiome,
  switchRoute,
  unlockBiome,
  getCurrentBiome,
} from '../../services/odysseyEngineService';
import { getRouteMastery } from '../../data/odysseyRouteDex';
import { soundFx } from '../../utils/audio';

interface BiomesMapViewProps {
  state: OdysseySaveState;
  onStateChange: (newState: OdysseySaveState) => void;
  onBackToArena: () => void;
}

const getBiomeLucideIcon = (biomeId: OdysseyBiomeId) => {
  switch (biomeId) {
    case 'biome_1_clearing':
      return <Trees className="w-5 h-5 text-emerald-400" />;
    case 'biome_2_pixel_canopy':
      return <Gamepad2 className="w-5 h-5 text-cyan-400" />;
    case 'biome_3_crystal_caves':
      return <Gem className="w-5 h-5 text-purple-400" />;
    case 'biome_4_celestial_summit':
      return <Mountain className="w-5 h-5 text-sky-400" />;
    case 'biome_5_infernal_abyss':
      return <Flame className="w-5 h-5 text-rose-400" />;
    case 'biome_6_cosmic_void':
      return <Sparkles className="w-5 h-5 text-amber-400" />;
    default:
      return <Map className="w-5 h-5 text-amber-400" />;
  }
};

type MapDisplayMode = 'world' | 'routes';

export const BiomesMapView: React.FC<BiomesMapViewProps> = ({
  state,
  onStateChange,
  onBackToArena,
}) => {
  // Mode d'affichage : Vue globale (Atlas des 6 Mondes) ou Sentier local des 5 Routes
  const [displayMode, setDisplayMode] = useState<MapDisplayMode>('routes');
  // Biome sélectionné pour inspecter son sentier de routes
  const [inspectedBiomeId, setInspectedBiomeId] = useState<OdysseyBiomeId>(state.currentBiomeId);

  const inspectedBiome = getCurrentBiome(inspectedBiomeId);
  const currentBiome = getCurrentBiome(state.currentBiomeId);

  const handleTravelToRoute = (biomeId: OdysseyBiomeId, routeNumber: number) => {
    soundFx.playClick();
    let next = state;
    if (state.currentBiomeId !== biomeId) {
      next = switchBiome(next, biomeId);
    }
    next = switchRoute(next, routeNumber);
    onStateChange(next);
    onBackToArena();
  };

  const handleUnlock = (biomeId: OdysseyBiomeId) => {
    const { success, nextState } = unlockBiome(state, biomeId);
    if (success) {
      soundFx.playVictory();
      setInspectedBiomeId(biomeId);
      onStateChange(nextState);
    } else {
      soundFx.playError();
    }
  };

  const routesForInspectedBiome = ODYSSEY_ROUTES.filter((r) => r.biomeId === inspectedBiomeId);
  const maxRouteUnlockedInInspected = state.highestRouteUnlocked[inspectedBiomeId] || 1;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-in fade-in duration-300">
      {/* 1. Header Carte & Navigation */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#06241b]/95 border border-[#78350f] backdrop-blur-md mb-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Compass className="w-6 h-6 text-amber-300 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
              <span>Carte Interactive du Monde</span>
            </h2>
            <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 mt-0.5">
              <span>📍 Actuellement :</span>
              <strong className="text-amber-400 font-bold">{currentBiome.name}</strong>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">Route {state.currentRouteNumber}</span>
            </p>
          </div>
        </div>

        {/* Boutons d'Action & Bascule de Mode */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10 font-mono text-xs">
            <button
              onClick={() => {
                soundFx.playClick();
                setDisplayMode('routes');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                displayMode === 'routes'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sentier des Routes</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setDisplayMode('world');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                displayMode === 'world'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Atlas des 6 Mondes</span>
            </button>
          </div>

          <button
            onClick={onBackToArena}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sword className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Retour Combat</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          MODE 1 : LE SENTIER INTERACTIF DES ROUTES (Vue Micro / Exploration)
          ------------------------------------------------------------- */}
      {displayMode === 'routes' && (
        <div className="w-full flex flex-col gap-4">
          {/* Bandeau Sélecteur de Biome Débloqué */}
          <div className="w-full p-2.5 rounded-2xl bg-[#03150f]/90 border border-emerald-500/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 px-2 flex items-center gap-1.5">
              <span>Choisir le Biome :</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {ODYSSEY_BIOMES.map((b) => {
                const isUnlocked = b.index <= state.highestBiomeUnlocked;
                const isInspected = b.id === inspectedBiomeId;
                const isCurrent = b.id === state.currentBiomeId;

                return (
                  <button
                    key={b.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      soundFx.playClick();
                      setInspectedBiomeId(b.id);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isInspected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black scale-102'
                        : isUnlocked
                        ? 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/60'
                        : 'bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed'
                    }`}
                  >
                    <span>{b.icon}</span>
                    <span className="hidden sm:inline">{b.name}</span>
                    <span className="sm:hidden">M{b.index}</span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                    )}
                    {!isUnlocked && <Lock className="w-2.5 h-2.5 text-slate-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* L'Arène Cartographique des Routes (Sentier relié) */}
          <div
            className={`relative w-full rounded-3xl border-2 ${inspectedBiome.borderColor} bg-gradient-to-b ${inspectedBiome.bgGradient} p-4 sm:p-7 shadow-2xl overflow-hidden`}
          >
            {/* Titre et Ambiance du Biome inspecté */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                  {getBiomeLucideIcon(inspectedBiome.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                      Monde {inspectedBiome.index} / 6
                    </span>
                    {inspectedBiome.id === state.currentBiomeId && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-slate-950 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                        <span>Biome Actif</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">{inspectedBiome.name}</h3>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-300 italic hidden sm:block max-w-sm text-right">
                {inspectedBiome.tagline}
              </div>
            </div>

            {/* Tracé Cartographique Sinueux des 5 Jalons */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-5 gap-3.5 sm:gap-2.5 my-2">
              {routesForInspectedBiome.map((route, idx) => {
                const isUnlocked = route.routeNumber <= maxRouteUnlockedInInspected;
                const isCurrent =
                  state.currentBiomeId === inspectedBiomeId &&
                  state.currentRouteNumber === route.routeNumber;
                const kills = (state.routeKills && state.routeKills[route.id]) || 0;
                const isQuotaReached = kills >= route.requiredKillsToAdvance;
                const mastery = getRouteMastery(route.id, state.capturedGames);

                return (
                  <div
                    key={route.id}
                    onClick={() => {
                      if (isUnlocked) {
                        handleTravelToRoute(inspectedBiomeId, route.routeNumber);
                      }
                    }}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 flex flex-col justify-between transition-all select-none ${
                      isCurrent
                        ? 'bg-black/85 border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-102 cursor-pointer'
                        : isUnlocked
                        ? 'bg-black/60 border-slate-700/80 hover:border-amber-400/80 hover:bg-black/75 cursor-pointer hover:scale-102 shadow-lg'
                        : 'bg-black/40 border-slate-900/90 text-slate-600 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {/* Badge Hibou Voyageur "Vous êtes ici" */}
                    {isCurrent && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black font-mono text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1 z-20 animate-bounce">
                        <span>🦉 Vous êtes ici</span>
                      </div>
                    )}

                    {/* En-tête Jalon */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-amber-300">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-200">
                            {route.isBossRoute ? 'Boss' : `Route ${route.routeNumber}`}
                          </span>
                        </div>

                        {route.isBossRoute ? (
                          <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/30">
                            <Crown className="w-4 h-4 text-rose-400" />
                          </div>
                        ) : mastery.isMastered ? (
                          <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center" title="Route maîtrisée à 100%">
                            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                          </div>
                        ) : isQuotaReached ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center" title="Accès suivant débloqué">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                        ) : !isUnlocked ? (
                          <Lock className="w-4 h-4 text-slate-600" />
                        ) : null}
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1 mb-1">
                        {route.name}
                      </h4>

                      <div className="text-[11px] font-mono text-slate-400">
                        {route.isBossRoute ? (
                          <span className="text-rose-300 font-bold flex items-center gap-1">
                            <span>Chrono 30s</span>
                          </span>
                        ) : (
                          <span>Niveau {route.monsterLevel}</span>
                        )}
                      </div>
                    </div>

                    {/* Statut de Chasse & Kills Persistants */}
                    <div className="mt-3 pt-2.5 border-t border-white/10">
                      {isUnlocked ? (
                        <div className="flex flex-col gap-1 text-[11px] font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Vaincus :</span>
                            <strong className="text-white font-black">{formatOdysseyNumber(kills)}</strong>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Pépites :</span>
                            <span className={mastery.isMastered ? 'text-amber-300 font-bold' : 'text-emerald-400'}>
                              {mastery.capturedCount}/{mastery.totalCount} ({mastery.percentage}%)
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTravelToRoute(inspectedBiomeId, route.routeNumber);
                            }}
                            className={`w-full mt-2 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-slate-800 hover:bg-slate-700 text-white hover:text-amber-300 border border-slate-600'
                            }`}
                          >
                            <span>{isCurrent ? 'En combat' : 'Combattre ici'}</span>
                            {!isCurrent && <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <div className="py-2 text-center text-[10px] font-mono text-slate-500 italic flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Battez la Route {route.routeNumber - 1}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Légende du Sentier */}
            <div className="relative z-10 mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Maîtrise (100% Pépites = +15% Sève)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Quota de passage validé</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-rose-400" />
                  <span>Boss du Biome (R5)</span>
                </span>
              </div>

              <div className="text-[11px] text-amber-300 font-bold">
                💡 Cliquez sur n’importe quelle route débloquée pour vous y téléporter instantanément.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODE 2 : L'ATLAS DES 6 MONDES (Vue Macro / Périple Spatial)
          ------------------------------------------------------------- */}
      {displayMode === 'world' && (
        <div className="w-full flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ODYSSEY_BIOMES.map((biome) => {
              const isUnlocked = biome.index <= state.highestBiomeUnlocked;
              const isCurrent = state.currentBiomeId === biome.id;
              const canUnlock =
                biome.index === state.highestBiomeUnlocked + 1 &&
                state.starSap >= biome.unlockRequirement.starSapCost;
              const isNextToUnlock = biome.index === state.highestBiomeUnlocked + 1;
              const maxRouteInBiome = state.highestRouteUnlocked[biome.id] || 1;

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
                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                          {getBiomeLucideIcon(biome.id)}
                        </div>
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

                  {/* Actions & Sentier */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      {isUnlocked ? (
                        `Routes franchies : ${maxRouteInBiome}/5`
                      ) : (
                        <>
                          <span>Coût :</span>
                          <Droplets className="w-3 h-3 text-cyan-400" />
                          <span>{formatOdysseyNumber(biome.unlockRequirement.starSapCost)} Sève</span>
                        </>
                      )}
                    </span>

                    <div className="flex items-center gap-2">
                      {isUnlocked ? (
                        <>
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setInspectedBiomeId(biome.id);
                              setDisplayMode('routes');
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Voir le Sentier</span>
                          </button>

                          <button
                            disabled={isCurrent}
                            onClick={() => handleTravelToRoute(biome.id, 1)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-transform flex items-center gap-1 cursor-pointer shadow-md ${
                              isCurrent
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-default'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/20'
                            }`}
                          >
                            <span>{isCurrent ? 'En cours' : 'Voyager'}</span>
                            {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                          </button>
                        </>
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
