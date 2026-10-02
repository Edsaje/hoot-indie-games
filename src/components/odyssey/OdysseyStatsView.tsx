import React from 'react';
import {
  BarChart3,
  Sword,
  Droplets,
  Crown,
  Sparkles,
  MousePointerClick,
  Zap,
  Target,
  Star,
  Lock,
  CheckCircle2,
  Award,
} from 'lucide-react';
import type { OdysseySaveState, OdysseyPlayerStats } from '../../types/odyssey';
import { ODYSSEY_BIOMES, ODYSSEY_ROUTES } from '../../data/odysseyData';
import { formatOdysseyNumber } from '../../services/odysseyEngineService';
import { getRouteMastery } from '../../data/odysseyRouteDex';

interface OdysseyStatsViewProps {
  state: OdysseySaveState;
  playerStats: OdysseyPlayerStats;
}

export const OdysseyStatsView: React.FC<OdysseyStatsViewProps> = ({
  state,
  playerStats,
}) => {
  const capturedCount = Object.keys(state.capturedGames || {}).length;
  const holoCount = Object.values(state.capturedGames || {}).filter((g) => g.isHolo).length;
  const pokedexPercent = Math.round((capturedCount / 256) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. En-tête : Résumé Global */}
      <div className="w-full p-4 sm:p-6 rounded-3xl bg-[#06241b]/90 border border-[#78350f] shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-950 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Statistiques Célestes</span>
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Compte-rendu détaillé de votre épopée dans le sanctuaire des jeux indépendants.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs">
            <span className="text-slate-400">Biome actuel :</span>
            <span className="text-amber-400 font-bold">
              {ODYSSEY_BIOMES.find((b) => b.id === state.currentBiomeId)?.name || 'Inconnu'}
            </span>
          </div>
        </div>

        {/* Grille des Métriques Clés */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Sève Totale */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-emerald-900/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>Sève Récoltée</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-cyan-400">
              {formatOdysseyNumber(state.totalStarSapEarned)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Actuelle : {formatOdysseyNumber(state.starSap)}
            </div>
          </div>

          {/* Monstres Vaincus */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-emerald-900/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>Monstres Vaincus</span>
              <Sword className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-white">
              {formatOdysseyNumber(state.stats.monstersDefeated)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Dont {state.stats.bossesDefeated} Boss
            </div>
          </div>

          {/* Pokédex Pépites */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-emerald-900/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>Pépites Liées</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-300">
              {capturedCount} <span className="text-xs text-slate-400">/ 256</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              {pokedexPercent}% du Pokédex
            </div>
          </div>

          {/* Pépites Holographiques */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-emerald-900/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>Holographiques</span>
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-cyan-300">
              {holoCount}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Rareté Shiny (1/1024)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Statistiques d'Efficacité au Combat */}
      <div className="w-full p-4 sm:p-6 rounded-3xl bg-[#06241b]/90 border border-[#78350f] shadow-2xl backdrop-blur-md">
        <h3 className="text-sm font-black uppercase font-mono tracking-wider text-amber-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Puissance & Efficacité au Combat</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
              <span>Dégâts par Clic</span>
            </div>
            <div className="text-base font-black text-amber-300">
              {formatOdysseyNumber(playerStats.clickDamage)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>DPS Passif</span>
            </div>
            <div className="text-base font-black text-cyan-400">
              {formatOdysseyNumber(playerStats.passiveDps)}/s
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chance Critique</span>
            </div>
            <div className="text-base font-black text-emerald-400">
              {Math.round(playerStats.critChance * 100)}%
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Mult. Critique</span>
            </div>
            <div className="text-base font-black text-purple-300">
              x{playerStats.critMultiplier.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mult. Sève</span>
            </div>
            <div className="text-base font-black text-cyan-300">
              x{playerStats.sapMultiplier.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Registre de Chasse & Farming par Biome & Route */}
      <div className="w-full p-4 sm:p-6 rounded-3xl bg-[#06241b]/90 border border-[#78350f] shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 border-b border-emerald-950 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase font-mono tracking-wider text-amber-400 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Registre de Chasse & Farming par Route</span>
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Historique persistant des ennemis vaincus et de la maîtrise de chaque route.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {ODYSSEY_BIOMES.map((biome) => {
            const isBiomeUnlocked = biome.index <= state.highestBiomeUnlocked;
            const maxRouteUnlocked = state.highestRouteUnlocked[biome.id] || (isBiomeUnlocked ? 1 : 0);
            const routesForBiome = ODYSSEY_ROUTES.filter((r) => r.biomeId === biome.id);

            return (
              <div
                key={biome.id}
                className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                  isBiomeUnlocked
                    ? 'bg-black/40 border-emerald-900/60'
                    : 'bg-black/20 border-slate-900 opacity-60'
                }`}
              >
                {/* En-tête du Biome */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{biome.icon}</span>
                    <span className="font-bold text-sm text-white">{biome.name}</span>
                  </div>
                  {!isBiomeUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Lock className="w-3 h-3" />
                      <span>Verrouillé</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Actif</span>
                    </span>
                  )}
                </div>

                {/* Grille des Routes du Biome */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
                  {routesForBiome.map((r) => {
                    const isUnlocked = isBiomeUnlocked && r.routeNumber <= maxRouteUnlocked;
                    const kills = (state.routeKills && state.routeKills[r.id]) || 0;
                    const mastery = getRouteMastery(r.id, state.capturedGames);

                    return (
                      <div
                        key={r.id}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 transition-all ${
                          !isUnlocked
                            ? 'bg-slate-950/40 border-slate-900 text-slate-600'
                            : mastery.isMastered
                            ? 'bg-amber-950/20 border-amber-500/40 text-slate-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[11px] flex items-center gap-1">
                            {r.isBossRoute ? (
                              <>
                                <Crown className="w-3 h-3 text-rose-400" />
                                <span>Boss</span>
                              </>
                            ) : (
                              <span>Route {r.routeNumber}</span>
                            )}
                          </span>
                          {mastery.isMastered && (
                            <span title="Route maîtrisée à 100%">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            </span>
                          )}
                        </div>

                        {/* Compteur de Kills Persistant */}
                        <div>
                          <div className="text-sm font-black text-white">
                            {isUnlocked ? (
                              <span>{formatOdysseyNumber(kills)} vaincus</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </div>
                          {isUnlocked && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Pépites : {mastery.capturedCount}/{mastery.totalCount} ({mastery.percentage}%)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
