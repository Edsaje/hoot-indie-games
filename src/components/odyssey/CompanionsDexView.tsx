import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Lock,
  Backpack,
  Sword,
} from 'lucide-react';
import type { OdysseySaveState } from '../../types/odyssey';
import { INDIE_GAMES } from '../../data/games';
import { soundFx } from '../../utils/audio';

interface CompanionsDexViewProps {
  state: OdysseySaveState;
  onBackToArena: () => void;
}

export const CompanionsDexView: React.FC<CompanionsDexViewProps> = ({
  state,
  onBackToArena,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'captured' | 'holo'>('all');

  const capturedMap = state.capturedGames || {};
  const totalCaptured = Object.keys(capturedMap).length;
  const totalHolo = Object.values(capturedMap).filter((g) => g.isHolo).length;

  const filteredGames = useMemo(() => {
    return INDIE_GAMES.filter((game) => {
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
              Le Codex des Pépites & Compagnons
            </h2>
            <p className="text-xs text-slate-300">
              Affrontez les Échos Sauvages sur les routes pour capturer les 256 chefs-d'œuvre du sanctuaire indé.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Capturés</div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
                {totalCaptured} / {INDIE_GAMES.length}
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

      {/* 2. Barre de Recherche et Filtres */}
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
            Tous ({INDIE_GAMES.length})
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

          const artworkUrl =
            game.headerImage ||
            game.screenshots?.[0] ||
            'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg';

          return (
            <div
              key={game.id}
              className={`relative rounded-2xl overflow-hidden border p-2 flex flex-col justify-between transition-all select-none ${
                isCaptured
                  ? isHolo
                    ? 'border-cyan-400 bg-gradient-to-b from-[#092233] to-[#04111a] shadow-lg shadow-cyan-500/20'
                    : 'border-amber-500/50 bg-[#06241b] shadow-md'
                  : 'border-slate-800/80 bg-slate-950/60 opacity-60'
              }`}
            >
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
                    src={artworkUrl}
                    alt={game.title}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
