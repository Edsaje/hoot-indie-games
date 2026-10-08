import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Sparkles,
  ExternalLink,
  Camera,
  Layers,
  Gamepad2,
  Dice5,
  Calendar,
  CheckCircle2,
  ArrowRight,
  FileSearch,
  History,
  Sliders,
  MessageSquareQuote,
  Music,
  Zap,
  Swords,
} from 'lucide-react';
import { TODAY_DAILY_GEM, TODAY_DATE } from '../../data/dailyGem';
import { useUserAccount } from '../../context/useUserAccount';
import { SteamIcon } from '../common/SteamIcon';
import { ItchIcon } from '../common/ItchIcon';
import { soundFx } from '../../utils/audio';
import { getChallengeStatusForDate } from '../../utils/streakManager';
import { getScheduledDailyGame } from '../../utils/monthlyScheduler';
import type { NavTab } from '../common/Navbar';
import type { ArcadeGameId } from '../arcade/ArcadeModal';
import { SylvestreHudFrame } from '../sylvestre/SylvestreHudFrame';
import { SylvestreBranchDivider } from '../sylvestre/SylvestreBranchDivider';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { getLocalizedText, getTranslatedGenre } from '../../utils/localization';

const GemCatalogSection = React.lazy(() =>
  import('./GemCatalogSection').then((m) => ({ default: m.GemCatalogSection }))
);

interface GemExplorerHomeProps {
  currentDate: string;
  onNavigateTab: (tab: NavTab) => void;
  onOpenArcade: (gameId?: ArcadeGameId) => void;
}

export const GemExplorerHome: React.FC<GemExplorerHomeProps> = ({
  currentDate,
  onNavigateTab,
  onOpenArcade,
}) => {
  const { t, i18n } = useTranslation();
  const { isGameOwned } = useUserAccount();

  // Defer heavy catalog chunk mounting until user scrolls towards the bottom
  const [isCatalogVisible, setIsCatalogVisible] = useState(false);
  const catalogAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsCatalogVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsCatalogVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px' }
    );
    if (catalogAnchorRef.current) {
      observer.observe(catalogAnchorRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // La pépite du jour en vedette (issue du calendrier mensuel déterministe)
  const dailyGem = useMemo(() => {
    if (currentDate === TODAY_DATE) {
      return TODAY_DAILY_GEM;
    }
    return getScheduledDailyGame(currentDate, 'dailyGem');
  }, [currentDate]);

  // Check today's game completion status for all 8 daily disciplines
  const dailyStatus = useMemo(() => {
    return getChallengeStatusForDate(currentDate);
  }, [currentDate]);

  const handleRandomPickFromHero = () => {
    soundFx.playClick();
    const btn = document.querySelector<HTMLButtonElement>('[data-random-pick-trigger]');
    if (btn) {
      btn.click();
    } else {
      document.getElementById('gems-grid-top')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Hero Spotlight: Featured Daily Gem & Nocturnal Woodland Atmosphere */}
      <div className="group relative rounded-2xl sm:rounded-3xl overflow-visible bg-gradient-to-br from-[#093a2b] via-[#05261c] to-[#021711] border-2 border-[#78350f] p-4 sm:p-8 lg:p-10 mb-6 sm:mb-10 shadow-[inset_0_2px_2px_rgba(217,119,6,0.3),0_16px_40px_rgba(0,0,0,0.8)]">
        {/* Living Creeping Ivy Frame Contour */}
        <SylvestreIvyFrame density="medium" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>{t('home.gemExplorer')}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t('home.heroTitlePart1')}<span className="text-amber-400">{t('home.heroTitleHighlight')}</span>
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {t('home.heroDesc')}
            </p>

            {/* Quick Action Buttons (Optimized Mobile-First Thumb Targets) */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigateTab('screenle');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer touch-manipulation"
              >
                <Camera className="w-4 h-4" />
                <span>{t('home.playDailyChallenge')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 sm:flex sm:w-auto gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={handleRandomPickFromHero}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#0b0f19] hover:bg-slate-800 text-slate-200 border border-emerald-900/40 hover:border-amber-500/50 text-xs sm:text-sm font-bold transition shadow cursor-pointer touch-manipulation"
                >
                  <Dice5 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t('home.randomGem')}</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onNavigateTab('microindies');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-900/80 to-[#06241b] hover:from-emerald-800 hover:to-emerald-700 text-emerald-200 border border-emerald-500/40 hover:border-amber-400 text-xs sm:text-sm font-bold transition shadow cursor-pointer touch-manipulation"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t('home.microIndiesBtn', 'Micro-Indés')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Featured Daily Gem Card */}
          <div className="lg:col-span-5 w-full">
            <SylvestreHudFrame
              variant="wood"
              accent="amber"
              withLeaves={true}
              interactive={true}
            >
              <div className="p-3.5 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
                    ⭐ {t('home.dailyGem')}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-200/80 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    {currentDate}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3 border border-[#4a3424] shadow-inner">
                  <picture className="w-full h-full block">
                    {currentDate === TODAY_DATE && (
                      <source media="(max-width: 640px)" srcSet="/daily-hero-mobile.webp?v=1" type="image/webp" />
                    )}
                    <img
                      src={currentDate === TODAY_DATE ? '/daily-hero.webp?v=1' : (dailyGem.screenshots[5] || dailyGem.screenshots[0] || '').replace('1920x1080.jpg', '600x338.jpg')}
                      alt={dailyGem.title}
                      width={520}
                      height={292}
                      fetchPriority="high"
                      decoding="sync"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = (dailyGem.screenshots[5] || dailyGem.screenshots[0] || '').replace('1920x1080.jpg', '600x338.jpg');
                        if (target.src !== fallback) {
                          target.srcset = '';
                          target.src = fallback;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </picture>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-xs font-mono font-bold text-amber-400 border border-amber-500/30 shadow">
                    {dailyGem.releaseYear}
                  </div>
                </div>

                <div>
                  {isGameOwned(dailyGem.steamUrl) && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-md">
                      <SteamIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('home.inYourSteamLibrary')}</span>
                    </div>
                  )}
                  <h2 className="text-xl font-black text-[#fef3c7] group-hover:text-amber-300 transition mb-1 drop-shadow-sm">
                    {dailyGem.title}
                  </h2>
                  <p className="text-xs text-amber-200/60 mb-2">
                    {dailyGem.developer}
                  </p>
                  <p className="text-xs text-slate-200/90 italic mb-3 line-clamp-2">
                    "{getLocalizedText(dailyGem.hints?.tagline, i18n.language)}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {dailyGem.genre.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-md bg-[#251a14] text-amber-100/80 text-[11px] font-medium border border-[#4a3424]"
                      >
                        {getTranslatedGenre(g, i18n.language)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#4a3424]/70 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {dailyGem.steamUrl && (
                    <a
                      href={dailyGem.steamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 active:scale-98 border border-amber-300"
                    >
                      <SteamIcon className="w-3.5 h-3.5 text-slate-950" />
                      <span>{t('home.discoverOnSteam')}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                    </a>
                  )}
                  {dailyGem.itchUrl && (
                    <a
                      href={dailyGem.itchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#fa5c5c]/15 hover:bg-[#fa5c5c]/25 text-[#fa5c5c] text-xs font-bold transition border border-[#fa5c5c]/40 hover:border-[#fa5c5c]/70 active:scale-98 ${
                        !dailyGem.steamUrl ? 'w-full' : ''
                      }`}
                    >
                      <ItchIcon className="w-3.5 h-3.5 text-[#fa5c5c]" />
                      <span>Itch.io</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {!dailyGem.steamUrl && !dailyGem.itchUrl && (
                    <div className="w-full text-center text-xs text-amber-200/60 italic py-1">{t('home.certifiedDailyGem')}</div>
                  )}
                </div>
              </div>
            </SylvestreHudFrame>
          </div>
        </div>
      </div>

      {/* Living Forest Branch Divider with Animated Rustling Leaves */}
      <SylvestreBranchDivider glow="amber" withLeaves={true} className="my-10" />

      {/* Daily Games Launchpad */}
      <div className="mb-12" style={{ contentVisibility: 'auto', containIntrinsicSize: '650px' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t('home.dailyChallengesTitle')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('home.dailyChallengesSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('minigames');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#131a29] hover:bg-[#1e293b] border border-[#1e293b] hover:border-amber-500/50 text-xs font-bold text-amber-400 transition cursor-pointer self-end sm:self-auto"
          >
            <span>{t('home.hubBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Daily Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Card 1: Screenle */}
          <a
            href="#screenle"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('screenle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-cyan-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Camera className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.screenle === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    1. {t('minigamesHub.screenle.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition mb-1">
                {t('minigamesHub.screenle.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.screenle.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Card 2: Indledle */}
          <a
            href="#indledle"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('indledle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-amber-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.indledle === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    2. {t('minigamesHub.indledle.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition mb-1">
                {t('minigamesHub.indledle.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.indledle.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Card 3: Linkle */}
          <a
            href="#linkle"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('linkle');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-purple-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.linkle === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    3. {t('minigamesHub.linkle.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-purple-400 transition mb-1">
                {t('minigamesHub.linkle.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.linkle.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Card 4: Profille */}
          <a
            href="#profille"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('profille');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <FileSearch className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.profille === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    4. {t('minigamesHub.profille.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition mb-1">
                {t('minigamesHub.profille.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.profille.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Card 5: Chrono */}
          <a
            href="#chrono"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('chrono');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-teal-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                  <History className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.chrono === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    5. {t('minigamesHub.chrono.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-teal-400 transition mb-1">
                {t('minigamesHub.chrono.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.chrono.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Card 6: Pixel */}
          <a
            href="#pixel"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('pixel');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-indigo-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Sliders className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.pixel === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    6. {t('minigamesHub.pixel.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition mb-1">
                {t('minigamesHub.pixel.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.pixel.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Card 7: Review */}
          <a
            href="#review"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('review');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-rose-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <MessageSquareQuote className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.review === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    7. {t('minigamesHub.review.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-rose-400 transition mb-1">
                {t('minigamesHub.review.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.review.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Card 8: Blind Test */}
          <a
            href="#blindtest"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('blindtest');
            }}
            className="group relative bg-[#131a29] hover:bg-[#182235] border border-[#1e293b] hover:border-violet-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <Music className="w-4.5 h-4.5" />
                </div>
                {dailyStatus.blindtest === 'won' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('minigamesHub.solved')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    8. {t('minigamesHub.blindtest.title')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-violet-400 transition mb-1">
                {t('minigamesHub.blindtest.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {t('minigamesHub.blindtest.desc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playChallenge')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>
        </div>

        {/* Competitive & Arcade Trio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Trio 1: Time Attack */}
          <a
            href="#timeattack"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('timeattack');
            }}
            className="group relative bg-gradient-to-r from-[#0d3f30]/80 via-[#07281e] to-[#03150f] hover:from-[#114f3c] border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                  {t('home.sprintsBadge')}
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition mb-1">
                {t('home.sprintsTitle')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {t('home.sprintsDesc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.launchSprint')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Trio 2: Versus 1v1 */}
          <a
            href="#versus"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              onNavigateTab('versus');
            }}
            className="group relative bg-gradient-to-r from-[#0d3f30]/80 via-[#07281e] to-[#03150f] hover:from-[#114f3c] border-2 border-rose-500/50 hover:border-rose-400 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left no-underline block"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                  <Swords className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-black uppercase tracking-wider">
                  {t('home.versusBadge')}
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-rose-400 transition mb-1">
                {t('home.versusTitle')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {t('home.versusDesc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.createRoom')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Trio 3: Arcade */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenArcade('snake');
            }}
            className="group relative bg-gradient-to-r from-[#0d3f30]/80 via-[#07281e] to-[#03150f] hover:from-[#114f3c] border-2 border-emerald-500/50 hover:border-emerald-400 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left w-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                  {t('home.arcadeBadge')}
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition mb-1">
                {t('home.arcadeTitle')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {t('home.arcadeDesc')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>{t('home.playArcade')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Living Forest Branch Divider with Animated Rustling Leaves */}
      <SylvestreBranchDivider glow="emerald" withLeaves={true} className="my-10" />

      {/* Interactive Catalog Section (Lazy Loaded on viewport approach) */}
      <div ref={catalogAnchorRef}>
        {isCatalogVisible ? (
          <React.Suspense
            fallback={
              <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
                  {t('catalog.loadingCatalog', 'Chargement du Sanctuaire...')}
                </span>
              </div>
            }
          >
            <GemCatalogSection onNavigateTab={onNavigateTab} />
          </React.Suspense>
        ) : (
          <div className="py-16 text-center text-slate-600/40 select-none font-mono text-xs" aria-hidden="true">
            ✦
          </div>
        )}
      </div>
    </div>
  );
};
