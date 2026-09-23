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
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';

interface TimeAttackHubProps {
  initialMode?: TimeAttackMode;
  onOpenLeaderboard?: (mode?: TimeAttackMode) => void;
}

export const TimeAttackHub: React.FC<TimeAttackHubProps> = ({ initialMode, onOpenLeaderboard }) => {
  const { t } = useTranslation();
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
    return (
      <ScreenleSprint
        games={allPlayableGames}
        onBackToHub={handleBackToHub}
        onOpenLeaderboard={() => onOpenLeaderboard?.('screenle')}
      />
    );
  }

  if (activeMode === 'indledle') {
    return (
      <IndledleSprint
        games={allPlayableGames}
        onBackToHub={handleBackToHub}
        onOpenLeaderboard={() => onOpenLeaderboard?.('indledle')}
      />
    );
  }

  if (activeMode === 'linkle') {
    return (
      <LinkleSprint
        games={allPlayableGames}
        onBackToHub={handleBackToHub}
        onOpenLeaderboard={() => onOpenLeaderboard?.('linkle')}
      />
    );
  }

  if (activeMode === 'profille') {
    return (
      <ProfilleSprint
        games={allPlayableGames}
        onBackToHub={handleBackToHub}
        onOpenLeaderboard={() => onOpenLeaderboard?.('profille')}
      />
    );
  }

  if (activeMode === 'chrono') {
    return (
      <ChronoSprint
        games={allPlayableGames}
        onBackToHub={handleBackToHub}
        onOpenLeaderboard={() => onOpenLeaderboard?.('chrono')}
      />
    );
  }

  if (activeMode === 'pixel') {
    return (
      <PixelSprint
        games={allPlayableGames}
        onBackToHub={handleBackToHub}
        onOpenLeaderboard={() => onOpenLeaderboard?.('pixel')}
      />
    );
  }

  if (activeMode === 'review') {
    return (
      <ReviewSprint
        games={allPlayableGames}
        onBackToHub={handleBackToHub}
        onOpenLeaderboard={() => onOpenLeaderboard?.('review')}
      />
    );
  }

  if (activeMode === 'blindtest') {
    return (
      <BlindTestSprint
        games={allPlayableGames}
        onBackToHub={handleBackToHub}
        onOpenLeaderboard={() => onOpenLeaderboard?.('blindtest')}
      />
    );
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
          <span>{t('timeattack.owlSprint')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          {t('timeattack.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t('timeattack.subtitle')}
        </p>

        {onOpenLeaderboard && (
          <div className="mt-5 flex items-center justify-center">
            <button
              onClick={() => onOpenLeaderboard('screenle')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm transition shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{t('timeattack.globalLeaderboard')}</span>
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
          title={t('timeattack.screenle.title')}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{t('nav.screenle')}</span>
            <Camera className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.screenle.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('indledle')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-emerald-500/40 cursor-pointer transition' : ''
          }`}
          title={t('timeattack.indledle.title')}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{t('nav.indledle')}</span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.indledle.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('linkle')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-sky-500/40 cursor-pointer transition' : ''
          }`}
          title={t('timeattack.linkle.title')}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{t('nav.linkle')}</span>
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.linkle.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('profille')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-purple-500/40 cursor-pointer transition' : ''
          }`}
          title={t('timeattack.profille.title')}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{t('nav.profille')}</span>
            <FileSearch className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.profille.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('chrono')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-orange-500/40 cursor-pointer transition' : ''
          }`}
          title={t('timeattack.chrono.title')}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{t('nav.chrono')}</span>
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.chrono.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('pixel')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-rose-500/40 cursor-pointer transition' : ''
          }`}
          title={t('timeattack.pixel.title')}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{t('nav.pixel')}</span>
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.pixel.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('review')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-cyan-500/40 cursor-pointer transition' : ''
          }`}
          title={t('timeattack.review.title')}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{t('nav.review')}</span>
            <MessageSquareQuote className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-black text-white font-mono">{stats.review.highScore} pts</div>
        </div>

        <div
          onClick={() => onOpenLeaderboard?.('blindtest')}
          className={`p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between shadow-md ${
            onOpenLeaderboard ? 'hover:border-fuchsia-500/40 cursor-pointer transition' : ''
          }`}
          title={t('timeattack.blindtest.title')}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{t('nav.blindtest')}</span>
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
            {t('timeattack.totalGuessed')}{' '}
            <strong className="text-white font-mono">{totalAnswered}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-indigo-400" />
          <span>
            {t('timeattack.sessionsPlayed')}{' '}
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
          className="relative bg-[#0f172a] border-2 border-[#78350f] hover:border-amber-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-visible"
        >
          <SylvestreIvyFrame density="delicate" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0f19] border border-[#0d543e] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {t('timeattack.screenle.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {t('timeattack.screenle.desc')}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#0b0f19] border border-[#0d543e] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('timeattack.bestRecord')}</span>
              <span className="font-mono font-black text-amber-400">{stats.screenle.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('screenle')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <span>{t('timeattack.startSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 2: Indledle Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border-2 border-[#78350f] hover:border-emerald-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-visible"
        >
          <SylvestreIvyFrame density="delicate" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0f19] border border-[#0d543e] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-emerald-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {t('timeattack.indledle.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {t('timeattack.indledle.desc')}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#0b0f19] border border-[#0d543e] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('timeattack.bestRecord')}</span>
              <span className="font-mono font-black text-emerald-400">{stats.indledle.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('indledle')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <span>{t('timeattack.startSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 3: Linkle Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border-2 border-[#78350f] hover:border-sky-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-visible"
        >
          <SylvestreIvyFrame density="delicate" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0f19] border border-[#0d543e] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-sky-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {t('timeattack.linkle.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {t('timeattack.linkle.desc')}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#0b0f19] border border-[#0d543e] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('timeattack.bestRecord')}</span>
              <span className="font-mono font-black text-sky-400">{stats.linkle.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('linkle')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-xs transition shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer"
            >
              <span>{t('timeattack.startSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 4: Profille Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border-2 border-[#78350f] hover:border-purple-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-visible"
        >
          <SylvestreIvyFrame density="delicate" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileSearch className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0f19] border border-[#0d543e] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-purple-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {t('timeattack.profille.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {t('timeattack.profille.desc')}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#0b0f19] border border-[#0d543e] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('timeattack.bestRecord')}</span>
              <span className="font-mono font-black text-purple-400">{stats.profille.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('profille')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs transition shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer"
            >
              <span>{t('timeattack.startSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 5: Chrono Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border-2 border-[#78350f] hover:border-orange-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-visible"
        >
          <SylvestreIvyFrame density="delicate" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0f19] border border-[#0d543e] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-orange-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {t('timeattack.chrono.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {t('timeattack.chrono.desc')}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#0b0f19] border border-[#0d543e] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('timeattack.bestRecord')}</span>
              <span className="font-mono font-black text-orange-400">{stats.chrono.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('chrono')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <span>{t('timeattack.startSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 6: Pixel Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border-2 border-[#78350f] hover:border-rose-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-visible"
        >
          <SylvestreIvyFrame density="delicate" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0f19] border border-[#0d543e] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-rose-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {t('timeattack.pixel.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {t('timeattack.pixel.desc')}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#0b0f19] border border-[#0d543e] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('timeattack.bestRecord')}</span>
              <span className="font-mono font-black text-rose-400">{stats.pixel.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('pixel')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs transition shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer"
            >
              <span>{t('timeattack.startSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 7: Review Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border-2 border-[#78350f] hover:border-cyan-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-visible"
        >
          <SylvestreIvyFrame density="delicate" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0f19] border border-[#0d543e] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {t('timeattack.review.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {t('timeattack.review.desc')}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#0b0f19] border border-[#0d543e] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('timeattack.bestRecord')}</span>
              <span className="font-mono font-black text-cyan-400">{stats.review.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('review')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs transition shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <span>{t('timeattack.startSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Card 8: Blind Test Sprint */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#0f172a] border-2 border-[#78350f] hover:border-fuchsia-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition group overflow-visible"
        >
          <SylvestreIvyFrame density="delicate" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl group-hover:bg-fuchsia-500/20 transition pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
                <Music className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0f19] border border-[#0d543e] text-slate-300 font-mono text-xs font-bold">
                <Timer className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>60s</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-2">
              {t('timeattack.blindtest.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {t('timeattack.blindtest.desc')}
            </p>
          </div>

          <div>
            <div className="p-2.5 bg-[#0b0f19] border border-[#0d543e] rounded-xl mb-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('timeattack.bestRecord')}</span>
              <span className="font-mono font-black text-fuchsia-400">{stats.blindtest.highScore} pts</span>
            </div>

            <button
              onClick={() => handleLaunchMode('blindtest')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-black text-xs transition shadow-md shadow-fuchsia-500/20 active:scale-95 cursor-pointer"
            >
              <span>{t('timeattack.startSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Rules & Arcade Spirit */}
      <div className="group relative p-6 bg-[#072a20] border-2 border-[#78350f] rounded-3xl overflow-visible">
        <SylvestreIvyFrame density="delicate" />
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>{t('timeattack.rulesTitle')}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div>
            <strong className="text-white block mb-1">⏱️ {t('timeattack.ruleTimerTitle')}</strong>
            {t('timeattack.ruleTimerDesc')}
          </div>
          <div>
            <strong className="text-emerald-400 block mb-1">🔥 {t('timeattack.ruleComboTitle')}</strong>
            {t('timeattack.ruleComboDesc')}
          </div>
          <div>
            <strong className="text-rose-400 block mb-1">⚠️ {t('timeattack.ruleMistakesTitle')}</strong>
            {t('timeattack.ruleMistakesDesc')}
          </div>
        </div>
      </div>
    </div>
  );
};
