import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Volume2,
  VolumeX,
  BarChart3,
  Globe,
  Feather,
  Wrench,
  Calendar,
  Gamepad2,
  LogIn,
  Flame,
  Puzzle,
  Trophy,
  Crown,
  Database,
  Layers,
  Check,
  ChevronDown,
  Sparkles,
  Users,
  ShoppingBag,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OwlLogo } from './OwlLogo';
import { SteamIcon } from './SteamIcon';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';
import { useUserAccount } from '../../context/useUserAccount';
import { useFriends } from '../../context/useFriends';
import { useChat } from '../../context/useChat';
import { SUPPORTED_LANGUAGES, getAppLanguage, type AppLanguage } from '../../utils/localization';
import { INDIE_AVATARS } from '../../data/avatars';
import { telemetry } from '../../services/telemetry';
import { getTodayDateString, getYesterdayDateString } from '../../utils/streakManager';
import { formatFeathers } from '../../utils/featherEconomy';

export type NavTab =
  | 'gems'
  | 'microindies'
  | 'catalog'
  | 'minigames'
  | 'screenle'
  | 'indledle'
  | 'linkle'
  | 'profille'
  | 'chrono'
  | 'pixel'
  | 'review'
  | 'blindtest'
  | 'versus'
  | 'ranking'
  | 'arcade'
  | 'cards'
  | 'timeattack'
  | 'toolbox'
  | 'roost';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  onOpenCalendar: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenLeaderboard?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenFriends?: () => void;
  onOpenShop?: () => void;
  onEasterEggTrigger: () => void;
  currentDate: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenStats,
  onOpenAchievements,
  onOpenCalendar,
  onOpenProfile,
  onOpenAuth,
  onOpenLeaderboard,
  onOpenAdminDashboard,
  onOpenFriends,
  onOpenShop,
  onEasterEggTrigger,
  currentDate,
}) => {
  const { t, i18n } = useTranslation();
  const { feathersCount, unlockAchievement } = useAchievements();
  const { profile, isAuthenticated, isAdmin, isSteamConnected, steamAccount, logout } = useUserAccount();
  const { totalFriendsCount, friendsActiveTodayCount, friendsOnlineCount } = useFriends();
  const { openChat, unreadCount } = useChat();
  const [soundEnabled, setSoundEnabled] = useState(soundFx.isEnabled());

  const currentAvatar = INDIE_AVATARS.find((a) => a.id === profile.avatarId) || INDIE_AVATARS[0];
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString(todayStr);
  const isYesterday = currentDate === yesterdayStr;

  const handleTabSelect = (tab: NavTab, e?: React.MouseEvent) => {
    if (e && (e.button === 1 || e.ctrlKey || e.metaKey || e.shiftKey)) {
      return; // Clic molette ou touche modificatrice : laisser le navigateur ouvrir dans un nouvel onglet
    }
    if (e) {
      e.preventDefault();
    }
    soundFx.playClick();
    telemetry.track('navigation', 'tab_change', tab);
    onTabChange(tab);
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.location.hash = tab === 'gems' ? '#gems' : `#${tab}`;
    }
  };

  const isMinigamesActive =
    currentTab === 'minigames' ||
    ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'timeattack', 'versus'].includes(currentTab);

  const toggleSound = () => {
    const next = soundFx.toggleSound();
    setSoundEnabled(next);
    telemetry.track('interaction', 'sound_toggle', next ? 'on' : 'off');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const playerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentLangCode = getAppLanguage(i18n.language);
  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.id === currentLangCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangMenuOpen(false);
      }
      if (playerMenuRef.current && !playerMenuRef.current.contains(target)) {
        setIsPlayerMenuOpen(false);
      }
    };
    if (isLangMenuOpen || isPlayerMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isLangMenuOpen, isPlayerMenuOpen]);

  const selectLanguage = (langId: AppLanguage) => {
    soundFx.playClick();
    i18n.changeLanguage(langId);
    unlockAchievement('polyglot');
    telemetry.track('interaction', 'language_select', langId);
    setIsLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-[48] w-full max-w-full bg-[#010805]/90 backdrop-blur-md border-b border-[#78350f] shadow-lg shadow-black/50">
      {/* Sylvestre Canopy Emerald Trim on bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent pointer-events-none" />

      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[72px] lg:h-[76px] gap-1.5 sm:gap-3">
          {/* Brand & Owl Logo + Burger Menu on Mobile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Burger Menu Button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsMobileMenuOpen((prev) => !prev);
              }}
              className="xl:hidden p-2 rounded-xl bg-[#06241b] border border-[#78350f] text-amber-400 hover:text-white hover:border-amber-400 transition flex items-center justify-center shrink-0 min-h-[38px] min-w-[38px] cursor-pointer touch-manipulation"
              title={isMobileMenuOpen ? 'Fermer le menu' : 'Menu des onglets'}
              aria-label="Menu principal"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-amber-300" />
              ) : (
                <Menu className="w-5 h-5 text-amber-400" />
              )}
            </button>

            <OwlLogo onEasterEggTrigger={onEasterEggTrigger} size="md" />
            <div
              className="cursor-pointer select-none"
              onClick={() => handleTabSelect('gems')}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base lg:text-lg font-black text-white tracking-wider flex items-center gap-1 whitespace-nowrap">
                  HOOT <span className="text-[#f59e0b]">INDIE</span>
                  <span className="hidden sm:inline"> GAMES</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs (Consolidated 7 tabs, Desktop xl+) */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 bg-[#06241b] p-1 rounded-2xl border border-[#78350f] shrink-0">
            {/* 1. Pépites */}
            <a
              href="#gems"
              onClick={(e) => handleTabSelect('gems', e)}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'gems'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.gems')}</span>
            </a>

            {/* 2. Micro-Indés & Itch.io */}
            <a
              href="#microindies"
              onClick={(e) => handleTabSelect('microindies', e)}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'microindies'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{t('nav.microindies', 'Micro-Indés')}</span>
              <span
                className={`hidden min-[1800px]:inline text-[9px] font-black px-1 py-0.2 rounded border ${
                  currentTab === 'microindies'
                    ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                Itch
              </span>
            </a>

            {/* 3. Catalogue */}
            <a
              href="#catalog"
              onClick={(e) => handleTabSelect('catalog', e)}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.catalog', 'Catalogue')}</span>
            </a>

            {/* 3. Mini-jeux */}
            <a
              href="#minigames"
              onClick={(e) => handleTabSelect('minigames', e)}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isMinigamesActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.games', 'Mini-Jeux')}</span>
              <span
                className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                  isMinigamesActive
                    ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                11
              </span>
            </a>

            {/* 4. Arcade */}
            <a
              href="#arcade"
              onClick={(e) => handleTabSelect('arcade', e)}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'arcade'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.arcade')}</span>
            </a>

            {/* 5. Cartes */}
            <a
              href="#cards"
              onClick={(e) => handleTabSelect('cards', e)}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'cards'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.cards', 'Cartes')}</span>
            </a>

            <div className="h-4 w-px bg-[#78350f] mx-0.5 xl:mx-1 shrink-0" />

            {/* 4. Boîte à Outils */}
            <a
              href="#toolbox"
              onClick={(e) => handleTabSelect('toolbox', e)}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'toolbox'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.toolbox')}</span>
            </a>

            {/* 5. Le Perchoir */}
            <a
              href="#roost"
              onClick={(e) => handleTabSelect('roost', e)}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'roost'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Feather className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.roost')}</span>
            </a>
          </nav>

          {/* Right Action Icons (Optimized for Mobile-First Display) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Daily Date Button (Opens Calendar) - Visible on min-[1800px] to preserve nav headroom */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenCalendar();
              }}
              className={`hidden min-[1800px]:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono transition cursor-pointer min-h-[36px] ${
                isYesterday
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-[#06241b] border-[#78350f] text-slate-300 hover:text-white hover:border-amber-500/40'
              }`}
              title={
                isYesterday
                  ? t('nav.yesterdayTip')
                  : t('nav.calendarTip')
              }
            >
              {isYesterday ? (
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              ) : (
                <Calendar className="w-3.5 h-3.5 text-[#f59e0b]" />
              )}
              <span>{currentDate}</span>
              {isYesterday && (
                <span className="text-[10px] font-black text-amber-300 px-1 py-0.2 rounded bg-amber-500/20">
                  J-1
                </span>
              )}
            </button>

            {/* Bouton Son direct (visible sur sm+, accessible dans le menu joueur sur mobile) */}
            <button
              onClick={toggleSound}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-xl bg-[#06241b] border border-[#78350f] text-slate-300 hover:text-white hover:bg-slate-800 transition shrink-0 cursor-pointer min-h-[36px] items-center justify-center touch-manipulation"
              title={soundEnabled ? t('nav.soundOn') : t('nav.soundOff')}
              aria-label={soundEnabled ? t('nav.soundOn') : t('nav.soundOff')}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Unified Player Records, Trophies & Stats Dropdown */}
            <div className="relative" ref={playerMenuRef}>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsPlayerMenuOpen(!isPlayerMenuOpen);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#06241b] border transition shrink-0 cursor-pointer min-h-[36px] touch-manipulation ${
                  isPlayerMenuOpen
                    ? 'border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                    : 'border-[#78350f] text-slate-200 hover:border-amber-500/50 hover:text-amber-300'
                }`}
                title={t('nav.playerHubTip')}
                aria-label={t('nav.playerHub')}
                aria-expanded={isPlayerMenuOpen}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="flex items-center gap-1 font-mono text-amber-300 text-xs font-bold">
                  <Feather className="hidden min-[1800px]:inline w-3 h-3 text-amber-400/90" />
                  <span>{formatFeathers(feathersCount)}</span>
                </div>
                <ChevronDown
                  className={`hidden min-[1800px]:inline w-3 h-3 text-slate-400 transition-transform duration-200 ${
                    isPlayerMenuOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              {isPlayerMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 py-1.5 rounded-2xl bg-[#06241b] border-2 border-[#78350f] shadow-2xl shadow-black/90 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-emerald-400/80 border-b border-[#78350f]/60 mb-1 flex items-center justify-between">
                    <span>{t('nav.playerHub')}</span>
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-black">
                      <Feather className="w-3 h-3 text-amber-400" />
                      {formatFeathers(feathersCount)}
                    </span>
                  </div>

                  {/* Contrôle du Son (pratique sur mobile pour couper/activer le son sans encombrer la barre) */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleSound();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition cursor-pointer hover:bg-[#03150f] group text-left border-b border-[#78350f]/40 pb-2 mb-1"
                  >
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center transition shrink-0 ${
                      soundEnabled
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}>
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-100 font-bold group-hover:text-amber-300 flex items-center justify-between">
                        <span>{t('nav.soundTitle', 'Effets Sonores')}</span>
                        <span className={`text-[10px] font-mono font-bold ${soundEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {soundEnabled ? t('nav.soundOn', 'Activés') : t('nav.soundOff', 'Coupés')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {soundEnabled ? 'Audio et effets actifs' : 'Audio en sourdine'}
                      </p>
                    </div>
                  </button>

                  {/* 1. Succès */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsPlayerMenuOpen(false);
                      onOpenAchievements();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition cursor-pointer hover:bg-[#03150f] group text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:border-amber-400 transition shrink-0">
                      <Feather className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-100 font-bold group-hover:text-amber-300 flex items-center justify-between">
                        <span>{t('nav.achievements')}</span>
                        <span className="text-[10px] font-mono text-amber-400/90">{formatFeathers(feathersCount)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {t('nav.achievementsDesc')}
                      </p>
                    </div>
                  </button>

                  {/* 2. Classements */}
                  {onOpenLeaderboard && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsPlayerMenuOpen(false);
                        onOpenLeaderboard();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition cursor-pointer hover:bg-[#03150f] group text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-105 group-hover:border-yellow-400 transition shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-100 font-bold group-hover:text-amber-300">
                          {t('nav.leaderboards')}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {t('nav.leaderboardsDesc')}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 3. Statistiques */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsPlayerMenuOpen(false);
                      onOpenStats();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition cursor-pointer hover:bg-[#03150f] group text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-400 transition shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-100 font-bold group-hover:text-emerald-300">
                        {t('nav.stats')}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {t('nav.statsDesc')}
                      </p>
                    </div>
                  </button>

                  {/* Compagnons (Amis & Duels 1v1) */}
                  {onOpenFriends && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsPlayerMenuOpen(false);
                        onOpenFriends();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition cursor-pointer hover:bg-[#03150f] group text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-400 transition shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-100 font-bold group-hover:text-emerald-300 flex items-center justify-between">
                          <span>Compagnons</span>
                          {totalFriendsCount > 0 && (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              {friendsOnlineCount > 0 ? `${friendsOnlineCount} en ligne` : `${friendsActiveTodayCount}/${totalFriendsCount} actif${friendsActiveTodayCount > 1 ? 's' : ''}`}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          Scores d'amis & duels 1v1
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 4. Calendrier quotidien */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsPlayerMenuOpen(false);
                      onOpenCalendar();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition cursor-pointer hover:bg-[#03150f] group text-left border-t border-[#78350f]/40 mt-1 pt-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:border-amber-400 transition shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-100 font-bold group-hover:text-amber-300 flex items-center justify-between">
                        <span>{t('nav.calendar')}</span>
                        <span className="text-[10px] font-mono text-slate-400">{currentDate}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {isYesterday ? t('nav.yesterdayTip') : t('nav.calendarTip')}
                      </p>
                    </div>
                  </button>

                  {/* 5. Boutique du Sanctuaire */}
                  {onOpenShop && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsPlayerMenuOpen(false);
                        onOpenShop();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition cursor-pointer hover:bg-[#03150f] group text-left border-t border-[#78350f]/40 mt-1 pt-2"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-105 group-hover:border-amber-400 transition shrink-0">
                        <ShoppingBag className="w-4 h-4 text-amber-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-amber-300 font-bold group-hover:text-amber-200 flex items-center justify-between">
                          <span>Boutique du Sanctuaire</span>
                          <span className="text-[10px] font-mono text-amber-400 font-black">🪶 Shop</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          Avatars, titres, cadres & renommage express
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 6. Tchat Communautaire & Feedback */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsPlayerMenuOpen(false);
                      openChat();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition cursor-pointer hover:bg-[#03150f] group text-left border-t border-[#78350f]/40 mt-1 pt-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-105 group-hover:border-emerald-400 transition shrink-0">
                      <MessageSquare className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-emerald-300 font-bold group-hover:text-emerald-200 flex items-center justify-between">
                        <span>{t('chat.discussion')} ({t('nav.roost')})</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">💬 Salons & Idées</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Discussions mondiales, salons multilingues & retours
                      </p>
                    </div>
                  </button>

                  {/* 7. Déconnexion (quand connecté) */}
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={async () => {
                        soundFx.playClick();
                        setIsPlayerMenuOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition cursor-pointer hover:bg-rose-950/40 text-rose-400 group text-left border-t border-[#78350f]/40 mt-1 pt-2"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition shrink-0">
                        <LogOut className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-rose-300 font-bold group-hover:text-rose-200 flex items-center justify-between">
                          <span>Se déconnecter</span>
                          <span className="text-[10px] font-mono text-rose-400/80">Déconnexion</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          Quitter la session ({profile.username})
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher Dropdown - Ultra-compact on mobile, full on desktop */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsLangMenuOpen(!isLangMenuOpen);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#06241b] border transition shrink-0 cursor-pointer min-h-[36px] sm:min-h-[40px] touch-manipulation ${
                  isLangMenuOpen
                    ? 'border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                    : 'border-[#78350f] text-slate-200 hover:border-amber-500/50 hover:text-amber-400'
                }`}
                title={t('nav.switchLang')}
                aria-label={t('nav.switchLang')}
                aria-expanded={isLangMenuOpen}
              >
                <Globe className="hidden min-[1800px]:inline w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                <span className="text-xs shrink-0">{currentLangMeta.flag}</span>
                <span className="font-mono text-[11px] sm:text-xs font-bold">{currentLangMeta.shortCode}</span>
                <ChevronDown className={`hidden min-[1800px]:inline w-3 h-3 text-slate-400 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 py-1.5 rounded-2xl bg-[#06241b] border-2 border-[#78350f] shadow-2xl shadow-black/90 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-emerald-400/80 border-b border-[#78350f]/60 mb-1 flex items-center justify-between">
                    <span>{t('nav.switchLang')}</span>
                    <span className="text-[9px] text-amber-400 font-mono">6 langues</span>
                  </div>
                  {SUPPORTED_LANGUAGES.map((langOption) => {
                    const isSelected = currentLangCode === langOption.id;
                    return (
                      <button
                        key={langOption.id}
                        type="button"
                        onClick={() => selectLanguage(langOption.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition cursor-pointer min-h-[38px] text-left ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 font-bold border-l-2 border-amber-400'
                            : 'text-slate-300 hover:bg-[#03150f] hover:text-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm leading-none">{langOption.flag}</span>
                          <span className="font-mono text-[11px] text-amber-200/70 font-semibold">{langOption.shortCode}</span>
                          <span className="text-slate-200 text-xs">{langOption.nativeLabel}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Admin Dashboard Direct Shortcut (visible uniquement quand l'utilisateur est authentifié sur un compte admin) */}
            {isAuthenticated && isAdmin && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  if (onOpenAdminDashboard) {
                    onOpenAdminDashboard();
                  } else {
                    window.open('/api/track.php', '_blank');
                  }
                }}
                className="hidden sm:flex p-1.5 sm:p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 hover:bg-amber-500/30 transition items-center justify-center shrink-0 min-h-[40px] shadow-sm shadow-amber-500/10 cursor-pointer group touch-manipulation"
                title="Tableau de Bord Administrateur (👑 Accès Souverain)"
                aria-label="Tableau de Bord Administrateur"
              >
                <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* Friends / Cercle des Compagnons Direct Button */}
            {onOpenFriends && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenFriends();
                }}
                className="p-2 rounded-xl bg-[#06241b] border border-[#78350f] text-emerald-300 hover:text-white hover:border-emerald-500/50 hover:bg-[#093a2b] transition flex items-center justify-center shrink-0 min-h-[40px] cursor-pointer relative group touch-manipulation"
                title={
                  friendsOnlineCount > 0
                    ? `Cercle des Compagnons (${friendsOnlineCount} en ligne)`
                    : 'Cercle des Compagnons (Amis & Duels 1v1)'
                }
                aria-label="Cercle des Compagnons"
              >
                <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                {/* Nombre fixe d'amis connectés sans clignotement, affiché uniquement si >= 1 connecté */}
                {friendsOnlineCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-mono font-bold bg-emerald-600 text-white flex items-center justify-center border border-[#06241b] shadow-sm shadow-emerald-500/30"
                  >
                    {friendsOnlineCount}
                  </span>
                )}
              </button>
            )}

            {/* Le Perchoir / Tchat Communautaire & Retours Direct Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                openChat();
              }}
              className="p-2 rounded-xl bg-[#06241b] border border-[#78350f] text-amber-300 hover:text-white hover:border-amber-500/50 hover:bg-[#093a2b] transition flex items-center justify-center shrink-0 min-h-[40px] cursor-pointer relative group touch-manipulation"
              title={
                unreadCount > 0
                  ? `${t('chat.discussion')} (${unreadCount} nouveau${unreadCount > 1 ? 'x' : ''})`
                  : `${t('chat.discussion')} — Le Perchoir`
              }
              aria-label={t('chat.discussion')}
            >
              <MessageSquare className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-slate-950 flex items-center justify-center border border-[#06241b] shadow-sm shadow-amber-500/30 animate-bounce"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Sign In / Sign Up Button OR Authenticated User Profile */}
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenAuth();
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer shrink-0 min-h-[40px] touch-manipulation"
                title={t('nav.authTip')}
                aria-label={t('nav.signIn')}
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="font-black whitespace-nowrap hidden sm:inline">
                  {t('nav.signIn')}
                </span>
                <span className="hidden min-[1850px]:inline font-black whitespace-nowrap">
                  {` / ${t('nav.signUp')}`}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenProfile();
                }}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#06241b] border border-[#78350f] hover:border-amber-500/50 hover:bg-[#093a2b] transition group relative cursor-pointer shrink-0 min-h-[40px] touch-manipulation"
                title={isSteamConnected ? `Profil (${steamAccount?.personaName} sur Steam)` : t('nav.profile')}
                aria-label={t('nav.profile')}
              >
                <div className="relative flex items-center justify-center">
                  {currentAvatar.imageUrl ? (
                    <img
                      src={currentAvatar.imageUrl}
                      alt={currentAvatar.name}
                      className="w-5 h-5 rounded-full object-contain drop-shadow-sm"
                    />
                  ) : (
                    <span className="text-sm">{currentAvatar.emoji}</span>
                  )}
                  {isSteamConnected && (
                    <span className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#171a21] border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-sm">
                      <SteamIcon className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <span className="hidden 2xl:inline-flex items-center gap-1 text-xs font-bold text-white max-w-[95px]">
                  <span className="truncate">{profile.username}</span>
                  {isAuthenticated && isAdmin && <Crown className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Burger Menu Drawer (remplace le scroll horizontal sur mobile) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Dark Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 top-16 sm:top-[72px] lg:top-[76px] bg-black/80 backdrop-blur-md z-40 xl:hidden"
              />

              {/* Mobile Drawer Panel */}
              <motion.div
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-x-0 top-16 sm:top-[72px] lg:top-[76px] bg-[#02130e] border-b-2 border-[#78350f] shadow-2xl shadow-black/95 z-50 xl:hidden max-h-[calc(100vh-76px)] overflow-y-auto no-scrollbar p-3.5 sm:p-5 text-slate-100"
              >
                <div className="flex items-center justify-between px-1 pb-3 mb-3 border-b border-[#78350f]/60 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Navigation Principale</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Grid of the 8 navigation tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {(
                    [
                      { id: 'gems' as NavTab, label: t('nav.gems'), desc: 'Pépites certifiées & actualités', icon: Compass },
                      { id: 'microindies' as NavTab, label: t('nav.microindies', 'Micro-Indés'), desc: 'Pépites Itch.io & Game Jams', icon: Sparkles, badge: 'Itch' },
                      { id: 'catalog' as NavTab, label: t('nav.catalog', 'Catalogue'), desc: '185 chefs-d’œuvre indépendants', icon: Database },
                      { id: 'minigames' as NavTab, label: t('nav.games', 'Mini-Jeux'), desc: '11 défis quotidiens, sprint & duel 1v1', icon: Puzzle, badge: '11' },
                      { id: 'arcade' as NavTab, label: t('nav.arcade'), desc: 'Salle de jeux rétro & classements', icon: Gamepad2 },
                      { id: 'cards' as NavTab, label: t('nav.cards', 'Cartes'), desc: 'Album de 185 cartes & boosters', icon: Layers, badge: '185' },
                      { id: 'toolbox' as NavTab, label: t('nav.toolbox'), desc: 'Filtres, générateurs & outils indés', icon: Wrench },
                      { id: 'roost' as NavTab, label: t('nav.roost'), desc: 'Communauté, retours & créateur', icon: Feather },
                    ]
                  ).map((item) => {
                    const Icon = item.icon;
                    const active = item.id === 'minigames' ? isMinigamesActive : currentTab === item.id;

                    return (
                      <a
                        key={item.id}
                        href={item.id === 'gems' ? '#gems' : `#${item.id}`}
                        onClick={(e) => {
                          handleTabSelect(item.id, e);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] touch-manipulation ${
                          active
                            ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/25 ring-1 ring-amber-300/50'
                            : 'bg-[#06241b] text-slate-200 border-[#78350f] hover:border-amber-500/50 hover:bg-[#093527]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              active
                                ? 'bg-slate-950/20 border-slate-950/30 text-slate-950'
                                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                              <span>{item.label}</span>
                              {active && <span className="text-[10px] text-slate-950">✓</span>}
                            </div>
                            <div
                              className={`text-[10px] mt-0.5 line-clamp-1 ${
                                active ? 'text-slate-900 font-semibold' : 'text-slate-400'
                              }`}
                            >
                              {item.desc}
                            </div>
                          </div>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md font-mono ${
                              active
                                ? 'bg-slate-950 text-amber-300'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>

                {/* Quick Utilities Footer in Drawer */}
                <div className="mt-3.5 pt-3.5 border-t border-[#78350f]/60 grid grid-cols-2 gap-2 text-xs">
                  {/* Calendar / Date */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsMobileMenuOpen(false);
                      onOpenCalendar();
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#06241b] border border-[#78350f] text-slate-300 hover:text-white cursor-pointer active:scale-95"
                  >
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="font-mono font-bold text-xs">{currentDate}</span>
                  </button>

                  {/* Sound Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleSound();
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#06241b] border border-[#78350f] text-slate-300 hover:text-white cursor-pointer active:scale-95"
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs text-emerald-300">Son Activé</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-xs text-slate-400">Son Coupé</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
