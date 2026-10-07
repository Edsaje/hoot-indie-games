import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Lock,
  Sword,
  Backpack,
  Zap,
  Trophy,
  Droplets,
} from 'lucide-react';
import type { OdysseySaveState } from '../../types/odyssey';
import { calculateCompanionDps, getCollectionMilestoneBonus } from '../../data/odysseyData';
import {
  getGameArtwork,
  handleOdysseyImageError,
  IMPLEMENTED_ODYSSEY_GAMES,
  IMPLEMENTED_GAME_IDS,
} from '../../data/odysseyRouteDex';
import { formatOdysseyNumber } from '../../services/odysseyEngineService';
import { soundFx } from '../../utils/audio';

interface CompanionsDexViewProps {
  state: OdysseySaveState;
  onBackToArena: () => void;
  initialSelectedGameId?: string | null;
}

export const CompanionsDexView: React.FC<CompanionsDexViewProps> = ({
  state,
  onBackToArena,
  initialSelectedGameId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'captured' | 'holo'>('all');
  const [highlightedGameId, setHighlightedGameId] = useState<string | null>(null);

  const capturedMap = state.capturedGames || {};
  const implementedCapturedEntries = Object.entries(capturedMap).filter(([id]) =>
    IMPLEMENTED_GAME_IDS.has(id)
  );
  const totalCaptured = implementedCapturedEntries.length;
  const totalHolo = implementedCapturedEntries.filter(([, g]) => g.isHolo).length;

  // Auto-scroll et surbrillance lorsqu'une pépite de route est inspectée
  React.useEffect(() => {
    if (!initialSelectedGameId) return;

    // Réinitialiser la recherche textuelle pour garantir que la pépite inspectée est dans la vue
    setSearchQuery('');

    // Si la pépite n'est pas encore capturée et qu'un filtre restrictif est actif, basculer sur 'all'
    const companion = capturedMap[initialSelectedGameId];
    if (!companion && filterMode !== 'all') {
      setFilterMode('all');
    }

    const scrollTimer = setTimeout(() => {
      const cardElement = document.getElementById(`indiedex-card-${initialSelectedGameId}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedGameId(initialSelectedGameId);
      }
    }, 120);

    const fadeTimer = setTimeout(() => {
      setHighlightedGameId(null);
    }, 3800);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(fadeTimer);
    };
  }, [initialSelectedGameId, capturedMap, filterMode]);

  const filteredGames = useMemo(() => {
    return IMPLEMENTED_ODYSSEY_GAMES.filter((game) => {
      const isCaptured = Boolean(capturedMap[game.id]);
      const isHolo = Boolean(capturedMap[game.id]?.isHolo);

      if (filterMode === 'captured' && !isCaptured) return false;
      if (filterMode === 'holo' && !isHolo) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = game.title.toLowerCase().includes(q);
        const matchesDev = game.developer.toLowerCase().includes(q);
        return matchesTitle || matchesDev;
      }

      return true;
    });
  }, [capturedMap, filterMode, searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      {/* 1. Header Compagnons */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#06241b]/95 border border-[#78350f] backdrop-blur-md mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Backpack className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              L'Indiedex des Pépites Sylvestres
            </h2>
            <p className="text-xs text-slate-300">
              Affrontez les Échos Sauvages sur les routes pour capturer les {IMPLEMENTED_ODYSSEY_GAMES.length} chefs-d'œuvre du sanctuaire indé.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Capturés</div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
                {totalCaptured} / {IMPLEMENTED_ODYSSEY_GAMES.length}
              </div>
            </div>

            <div className="h-6 w-px bg-slate-700" />

            <div>
              <div className="text-[10px] font-mono uppercase text-cyan-300 font-bold">Shinies Holo</div>
              <div className="text-base sm:text-lg font-black font-mono text-cyan-400 flex items-center gap-1.5 justify-end">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{totalHolo}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBackToArena}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Sword className="w-3.5 h-3.5 text-amber-400" />
            <span>Retour Combat</span>
          </button>
        </div>
      </div>

      {/* 2. Bandeau de Palier de Collection Indiedex */}
      {(() => {
        const milestoneBonus = getCollectionMilestoneBonus(totalCaptured);
        const active = milestoneBonus.activeMilestone;
        const next = milestoneBonus.nextMilestone;

        return (
          <div className="w-full p-4 rounded-2xl bg-[#06241b]/90 border border-amber-500/30 backdrop-blur-md mb-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Palier Indiedex</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {active ? active.title : 'Novice du Sanctuaire'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold mt-1 text-slate-300">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>+{active ? active.dpsBonusPercent : 0}% DPS Global</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>+{active ? active.sapBonusPercent : 0}% Sève</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Progression</span>
                {next ? (
                  <span className="text-amber-400 font-bold">
                    {totalCaptured} / {next.requiredCount} pépites
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">Collection Complète</span>
                )}
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                  style={{ width: `${milestoneBonus.progressToNext}%` }}
                />
              </div>
              {next && (
                <div className="text-[9px] font-mono text-slate-500 text-right">
                  Prochain rang : {next.title} (+{next.dpsBonusPercent}% DPS)
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 3. Barre de Recherche et Filtres */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-xl bg-[#06241b]/80 border border-[#78350f]/60">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou studio..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundFx.playClick();
              setFilterMode('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tous ({IMPLEMENTED_ODYSSEY_GAMES.length})
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setFilterMode('captured');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'captured'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Capturés ({totalCaptured})
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setFilterMode('holo');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterMode === 'holo'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 text-cyan-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Holo ({totalHolo})</span>
          </button>
        </div>
      </div>

      {/* 3. Grille des 256 Cartes de Compagnons */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredGames.map((game, idx) => {
          const companion = capturedMap[game.id];
          const isCaptured = Boolean(companion);
          const isHolo = Boolean(companion?.isHolo);
          const holoRadianceLevel = state.treeUpgrades?.['comp_holo_radiance'] || 0;
          const holoRadianceBonus = holoRadianceLevel * 0.2;
          const dpsContribution = isCaptured
            ? calculateCompanionDps(game.id, companion, holoRadianceBonus)
            : 0;

          const artworkUrl = getGameArtwork(game);

          const isHighlighted = highlightedGameId === game.id;

          return (
            <div
              key={game.id}
              id={`indiedex-card-${game.id}`}
              className={`relative rounded-2xl overflow-hidden border p-2 flex flex-col justify-between transition-all select-none duration-300 ${
                isHighlighted
                  ? 'ring-4 ring-amber-400 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.95)] scale-105 z-30'
                  : ''
              } ${
                isCaptured
                  ? isHolo
                    ? 'border-cyan-400 bg-gradient-to-b from-[#092233] to-[#04111a] shadow-lg shadow-cyan-500/20'
                    : 'border-amber-500/50 bg-[#06241b] shadow-md'
                  : 'border-slate-800/80 bg-slate-950/60 opacity-60'
              }`}
            >
              {/* Badge indicatif de surbrillance temporaire */}
              {isHighlighted && (
                <div className="absolute top-1 left-1 z-30 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider animate-bounce shadow-md">
                  Inspecté ↗
                </div>
              )}
              {/* Effet Holographique Prismatique si Shiny */}
              {isHolo && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 z-10"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,0,128,0.2) 0%, rgba(0,255,255,0.25) 50%, rgba(255,255,0,0.2) 100%)',
                  }}
                />
              )}

              {/* Capsule Image */}
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black/60 mb-2 border border-white/10">
                {isCaptured ? (
                  <img
                    key={game.id}
                    src={artworkUrl}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleOdysseyImageError(e, game)}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900/80">
                    <Lock className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-mono">#{idx + 1}</span>
                  </div>
                )}

                {isHolo && (
                  <div className="absolute top-1 right-1 px-1.5 py-0.2 rounded-md bg-cyan-400 text-slate-950 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                    <Sparkles className="w-2 h-2" />
                    <span>HOLO</span>
                  </div>
                )}
              </div>

              {/* Titre & Info */}
              <div className="z-20">
                <h4
                  className={`text-xs font-black line-clamp-1 ${
                    isCaptured ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {game.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] font-mono mt-1 text-slate-400">
                  <span>{game.releaseYear}</span>
                  {isCaptured ? (
                    <span className="text-emerald-400 font-bold">x{companion.count}</span>
                  ) : (
                    <span className="text-slate-600">Verrouillé</span>
                  )}
                </div>

                {isCaptured && (
                  <div className="mt-1 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 text-cyan-400" />
                      <span>DPS</span>
                    </span>
                    <span className="text-cyan-300 font-bold">
                      +{formatOdysseyNumber(dpsContribution)}/s
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
