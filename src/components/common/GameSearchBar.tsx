import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronRight } from 'lucide-react';
import type { Game } from '../../types/game';
import { soundFx } from '../../utils/audio';

interface GameSearchBarProps {
  games: Game[];
  guessedGameIds: string[];
  onSelectGame: (game: Game) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const GameSearchBar: React.FC<GameSearchBarProps> = ({
  games,
  guessedGameIds,
  onSelectGame,
  disabled = false,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableGames = games.filter(
    (g) => !guessedGameIds.includes(g.id)
  );

  const filteredGames = query.trim() === ''
    ? availableGames.slice(0, 8)
    : availableGames.filter((g) => {
        const q = query.toLowerCase();
        return (
          g.title.toLowerCase().includes(q) ||
          g.developer.toLowerCase().includes(q) ||
          g.genre.some((gen) => gen.toLowerCase().includes(q))
        );
      }).slice(0, 8);


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
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search className="w-5 h-5 text-[#f59e0b]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || t('common.guess')}
          className="w-full pl-11 pr-4 py-3.5 bg-[#131a29] border-2 border-[#1e293b] focus:border-[#f59e0b] rounded-2xl text-white placeholder-slate-500 font-medium text-sm focus:outline-none transition shadow-lg focus:shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {isOpen && !disabled && filteredGames.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-[#131a29] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden divide-y divide-[#1e293b] max-h-72 overflow-y-auto">
          {filteredGames.map((game, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={game.id}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(game)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition ${
                  isHighlighted ? 'bg-amber-500/15 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={game.screenshots[5] || game.screenshots[0]}
                    alt={game.title}
                    className="w-12 h-7 object-cover rounded-lg border border-[#1e293b]"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {game.title}
                      <span className="text-xs font-normal text-amber-400">({game.releaseYear})</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {game.developer} • {game.genre.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isHighlighted ? 'text-[#f59e0b]' : 'text-slate-600'}`} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
