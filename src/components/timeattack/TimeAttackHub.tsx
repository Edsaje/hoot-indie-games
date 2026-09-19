import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Timer,
  Zap,
  Camera,
  Layers,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  Target,
  FileSearch,
} from 'lucide-react';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { soundFx } from '../../utils/audio';
import { getTimeAttackStats } from '../../utils/timeAttackStorage';
import type { TimeAttackMode } from '../../types/timeAttack';
import { ScreenleSprint } from './ScreenleSprint';
import { IndledleSprint } from './IndledleSprint';
import { LinkleSprint } from './LinkleSprint';
import { ProfilleSprint } from './ProfilleSprint';

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

  const totalAnswered =
    stats.screenle.totalAnswered + stats.indledle.totalAnswered + stats.linkle.totalAnswered + stats.profille.totalAnswered;
  const totalGamesPlayed =
    stats.screenle.gamesPlayed + stats.indledle.gamesPlayed + stats.linkle.gamesPlayed + stats.profille.gamesPlayed;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Le Vol Éclair du Hibou</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          Sprint Time Attack ⚡
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          60 secondes au chronomètre pour chaque jeu. Enchaînez les bonnes réponses, montez votre combo et défiez vos réflexes de passionné d'indés !
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <div
          onClick={() => onOpenLeaderboard?.('screenle')}
          className={`p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center gap-3 shadow-md ${
            onOpenLeaderboard ? 'hover:border-amber-500/40 cursor-pointer transition' : ''
          }`}
          title="Voir le classement mondial Screenle Sprint"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {lang === 'fr' ? 'Record Capture' : 'Framed Record'}
            </div>
            <div className="text-lg font-black text-white font-mono">{stats.screenle.highScore} pts</div>
          </div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('indledle')}
          className={`p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center gap-3 shadow-md ${
            onOpenLeaderboard ? 'hover:border-emerald-500/40 cursor-pointer transition' : ''
          }`}
          title="Voir le classement mondial Indledle Sprint"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Record Classic</div>
            <div className="text-lg font-black text-white font-mono">{stats.indledle.highScore} pts</div>
          </div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('linkle')}
          className={`p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center gap-3 shadow-md ${
            onOpenLeaderboard ? 'hover:border-sky-500/40 cursor-pointer transition' : ''
          }`}
          title="Voir le classement mondial Linkle Sprint"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {lang === 'fr' ? 'Record Connexions' : 'Connections Record'}
            </div>
            <div className="text-lg font-black text-white font-mono">{stats.linkle.highScore} pts</div>
          </div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('profille')}
          className={`p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center gap-3 shadow-md ${
            onOpenLeaderboard ? 'hover:border-purple-500/40 cursor-pointer transition' : ''
          }`}
          title="Voir le classement mondial Profille Sprint"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {lang === 'fr' ? 'Record Profil' : 'Profile Record'}
            </div>
            <div className="text-lg font-black text-white font-mono">{stats.profille.highScore} pts</div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {lang === 'fr' ? 'Pépites trouvées' : 'Gems Found'}
            </div>
            <div className="text-lg font-black text-white font-mono">
              {totalAnswered} <span className="text-xs text-slate-400 font-normal">({totalGamesPlayed} sprints)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Game Mode Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Card 1: Screenle Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Camera className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
              <span>{lang === 'fr' ? 'Sprint Capture' : 'Framed Sprint'}</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {lang === 'fr'
                ? "Reconnaissance visuelle ultra-rapide. Identifiez le jeu à partir d'une capture d'écran parmi 4 propositions avec les touches 1 à 4."
                : "Ultra-fast visual recognition. Identify the game from a screenshot among 4 choices using keys 1 to 4."}
            </p>
          </div>

          <div>
            <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl mb-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-amber-400">{stats.screenle.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('screenle')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 2: Indledle Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-emerald-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-emerald-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
              <span>{lang === 'fr' ? 'Sprint Classic' : 'Classic Sprint'}</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {lang === 'fr'
                ? "Quiz express sur l'encyclopédie des pépites. Déduisez en un éclair les années de sortie, les développeurs et les genres majeurs."
                : "Express quiz on indie classics. Deduce release years, developers, and genres in the blink of an eye."}
            </p>
          </div>

          <div>
            <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl mb-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-emerald-400">{stats.indledle.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('indledle')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 3: Linkle Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-sky-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-sky-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
              <span>{lang === 'fr' ? 'Sprint Connexions' : 'Connections Sprint'}</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {lang === 'fr'
                ? "Connexions thématiques en rafale. Trouvez le jeu qui correspond à un thème clé ou repérez l'intrus avant la sonnerie du chrono."
                : "Rapid-fire thematic connections. Find the indie gem matching a theme or spot the odd one out before time runs out."}
            </p>
          </div>

          <div>
            <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl mb-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-sky-400">{stats.linkle.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('linkle')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-sm transition shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 4: Profille Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border border-[#1e293b] hover:border-purple-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileSearch className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-purple-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
              <span>{lang === 'fr' ? 'Sprint Profil' : 'Profile Sprint'}</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {lang === 'fr'
                ? "Quiz déduction d'identité express. Retrouvez en un éclair l'année, le studio ou le genre d'un jeu culte avec les touches 1 à 4."
                : "Express identity deduction quiz. Guess the release year, studio, or genre of an indie gem in a flash with keys 1 to 4."}
            </p>
          </div>

          <div>
            <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl mb-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'fr' ? 'Meilleur record :' : 'Best Record:'}</span>
              <span className="font-mono font-black text-purple-400">{stats.profille.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('profille')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-sm transition shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Lancer le Sprint' : 'Start Sprint'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Rules & Arcade Spirit */}
      <div className="p-6 bg-[#0f172a] border border-[#1e293b] rounded-3xl">
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>Règles Communes du Time Attack</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div>
            <strong className="text-white block mb-1">⏱️ Chrono 60 Secondes</strong>
            Chaque partie commence à 60 secondes. La partie s'achève quand le compte à rebours atteint zéro.
          </div>
          <div>
            <strong className="text-emerald-400 block mb-1">🔥 Combos & Bonus Temps</strong>
            Chaque bonne réponse rapporte 100 pts multipliés par votre combo actuel, et ajoute +3 secondes au compteur.
          </div>
          <div>
            <strong className="text-rose-400 block mb-1">⚠️ Pénalités d'Erreur</strong>
            Chaque mauvaise réponse soustrait -5 secondes au chrono et brise instantanément votre multiplicateur de combo.
          </div>
        </div>
      </div>
    </div>
  );
};
