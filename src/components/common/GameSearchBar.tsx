import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ChevronRight,
  Sparkles,
  Filter,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { Game } from '../../types/game';
import { soundFx } from '../../utils/audio';

export interface ClueBadge {
  id: string;
  icon?: React.ReactNode;
  label: string;
  type?: 'success' | 'warning' | 'info';
}

export interface GameSearchBarProps {
  games: Game[];
  guessedGameIds: string[];
  onSelectGame: (game: Game) => void;
  disabled?: boolean;
  placeholder?: string;
  candidateGames?: Game[];
  activeClues?: ClueBadge[];
}

export const GameSearchBar: React.FC<GameSearchBarProps> = ({
  games,
  guessedGameIds,
  onSelectGame,
  disabled = false,
  placeholder,
  candidateGames,
  activeClues,
}) => {
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [placement, setPlacement] = useState<'down' | 'up'>('down');
  const [maxDropdownHeight, setMaxDropdownHeight] = useState<number>(280);
  const [filterByClues, setFilterByClues] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter out already guessed games
  const availableGames = useMemo(() => {
    return games.filter((g) => !guessedGameIds.includes(g.id));
  }, [games, guessedGameIds]);

  const candidateGamesAvailable = useMemo(() => {
    if (!candidateGames) return availableGames;
    return candidateGames.filter((g) => !guessedGameIds.includes(g.id));
  }, [candidateGames, availableGames, guessedGameIds]);

  const hasCluesFilter = Boolean(
    candidateGames &&
    candidateGamesAvailable.length > 0 &&
    candidateGamesAvailable.length < availableGames.length
  );

  // Active pool depends on toggle
  const activePool = hasCluesFilter && filterByClues ? candidateGamesAvailable : availableGames;

  const queryTrimmed = query.trim().toLowerCase();

  const filteredGames = useMemo(() => {
    if (!queryTrimmed) {
      return activePool.slice(0, 10);
    }
    return activePool
      .filter((g) => {
        return (
          g.title.toLowerCase().includes(queryTrimmed) ||
          g.developer.toLowerCase().includes(queryTrimmed) ||
          g.genre.some((gen) => gen.toLowerCase().includes(queryTrimmed))
        );
      })
      .slice(0, 10);
  }, [activePool, queryTrimmed]);

  // Check if games exist in all games when candidate search returns 0
  const allMatchingGames = useMemo(() => {
    if (!queryTrimmed) return [];
    return availableGames.filter((g) => {
      return (
        g.title.toLowerCase().includes(queryTrimmed) ||
        g.developer.toLowerCase().includes(queryTrimmed) ||
        g.genre.some((gen) => gen.toLowerCase().includes(queryTrimmed))
      );
    });
  }, [availableGames, queryTrimmed]);

  // Dynamic placement detection: opens UP if cramped below, clamps height to viewport
  const updatePlacement = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const minSpaceNeeded = 260;

    if (spaceBelow < minSpaceNeeded && spaceAbove > spaceBelow) {
      setPlacement('up');
      setMaxDropdownHeight(Math.max(160, Math.min(340, spaceAbove - 24)));
    } else {
      setPlacement('down');
      setMaxDropdownHeight(Math.max(160, Math.min(340, spaceBelow - 24)));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePlacement();
      const handleResizeOrScroll = () => {
        requestAnimationFrame(updatePlacement);
      };
      window.addEventListener('resize', handleResizeOrScroll);
      window.addEventListener('scroll', handleResizeOrScroll, true);
      return () => {
        window.removeEventListener('resize', handleResizeOrScroll);
        window.removeEventListener('scroll', handleResizeOrScroll, true);
      };
    }
  }, [isOpen, updatePlacement]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (game: Game) => {
    soundFx.playClick();
    onSelectGame(game);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || filteredGames.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev + 1) % filteredGames.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev - 1 + filteredGames.length) % filteredGames.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredGames[highlightedIndex]) {
        handleSelect(filteredGames[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      {/* Discovered Clues Banner */}
      {activeClues && activeClues.length > 0 && (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5 px-1 animate-in fade-in duration-200">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('search.discoveredClues')}</span>
          </span>
          {activeClues.map((clue) => (
            <span
              key={clue.id}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black shadow-xs border transition-colors ${
                clue.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : clue.type === 'warning'
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                  : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              }`}
            >
              {clue.icon}
              <span>{clue.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Main Input */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-amber-400 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
            requestAnimationFrame(updatePlacement);
          }}
          onFocus={() => {
            setIsOpen(true);
            requestAnimationFrame(updatePlacement);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            hasCluesFilter && filterByClues
              ? t('search.searchCluePlaceholder', { count: candidateGamesAvailable.length })
              : placeholder || t('common.guess')
          }
          className="w-full pl-11 pr-24 py-3.5 bg-[#06241b] border-2 border-[#78350f] focus:border-[#f59e0b] rounded-2xl text-white placeholder-slate-400 font-medium text-base sm:text-sm focus:outline-none transition shadow-xl focus:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Clue filter toggle pill inside input right edge */}
        {hasCluesFilter && (
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setFilterByClues((prev) => !prev);
              setIsOpen(true);
              requestAnimationFrame(updatePlacement);
            }}
            title={
              filterByClues
                ? t('search.filterCluesActive')
                : t('search.filterCluesInactive')
            }
            className={`absolute right-2 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              filterByClues
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3 h-3 text-amber-400" />
            <span>
              {filterByClues
                ? `${candidateGamesAvailable.length}`
                : t('search.all')}
            </span>
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && !disabled && (
        <div
          style={{ maxHeight: `${maxDropdownHeight}px` }}
          className={`absolute z-50 w-full bg-[#06241b] border-2 border-[#78350f] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden divide-y divide-[#78350f]/40 backdrop-blur-md transition-all flex flex-col ${
            placement === 'up' ? 'bottom-[calc(100%+0.5rem)] mb-0' : 'top-[calc(100%+0.5rem)] mt-0'
          }`}
        >
          {/* Header Bar with Count & Clue Switch */}
          {hasCluesFilter && (
            <div className="shrink-0 flex items-center justify-between px-3.5 py-2 bg-[#041912] border-b border-[#78350f]/60 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {filterByClues
                    ? t('search.possibleGamesMatching', { count: candidateGamesAvailable.length })
                    : t('search.fullCatalog', { count: availableGames.length })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setFilterByClues((prev) => !prev);
                }}
                className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#0b2b20] hover:bg-[#103d2e] text-amber-400 border border-[#78350f]/60 transition cursor-pointer"
              >
                {filterByClues ? t('search.viewAll') : t('search.filter')}
              </button>
            </div>
          )}

          {/* List Items */}
          <div className="overflow-y-auto flex-1 divide-y divide-[#78350f]/30">
            {filteredGames.length > 0 ? (
              filteredGames.map((game, index) => {
                const isHighlighted = index === highlightedIndex;
                const isCandidate = candidateGamesAvailable.some((c) => c.id === game.id);

                return (
                  <div
                    key={game.id}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(game)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition ${
                      isHighlighted
                        ? 'bg-amber-500/20 text-white'
                        : 'text-slate-200 hover:bg-[#0a382b]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={game.screenshots[5] || game.screenshots[0]}
                        alt={game.title}
                        className="w-12 h-8 object-cover rounded-lg border border-[#78350f]/60 shrink-0 bg-black/40"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white flex items-center gap-2 truncate">
                          <span className="truncate">{game.title}</span>
                          <span className="text-xs font-normal text-amber-400 shrink-0">
                            ({game.releaseYear})
                          </span>
                          {hasCluesFilter && isCandidate && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                              <Check className="w-2.5 h-2.5" />
                              {t('search.compatible')}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {game.developer} • {game.genre.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isHighlighted ? 'text-[#f59e0b] translate-x-0.5' : 'text-slate-500'
                      }`}
                    />
                  </div>
                );
              })
            ) : filterByClues && allMatchingGames.length > 0 ? (
              /* No matches in clues candidate list, but exists in general catalog */
              <div className="p-4 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {t('search.noMatchForQuery', { query })}
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setFilterByClues(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b2b20] hover:bg-[#103d2e] border border-[#78350f] text-amber-300 text-xs font-bold transition cursor-pointer"
                  >
                    <span>
                      {t('search.showAllResults', { count: allMatchingGames.length })}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                {t('search.noGameFound')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
