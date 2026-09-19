import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Gamepad2,
  Trophy,
  Play,
  Dices,
  Smartphone,
  Keyboard,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ARCADE_GAMES, type ArcadeGameId } from '../../data/arcadeGames';
import { soundFx } from '../../utils/audio';

interface ArcadeHallViewProps {
  onOpenGame: (gameId: ArcadeGameId) => void;
  onOpenLeaderboard?: (gameId?: string) => void;
}

const GAME_TAGS: Record<ArcadeGameId, { genreFr: string; genreEn: string; year: string; difficulty: string }> = {
  snake: { genreFr: 'Classique 1976', genreEn: 'Classic 1976', year: '1976', difficulty: 'Normal' },
  pong: { genreFr: 'Pionnier 1972', genreEn: 'Pioneer 1972', year: '1972', difficulty: 'Détente' },
  breakout: { genreFr: 'Casse-Tête Action', genreEn: 'Action Puzzle', year: '1976', difficulty: 'Normal' },
  flappy: { genreFr: 'Réflexe Arcade', genreEn: 'Arcade Reflex', year: '2013', difficulty: 'Difficile' },
  invaders: { genreFr: 'Shoot\'em Up Culte', genreEn: 'Cult Shoot\'em Up', year: '1978', difficulty: 'Difficile' },
  run: { genreFr: 'Infinite Runner', genreEn: 'Infinite Runner', year: '2014', difficulty: 'Normal' },
  tetris: { genreFr: 'Puzzle Intemporel', genreEn: 'Timeless Puzzle', year: '1984', difficulty: 'Stratégique' },
  vectrex: { genreFr: 'Vectoriel Cathodique', genreEn: 'CRT Vectorial', year: '1982', difficulty: 'Hardcore' },
};

function loadHighScores(): Record<string, number> {
  const scores: Record<string, number> = {};
  if (typeof localStorage === 'undefined') return scores;
  for (const g of ARCADE_GAMES) {
    try {
      const val = localStorage.getItem(`hoot_arcade_hs_${g.id}`) || localStorage.getItem(`arcade_high_${g.id}`);
      scores[g.id] = val ? parseInt(val, 10) : 0;
    } catch {
      scores[g.id] = 0;
    }
  }
  return scores;
}

export const ArcadeHallView: React.FC<ArcadeHallViewProps> = ({ onOpenGame, onOpenLeaderboard }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const [highScores] = useState<Record<string, number>>(() => loadHighScores());

  const totalPoints = Object.values(highScores).reduce((acc, v) => acc + v, 0);
  const gamesPlayedCount = Object.values(highScores).filter((v) => v > 0).length;

  const handleLaunchGame = (id: ArcadeGameId) => {
    soundFx.playClick();
    onOpenGame(id);
  };

  const handleRandomLaunch = () => {
    soundFx.playClick();
    const rand = ARCADE_GAMES[Math.floor(Math.random() * ARCADE_GAMES.length)];
    onOpenGame(rand.id);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Hero Header - Neon Retro Arcade Room */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#121024] via-[#0e1628] to-[#0a101d] border border-amber-500/30 p-6 sm:p-10 shadow-2xl">
        {/* Soft neon background glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Gamepad2 className="w-3.5 h-3.5" />
                {lang === 'fr' ? 'Salle d\'Arcade Rétro' : 'Retro Arcade Hall'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                60 FPS • Mobile Ready
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {lang === 'fr' ? 'Les Bornes du Hibou' : 'The Owl Arcade Cabinets'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              {lang === 'fr'
                ? '8 mini-jeux d\'arcade cultes programmés en Canvas pur, optimisés pour mobile avec manette tactile adaptative et clavier pour desktop.'
                : '8 cult arcade mini-games built in pure Canvas, calibrated for smooth mobile touch controls and desktop keyboards.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={handleRandomLaunch}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs sm:text-sm hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Dices className="w-4 h-4" />
                {lang === 'fr' ? 'Insérer une Pièce au Hasard' : 'Insert Coin (Random)'}
              </button>

              {onOpenLeaderboard && (
                <button
                  onClick={() => onOpenLeaderboard()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#131a29] hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm transition shadow-lg active:scale-95 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'fr' ? 'Classement Mondial Arcade' : 'Arcade Leaderboard'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Cabinet Panel */}
          <div className="flex items-center gap-3 bg-[#0b0f19]/80 backdrop-blur-md p-4 rounded-2xl border border-[#1e293b] self-start md:self-auto shrink-0">
            <div className="text-center px-3 border-r border-[#1e293b]">
              <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                {lang === 'fr' ? 'Bornes jouées' : 'Cabinets played'}
              </div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {gamesPlayedCount} <span className="text-xs text-slate-400 font-sans">/ 8</span>
              </div>
            </div>

            <div className="text-center px-3">
              <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {lang === 'fr' ? 'High-Scores cumulés' : 'Total High Score'}
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                {totalPoints.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cabinets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ARCADE_GAMES.map((game) => {
          const meta = GAME_TAGS[game.id];
          const bestScore = highScores[game.id] || 0;

          return (
            <div
              key={game.id}
              className="bg-[#131a29] border border-[#1e293b] hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
            >
              <div>
                {/* Header card with icon and tags */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0b0f19] border border-[#1e293b] group-hover:border-amber-500/40 flex items-center justify-center text-2xl shadow transition">
                    {game.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {meta.year}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400">
                      {lang === 'fr' ? meta.genreFr : meta.genreEn}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition">
                  {game.name}
                </h3>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {game.instructions}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1e293b]/70 flex flex-col gap-3">
                {/* Record High Score Display */}
                <div
                  onClick={() => onOpenLeaderboard?.(game.id)}
                  className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-[#0b0f19] border border-[#1e293b] ${
                    onOpenLeaderboard ? 'hover:border-amber-500/50 cursor-pointer transition' : ''
                  }`}
                  title={lang === 'fr' ? 'Voir le classement de ce jeu' : 'View leaderboard for this game'}
                >
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Record :
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {bestScore > 0 ? bestScore.toLocaleString() : '—'}
                  </span>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handleLaunchGame(game.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  {lang === 'fr' ? 'Lancer la Borne' : 'Play Cabinet'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retro Arcade Hardware Banner */}
      <div className="bg-[#0f1624] border border-[#1e293b] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-amber-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-white block font-bold">
              {lang === 'fr' ? 'Commandes Tactiles Optimisées' : 'Optimized Touch Controls'}
            </strong>
            <span>
              {lang === 'fr'
                ? 'D-pad virtuel réactif, glissement 1:1 pour les raquettes et balayage gesture fluide sur smartphones.'
                : 'Zero-delay virtual D-Pad, 1:1 paddle drag, and fluid gesture swipes on smartphones.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-emerald-400">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-white block font-bold">
              {lang === 'fr' ? 'Contrôles Clavier PC' : 'PC Keyboard Controls'}
            </strong>
            <span>
              {lang === 'fr'
                ? 'Flèches directionnelles, touches ZQSD et barre d\'espace compatibles avec tous les navigateurs.'
                : 'Arrow keys, WASD, and spacebar fully supported across all browsers.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
