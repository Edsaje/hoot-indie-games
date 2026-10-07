import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  Target,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import type { OdysseyRoute } from '../../types/odyssey';
import {
  getRouteDexEntries,
  getRouteMastery,
  getGameArtwork,
  handleOdysseyImageError,
  type RouteGameEntry,
} from '../../data/odysseyRouteDex';

interface RouteLootDexProps {
  currentRoute: OdysseyRoute;
  capturedGames: Record<string, { count: number; isHolo: boolean; level: number }>;
  onSelectGameInspect?: (gameId: string) => void;
}

export const RouteLootDex: React.FC<RouteLootDexProps> = ({
  currentRoute,
  capturedGames,
  onSelectGameInspect,
}) => {
  const entries = getRouteDexEntries(currentRoute.id, capturedGames);
  const mastery = getRouteMastery(currentRoute.id, capturedGames);
  const [hoveredEntry, setHoveredEntry] = useState<RouteGameEntry | null>(null);

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'rare':
        return 'text-amber-300 bg-amber-950/80 border-amber-500/50';
      case 'uncommon':
        return 'text-sky-300 bg-sky-950/80 border-sky-500/50';
      default:
        return 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'rare':
        return 'Rare';
      case 'uncommon':
        return 'Peu commun';
      default:
        return 'Commun';
    }
  };

  return (
    <div className="w-full bg-[#03150f]/90 border border-emerald-500/30 rounded-2xl p-2.5 sm:p-3.5 mb-3 shadow-xl backdrop-blur-md transition-all">
      {/* 1. En-tête : Progression de la route */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-emerald-950/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-xs font-black text-emerald-400">
            {mastery.isMastered ? (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/60 text-amber-300 animate-pulse"
                title="Route 100% Maîtrisée ! Bonus permanent : +15% de Sève Stellaire sur cette route."
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Maîtrisée (+15% Sève)</span>
              </div>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Indiedex de Route</span>
              </span>
            )}
          </div>

          <div className="text-xs font-bold text-slate-300 font-mono">
            <span>{mastery.capturedCount}</span>
            <span className="text-slate-500">/{mastery.totalCount}</span>
            <span className="text-[11px] text-emerald-400 ml-1.5 font-normal">
              ({mastery.percentage}%)
            </span>
          </div>
        </div>

        {/* Indicateur de reste à découvrir */}
        <div className="text-[11px] font-mono text-slate-400">
          {mastery.isMastered ? (
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300" />
              <span>Collection Complète</span>
            </span>
          ) : (
            <span className="text-slate-400">
              <strong className="text-emerald-400 font-bold">{mastery.totalCount - mastery.capturedCount}</strong> pépite(s) restante(s)
            </span>
          )}
        </div>
      </div>

      {/* 2. Barre de progression fine de maîtrise */}
      <div className="w-full h-1.5 rounded-full bg-slate-900 border border-emerald-950 overflow-hidden mb-3">
        <div
          style={{ width: `${mastery.percentage}%` }}
          className={`h-full rounded-full transition-all duration-500 ${
            mastery.isMastered
              ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
              : 'bg-gradient-to-r from-emerald-600 to-cyan-500'
          }`}
        />
      </div>

      {/* 3. Shelf horizontal des vignettes de pépites */}
      <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-9 gap-1.5 sm:gap-2">
        {entries.map((entry) => {
          const { game, rarity, dropChancePercent, isCaptured, captureCount, isHolo } = entry;
          const artwork = getGameArtwork(game);

          return (
            <div
              key={game.id}
              onMouseEnter={() => setHoveredEntry(entry)}
              onMouseLeave={() => setHoveredEntry(null)}
              onClick={() => onSelectGameInspect && onSelectGameInspect(game.id)}
              title={
                isCaptured
                  ? `${game.title} — Cliquer pour inspecter dans l'Indiedex`
                  : `Pépite inconnue (${getRarityLabel(rarity)}) — Cliquer pour inspecter dans l'Indiedex`
              }
              className={`relative group aspect-[16/11] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 select-none border ${
                isCaptured
                  ? isHolo
                    ? 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] ring-1 ring-amber-300 scale-100 hover:scale-105'
                    : 'border-emerald-500/60 hover:border-amber-400/90 shadow-md hover:scale-105 bg-black/60'
                  : 'border-dashed border-slate-700/80 bg-slate-950/60 opacity-60 hover:opacity-100'
              }`}
            >
              {isCaptured ? (
                <>
                  {/* Capsule officielle en couleur */}
                  <img
                    key={game.id}
                    src={artwork}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleOdysseyImageError(e, game)}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Badge Holographique Shiny */}
                  {isHolo && (
                    <div className="absolute top-1 left-1 flex items-center justify-center p-0.5 rounded-md bg-amber-500/90 text-slate-950 shadow-md">
                      <Sparkles className="w-2.5 h-2.5 animate-spin" />
                    </div>
                  )}

                  {/* Badge de capture / niveau */}
                  <div className="absolute top-1 right-1 px-1 py-0.2 rounded-md bg-black/80 border border-emerald-400/40 font-mono text-[9px] font-black text-emerald-300 leading-none">
                    x{captureCount}
                  </div>

                  {/* Nom raccourci en bas */}
                  <div className="absolute bottom-0.5 inset-x-1 text-[9px] font-mono font-bold text-slate-200 truncate leading-tight drop-shadow-md">
                    {game.title}
                  </div>
                </>
              ) : (
                /* Silhouette sombre non découverte */
                <div className="w-full h-full flex flex-col items-center justify-center p-1 text-slate-500 bg-slate-950/80">
                  <HelpCircle className="w-5 h-5 text-slate-600 mb-0.5 group-hover:text-amber-400 transition-colors" />
                  <div className="text-[9px] font-mono font-bold text-slate-500 truncate text-center">
                    ???
                  </div>
                  {/* Taux d'apparition */}
                  <div className={`mt-0.5 text-[8px] font-mono px-1 py-0.2 rounded border ${getRarityBadgeColor(rarity)}`}>
                    {dropChancePercent}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Barre d'information au survol */}
      <div className="mt-2 min-h-[22px] flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 border-t border-emerald-950/60 pt-1.5">
        {hoveredEntry ? (
          <div className="w-full flex items-center justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 truncate">
              {hoveredEntry.isCaptured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <strong className="text-white font-bold truncate">
                    {hoveredEntry.game.title}
                  </strong>
                  <span className="text-slate-500 hidden sm:inline">•</span>
                  <span className="text-slate-400 text-[10px] hidden sm:inline truncate">
                    {hoveredEntry.game.developer}
                  </span>
                  {hoveredEntry.isHolo && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase">
                      Shiny Holo
                    </span>
                  )}
                </>
              ) : (
                <>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-400 italic">Pépite Inconnue —</span>
                  <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${getRarityBadgeColor(hoveredEntry.rarity)}`}>
                    {getRarityLabel(hoveredEntry.rarity)} ({hoveredEntry.dropChancePercent}%)
                  </span>
                </>
              )}
            </div>

            <div className="shrink-0 text-right">
              {hoveredEntry.isCaptured ? (
                <span className="text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  <span>Niv. {hoveredEntry.level} (+{(hoveredEntry.level * 2)}% DPS)</span>
                  <span className="text-amber-400 font-normal ml-1">· Clic pour voir l'Indiedex ↗</span>
                </span>
              ) : (
                <span className="text-amber-400 text-[10px]">
                  À découvrir sur cette route · Clic pour inspecter ↗
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between text-[10px] text-slate-500 italic">
            <span>Survolez ou cliquez sur une case pour l'inspecter dans l'Indiedex.</span>
            <span>{mastery.totalCount} pépites assignées à cette route</span>
          </div>
        )}
      </div>
    </div>
  );
};
