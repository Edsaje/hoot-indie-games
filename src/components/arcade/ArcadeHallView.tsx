import React, { useState, useRef } from 'react';
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
import type { LocalizedText } from '../../types/game';
import { getLocalizedText } from '../../utils/localization';
import { soundFx } from '../../utils/audio';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { useGamepadStatus, useGamepadArcadeLoop } from '../../utils/gamepad';

interface ArcadeHallViewProps {
  onOpenGame: (gameId: ArcadeGameId) => void;
  onOpenLeaderboard?: (gameId?: string) => void;
}

const GAME_TAGS: Record<ArcadeGameId, { genre: LocalizedText; year: string; difficulty: string }> = {
  snake: {
    genre: {
      fr: 'Classique 1976',
      en: 'Classic 1976',
      es: 'Clásico 1976',
      de: 'Klassiker 1976',
      ja: 'クラシック 1976',
      'pt-BR': 'Clássico 1976',
    },
    year: '1976',
    difficulty: 'Normal',
  },
  pong: {
    genre: {
      fr: 'Pionnier 1972',
      en: 'Pioneer 1972',
      es: 'Pionero 1972',
      de: 'Pionier 1972',
      ja: 'パイオニア 1972',
      'pt-BR': 'Pioneiro 1972',
    },
    year: '1972',
    difficulty: 'Détente',
  },
  breakout: {
    genre: {
      fr: 'Casse-Tête Action',
      en: 'Action Puzzle',
      es: 'Puzle de Acción',
      de: 'Action-Puzzle',
      ja: 'アクションパズル',
      'pt-BR': 'Quebra-cabeça de Ação',
    },
    year: '1976',
    difficulty: 'Normal',
  },
  flappy: {
    genre: {
      fr: 'Réflexe Arcade',
      en: 'Arcade Reflex',
      es: 'Reflejos Arcade',
      de: 'Arcade-Reflex',
      ja: 'アーケード反射神経',
      'pt-BR': 'Reflexo Arcade',
    },
    year: '2013',
    difficulty: 'Difficile',
  },
  invaders: {
    genre: {
      fr: "Shoot'em Up Culte",
      en: "Cult Shoot'em Up",
      es: "Shoot'em Up de Culto",
      de: "Kult-Shoot'em Up",
      ja: 'カルトシューティング',
      'pt-BR': "Shoot'em Up Cult",
    },
    year: '1978',
    difficulty: 'Difficile',
  },
  run: {
    genre: {
      fr: 'Course Infinie',
      en: 'Infinite Runner',
      es: 'Carrera Infinita',
      de: 'Endlosläufer',
      ja: 'エンドレスランナー',
      'pt-BR': 'Corrida Infinita',
    },
    year: '2014',
    difficulty: 'Normal',
  },
  tetris: {
    genre: {
      fr: 'Puzzle Intemporel',
      en: 'Timeless Puzzle',
      es: 'Puzle Intemporal',
      de: 'Zeitloses Puzzle',
      ja: '不朽のパズル',
      'pt-BR': 'Quebra-cabeça Intemporal',
    },
    year: '1984',
    difficulty: 'Stratégique',
  },
  vectrex: {
    genre: {
      fr: 'Vectoriel Cathodique',
      en: 'CRT Vectorial',
      es: 'Vectorial CRT',
      de: 'Vektor-CRT',
      ja: 'CRTベクターグラフィック',
      'pt-BR': 'Vetorial CRT',
    },
    year: '1982',
    difficulty: 'Hardcore',
  },
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
  const { t, i18n } = useTranslation();

  const [highScores] = useState<Record<string, number>>(() => loadHighScores());
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const focusedIndexRef = useRef(focusedIndex);
  focusedIndexRef.current = focusedIndex;

  const { isConnected: isGamepadConnected, gamepadName, labels } = useGamepadStatus();

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

  useGamepadArcadeLoop({
    enabled: isGamepadConnected,
    onDirectionJustPressed: (dir) => {
      setFocusedIndex((prev) => {
        if (dir === 'LEFT') {
          return prev > 0 ? prev - 1 : ARCADE_GAMES.length - 1;
        }
        if (dir === 'RIGHT') {
          return prev < ARCADE_GAMES.length - 1 ? prev + 1 : 0;
        }
        if (dir === 'UP') {
          return prev >= 4 ? prev - 4 : prev >= 2 ? prev - 2 : prev;
        }
        if (dir === 'DOWN') {
          return prev + 4 < ARCADE_GAMES.length
            ? prev + 4
            : prev + 2 < ARCADE_GAMES.length
            ? prev + 2
            : prev;
        }
        return prev;
      });
    },
    onActionJustPressed: () => {
      const game = ARCADE_GAMES[focusedIndexRef.current];
      if (game) handleLaunchGame(game.id);
    },
    onRestartJustPressed: () => {
      const game = ARCADE_GAMES[focusedIndexRef.current];
      if (game) handleLaunchGame(game.id);
    },
    onActionSecondaryJustPressed: () => {
      handleRandomLaunch();
    },
    onCloseJustPressed: () => {
      if (onOpenLeaderboard) {
        const game = ARCADE_GAMES[focusedIndexRef.current];
        onOpenLeaderboard(game?.id);
      }
    },
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Hero Header - Neon Retro Arcade Room */}
      <div className="relative rounded-3xl overflow-visible bg-gradient-to-br from-[#093a2b] via-[#05261c] to-[#021711] border-2 border-[#78350f] p-6 sm:p-10 shadow-2xl">
        <SylvestreIvyFrame density="medium" />
        {/* Soft emerald background glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-950/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Gamepad2 className="w-3.5 h-3.5" />
                {t('arcade.badge')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                60 FPS • Mobile Ready
              </span>
              {isGamepadConnected && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider animate-in fade-in">
                  <Gamepad2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  {gamepadName || 'Manette Connectée'}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {t('arcade.cabinetsTitle')}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              {t('arcade.cabinetsDesc')}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={handleRandomLaunch}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs sm:text-sm hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Dices className="w-4 h-4" />
                {t('arcade.randomCoin')}
              </button>

              {onOpenLeaderboard && (
                <button
                  onClick={() => onOpenLeaderboard()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06241b] hover:bg-[#093a2b] border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm transition shadow-lg active:scale-95 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>{t('arcade.leaderboard')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Cabinet Panel */}
          <div className="flex items-center gap-3 bg-[#031711]/90 backdrop-blur-md p-4 rounded-2xl border border-[#0d543e] self-start md:self-auto shrink-0 shadow-lg">
            <div className="text-center px-3 border-r border-[#0d543e]">
              <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {t('arcade.cabinetsPlayed')}
              </div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {gamesPlayedCount} <span className="text-xs text-slate-400 font-sans">/ 8</span>
              </div>
            </div>

            <div className="text-center px-3">
              <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t('arcade.totalHighScore')}
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
        {ARCADE_GAMES.map((game, index) => {
          const meta = GAME_TAGS[game.id];
          const bestScore = highScores[game.id] || 0;
          const isFocused = isGamepadConnected && focusedIndex === index;

          return (
            <div
              key={game.id}
              className={`relative overflow-visible bg-[#06241b]/90 border-2 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-xl ${
                isFocused
                  ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-2xl shadow-amber-500/30 scale-[1.02] z-20'
                  : 'border-[#78350f] hover:border-[#b45309] hover:shadow-amber-950/30 hover:-translate-y-1'
              }`}
            >
              <SylvestreIvyFrame density="delicate" />
              <div>
                {/* Header card with icon and tags */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#031711] border border-[#0d543e] group-hover:border-amber-500/40 flex items-center justify-center text-2xl shadow transition">
                    {game.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isFocused ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow">
                        Actif Manette
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#031711] text-emerald-200/80 border border-[#0d543e]/50">
                        {meta.year}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-amber-400">
                      {getLocalizedText(meta.genre, i18n.language)}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition">
                  {game.name}
                </h3>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {t(`arcade.instructions.${game.id}`, { defaultValue: game.instructions })}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#0d543e]/60 flex flex-col gap-3">
                {/* Record High Score Display */}
                <div
                  onClick={() => onOpenLeaderboard?.(game.id)}
                  className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-[#031711] border border-[#0d543e] ${
                    onOpenLeaderboard ? 'hover:border-amber-500/50 cursor-pointer transition' : ''
                  }`}
                  title={t('arcade.viewGameLeaderboard')}
                >
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    {t('arcade.highScore')}
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {bestScore > 0 ? bestScore.toLocaleString() : '—'}
                  </span>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handleLaunchGame(game.id)}
                  className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer ${
                    isFocused
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-500/30 scale-102 ring-2 ring-amber-300'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  {isFocused ? `${labels.actionA} : Lancer la Borne` : t('arcade.launchCabinet')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retro Arcade Hardware Banner */}
      <div className="relative overflow-visible bg-gradient-to-r from-[#072a20] via-[#05261c] to-[#031711] border-2 border-[#78350f] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 shadow-xl">
        <SylvestreIvyFrame density="delicate" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#031711] border border-[#0d543e] text-amber-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-white block font-bold">
              {t('arcade.touchControlsTitle')}
            </strong>
            <span>
              {t('arcade.touchControlsDesc')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#031711] border border-[#0d543e] text-emerald-400">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-white block font-bold">
              {t('arcade.keyboardControlsTitle')}
            </strong>
            <span>
              {t('arcade.keyboardControlsDesc')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#031711] border border-[#0d543e] text-cyan-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-white block font-bold">
              {isGamepadConnected ? gamepadName : 'Manettes & Sticks'}
            </strong>
            <span>
              {isGamepadConnected
                ? `D-Pad pour naviguer, ${labels.actionA} pour jouer, ${labels.actionX} pour aléatoire`
                : 'Xbox, PlayStation, Switch & 8BitDo 100% plug & play'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
