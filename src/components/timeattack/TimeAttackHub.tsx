import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Timer,
  Zap,
  Camera,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  Target,
  FileSearch,
  Calendar,
  Sliders,
  MessageSquareQuote,
  Music,
} from 'lucide-react';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { soundFx } from '../../utils/audio';
import { getTimeAttackStats } from '../../utils/timeAttackStorage';
import type { TimeAttackMode } from '../../types/timeAttack';
import { ScreenleSprint } from './ScreenleSprint';
import { IndledleSprint } from './IndledleSprint';
import { LinkleSprint } from './LinkleSprint';
import { ProfilleSprint } from './ProfilleSprint';
import { ChronoSprint } from './ChronoSprint';
import { PixelSprint } from './PixelSprint';
import { ReviewSprint } from './ReviewSprint';
import { BlindTestSprint } from './BlindTestSprint';

interface TimeAttackHubProps {
  initialMode?: TimeAttackMode;
  onOpenLeaderboard?: (mode?: TimeAttackMode) => void;
}

export const TimeAttackHub: React.FC<TimeAttackHubProps> = ({ initialMode, onOpenLeaderboard }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  const { allPlayableGames } = useSteamCatalog();
  const [activeMode, setActiveMode] = useState<TimeAttackMode | null>(initialMode || null);
  const [stats, setStats] = useState(getTimeAttackStats());

  // Refresh stats whenever returning to hub
  useEffect(() => {
    if (!activeMode) {
      setStats(getTimeAttackStats());
    }
  }, [activeMode]);

  // Synchronize initialMode changes if deep linked
  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  const handleLaunchMode = (mode: TimeAttackMode) => {
    soundFx.playClick();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActiveMode(mode);
  };

  const handleBackToHub = () => {
    soundFx.playClick();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActiveMode(null);
  };

  // If a specific mode is active, render that mode
  if (activeMode === 'screenle') {
    return <ScreenleSprint games={allPlayableGames} onBackToHub={handleBackToHub} />;
  }

  if (activeMode === 'indledle') {
    return <IndledleSprint games={allPlayableGames} onBackToHub={handleBackToHub} />;
  }

  if (activeMode === 'linkle') {
    return <LinkleSprint games={allPlayableGames} onBackToHub={handleBackToHub} />;
  }

  if (activeMode === 'profille') {
    return <ProfilleSprint games={allPlayableGames} onBackToHub={handleBackToHub} />;
  }

  if (activeMode === 'chrono') {
    return <ChronoSprint games={allPlayableGames} onBackToHub={handleBackToHub} />;
  }

  if (activeMode === 'pixel') {
    return <PixelSprint games={allPlayableGames} onBackToHub={handleBackToHub} />;
  }

  if (activeMode === 'review') {
    return <ReviewSprint games={allPlayableGames} onBackToHub={handleBackToHub} />;
  }

  if (activeMode === 'blindtest') {
    return <BlindTestSprint games={allPlayableGames} onBackToHub={handleBackToHub} />;
  }

  const totalAnswered =
    stats.screenle.totalAnswered +
    stats.indledle.totalAnswered +
    stats.linkle.totalAnswered +
    stats.profille.totalAnswered +
    stats.chrono.totalAnswered +
    stats.pixel.totalAnswered +
    stats.review.totalAnswered +
    stats.blindtest.totalAnswered;

  const totalGamesPlayed =
    stats.screenle.gamesPlayed +
    stats.indledle.gamesPlayed +
    stats.linkle.gamesPlayed +
    stats.profille.gamesPlayed +
    stats.chrono.gamesPlayed +
    stats.pixel.gamesPlayed +
    stats.review.gamesPlayed +
    stats.blindtest.gamesPlayed;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{lang === 'fr' ? 'Le Vol Éclair du Hibou' : 'Owl Lightning Sprint'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          Sprint Time Attack ⚡
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {lang === 'fr'
            ? '60 secondes au chronomètre pour chaque discipline. Enchaînez les bonnes réponses, montez votre multiplicateur de combo et défiez vos réflexes sur l’ensemble des 8 mini-jeux indés !'
            : '60 seconds on the clock for each discipline. Chain correct answers, build your combo multiplier, and test your speed across all 8 indie mini-games!'}
        </p>

        {onOpenLeaderboard && (
          <div className="mt-5 flex items-center justify-center">
            <button
              onClick={() => onOpenLeaderboard('screenle')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm transition shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{lang === 'fr' ? 'Classement Mondial Time Attack' : 'Time Attack Leaderboards'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-8">
        <div
          onClick={() => onOpenLeaderboard?.('screenle')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-amber-500/40 cursor-pointer transition' : ''
          }`}
          title="Screenle Sprint"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">Capture</span>
            <Camera className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.screenle.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('indledle')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-emerald-500/40 cursor-pointer transition' : ''
          }`}
          title="Classic Sprint"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">Classic</span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.indledle.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('linkle')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-sky-500/40 cursor-pointer transition' : ''
          }`}
          title="Connexions Sprint"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">Connexions</span>
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.linkle.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('profille')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-purple-500/40 cursor-pointer transition' : ''
          }`}
          title="Profil Sprint"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">Profil</span>
            <FileSearch className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.profille.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('chrono')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-orange-500/40 cursor-pointer transition' : ''
          }`}
          title="Chrono Sprint"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">Chrono</span>
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.chrono.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('pixel')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-rose-500/40 cursor-pointer transition' : ''
          }`}
          title="Pixel Sprint"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">Pixel</span>
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.pixel.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('review')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-cyan-500/40 cursor-pointer transition' : ''
          }`}
          title="Review Sprint"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">Critique</span>
            <MessageSquareQuote className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.review.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('blindtest')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-fuchsia-500/40 cursor-pointer transition' : ''
          }`}
          title="Blind Test Sprint"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">Blind Test</span>
            <Music className="w-3.5 h-3.5 text-fuchsia-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.blindtest.highScore} pts</div>
        </div>
      </div>

      {/* Global summary badge */}
      <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-wrap items-center justify-between gap-4 mb-8 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'fr'
              ? `Total des pépites devinées : `
              : `Total gems guessed: `}
            <strong className="text-white font-mono">{totalAnswered}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-indigo-400" />
          <span>
            {lang === 'fr'
              ? `Sessions 60s disputées : `
              : `60s sessions played: `}
            <strong className="text-white font-mono">{totalGamesPlayed}</strong>
          </span>
        </div>
      </div>

      {/* 8 Game Mode Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {/* Card 1: Screenle Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-amber-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {lang === 'fr' ? 'Sprint Capture' : 'Framed Sprint'}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {lang === 'fr'
                ? "Reconnaissance visuelle ultra-rapide. Identifiez le jeu à partir d'une capture d'écran parmi 4 propositions avec les touches 1 à 4."
                : "Ultra-fast visual recognition. Identify the game from a screenshot among 4 choices using keys 1 to 4."}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#131a29] border border-[#1e293b] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-amber-400">{stats.screenle.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('screenle')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 2: Indledle Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-emerald-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-emerald-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {lang === 'fr' ? 'Sprint Classic' : 'Classic Sprint'}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {lang === 'fr'
                ? "Quiz express sur l'encyclopédie des pépites. Déduisez en un éclair les années de sortie, les développeurs et les genres majeurs."
                : "Express quiz on indie classics. Deduce release years, developers, and genres in the blink of an eye."}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#131a29] border border-[#1e293b] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-emerald-400">{stats.indledle.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('indledle')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 3: Linkle Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-sky-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-sky-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {lang === 'fr' ? 'Sprint Connexions' : 'Connections Sprint'}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {lang === 'fr'
                ? "Connexions thématiques en rafale. Trouvez le jeu qui correspond à un thème clé ou repérez l'intrus avant la sonnerie du chrono."
                : "Rapid-fire thematic connections. Find the indie gem matching a theme or spot the odd one out before time runs out."}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#131a29] border border-[#1e293b] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-sky-400">{stats.linkle.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('linkle')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-xs transition shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 4: Profille Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-purple-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileSearch className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-purple-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {lang === 'fr' ? 'Sprint Profil' : 'Profile Sprint'}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {lang === 'fr'
                ? "Quiz déduction d'identité express. Retrouvez en un éclair l'année, le studio ou le genre d'un jeu culte avec les touches 1 à 4."
                : "Express identity deduction quiz. Guess the release year, studio, or genre of an indie gem in a flash with keys 1 to 4."}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#131a29] border border-[#1e293b] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-purple-400">{stats.profille.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('profille')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs transition shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 5: Chrono Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-orange-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-orange-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {lang === 'fr' ? 'Sprint Chrono' : 'Timeline Sprint'}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {lang === 'fr'
                ? "Défiez la frise temporelle indé. Comparez les sorties (avant ou après ?), repérez le plus ancien et devinez les millésimes cultes."
                : "Challenge the indie timeline. Compare releases (before or after?), spot the oldest, and guess release years in a flash."}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#131a29] border border-[#1e293b] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-orange-400">{stats.chrono.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('chrono')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 6: Pixel Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-rose-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-rose-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {lang === 'fr' ? 'Sprint Pixel & Silhouette' : 'Pixel Sprint'}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {lang === 'fr'
                ? "Décryptez la mosaïque pixellisée 24px d'un jeu culte en une seconde. Touches 1 à 4 pour valider instantanément."
                : "Decode a 24px pixelated mosaic of an indie classic in one second flat. Keys 1 to 4 to confirm immediately."}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#131a29] border border-[#1e293b] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-rose-400">{stats.pixel.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('pixel')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs transition shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 7: Review Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-cyan-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {lang === 'fr' ? 'Sprint Critique Steam' : 'Steam Review Sprint'}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {lang === 'fr'
                ? "Découvrez le jeu caché derrière de vrais avis Steam de joueurs caviardés (████). Analysez le ton, les heures de jeu et les anecdotes !"
                : "Discover the game hidden behind authentic redacted Steam reviews (████). Analyze tone, playtime, and anecdotes!"}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#131a29] border border-[#1e293b] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-cyan-400">{stats.review.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('review')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs transition shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 8: Blind Test Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-fuchsia-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl group-hover:bg-fuchsia-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
                <Music className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {lang === 'fr' ? 'Sprint Blind Test OST' : 'OST Blind Test Sprint'}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {lang === 'fr'
                ? "Reconnaissance auditive éclair. Écoutez les hooks mélodiques synthétisés au synthé/chiptune et devinez le titre indé en un quart de seconde."
                : "Lightning audio recognition. Listen to synthesized synth/chiptune hooks and identify the indie track in a split second."}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#131a29] border border-[#1e293b] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-fuchsia-400">{stats.blindtest.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('blindtest')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-black text-xs transition shadow-md shadow-fuchsia-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Rules & Arcade Spirit */}
      <div className="p-6 bg-[#0f172a] border border-[#1e293b] rounded-3xl">
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>{lang === 'fr' ? 'Règles Communes du Time Attack' : 'Common Time Attack Rules'}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div>
            <strong className="text-white block mb-1">⏱️ {lang === 'fr' ? 'Chrono 60 Secondes' : '60 Seconds Timer'}</strong>
            {lang === 'fr'
              ? "Chaque partie commence à 60 secondes. La partie s'achève quand le compte à rebours atteint zéro."
              : 'Every run starts at 60 seconds. The session concludes when the timer hits zero.'}
          </div>
          <div>
            <strong className="text-emerald-400 block mb-1">🔥 {lang === 'fr' ? 'Combos & Bonus Temps' : 'Combos & Time Bonus'}</strong>
            {lang === 'fr'
              ? 'Chaque bonne réponse rapporte 100 pts multipliés par votre combo actuel, et ajoute +3 secondes au compteur.'
              : 'Each correct answer earns 100 pts multiplied by your combo, and adds +3 seconds to the clock.'}
          </div>
          <div>
            <strong className="text-rose-400 block mb-1">⚠️ {lang === 'fr' ? "Pénalités d'Erreur" : 'Mistake Penalties'}</strong>
            {lang === 'fr'
              ? 'Chaque mauvaise réponse soustrait -5 secondes au chrono et brise instantanément votre multiplicateur de combo.'
              : 'Each incorrect answer deducts -5 seconds and instantly resets your combo multiplier.'}
          </div>
        </div>
      </div>
    </div>
  );
};
