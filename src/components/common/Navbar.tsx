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
  Check,
  ChevronDown,
  Sparkles,
  Users,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react';
import { OwlLogo } from './OwlLogo';
import { SteamIcon } from './SteamIcon';
import { SylvestreLeaf } from '../sylvestre/SylvestreLeaf';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';
import { useUserAccount } from '../../context/useUserAccount';
import { useFriends } from '../../context/useFriends';
import { useChat } from '../../context/useChat';
import { SUPPORTED_LANGUAGES, getAppLanguage, type AppLanguage } from '../../utils/localization';
import { INDIE_AVATARS } from '../../data/avatars';
import { telemetry } from '../../services/telemetry';
import { getTodayDateString, getYesterdayDateString } from '../../utils/streakManager';

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
  const { profile, isAuthenticated, isAdmin, isSteamConnected, steamAccount } = useUserAccount();
  const { totalFriendsCount, friendsActiveTodayCount, friendsOnlineCount } = useFriends();
  const { openChat, unreadCount } = useChat();
  const [soundEnabled, setSoundEnabled] = useState(soundFx.isEnabled());

  const currentAvatar = INDIE_AVATARS.find((a) => a.id === profile.avatarId) || INDIE_AVATARS[0];
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString(todayStr);
  const isYesterday = currentDate === yesterdayStr;

  const handleTabSelect = (tab: NavTab) => {
    soundFx.playClick();
    telemetry.track('navigation', 'tab_change', tab);
    onTabChange(tab);
  };

  const isMinigamesActive =
    currentTab === 'minigames' ||
    ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'timeattack', 'versus'].includes(currentTab);

  const toggleSound = () => {
    const next = soundFx.toggleSound();
    setSoundEnabled(next);
    telemetry.track('interaction', 'sound_toggle', next ? 'on' : 'off');
  };

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const playerMenuRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#010805]/90 backdrop-blur-md border-b border-[#78350f] shadow-lg shadow-black/50">
      {/* Sylvestre Canopy Emerald Trim on bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent pointer-events-none" />

      <div className="w-full max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[72px] lg:h-[76px] gap-1.5 sm:gap-3">
          {/* Brand & Owl Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 max-w-[150px] sm:max-w-[240px] lg:max-w-[290px] 2xl:max-w-[340px]">
            <div className="relative shrink-0">
              <OwlLogo onEasterEggTrigger={onEasterEggTrigger} size="md" />
              <div className="absolute -top-1.5 -left-1.5 pointer-events-none">
                <SylvestreLeaf variant="emerald" cycle={1} size={11} rotation={-35} delay={0.8} />
              </div>
            </div>
            <div
              className="cursor-pointer select-none min-w-0"
              onClick={() => handleTabSelect('gems')}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base 2xl:text-lg font-black text-white tracking-wider flex items-center gap-1 whitespace-nowrap">
                  HOOT <span className="text-[#f59e0b]">INDIE</span>
                  <span className="hidden sm:inline"> GAMES</span>
                </span>
              </div>
              {/* Slogan multiline sans débordement avec hauteur de barre augmentée */}
              <p className="hidden lg:block text-[10px] 2xl:text-[11px] text-slate-400 font-normal leading-tight mt-0.5 line-clamp-2">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Consolidated 7 tabs, Desktop xl+) */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 bg-[#06241b] p-1 rounded-2xl border border-[#78350f] shrink-0">
            {/* 1. Pépites */}
            <button
              onClick={() => handleTabSelect('gems')}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'gems'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.gems')}</span>
            </button>

            {/* 2. Micro-Indés & Itch.io */}
            <button
              onClick={() => handleTabSelect('microindies')}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'microindies'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{t('nav.microindies', 'Micro-Indés')}</span>
              <span
                className={`hidden 2xl:inline text-[9px] font-black px-1 py-0.2 rounded border ${
                  currentTab === 'microindies'
                    ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                Itch
              </span>
            </button>

            {/* 3. Catalogue */}
            <button
              onClick={() => handleTabSelect('catalog')}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.catalog', 'Catalogue')}</span>
            </button>

            {/* 3. Mini-jeux */}
            <button
              onClick={() => handleTabSelect('minigames')}
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
                10
              </span>
            </button>

            {/* 3. Arcade */}
            <button
              onClick={() => handleTabSelect('arcade')}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'arcade'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.arcade')}</span>
            </button>

            <div className="h-4 w-px bg-[#78350f] mx-0.5 xl:mx-1 shrink-0" />

            {/* 4. Boîte à Outils */}
            <button
              onClick={() => handleTabSelect('toolbox')}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'toolbox'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.toolbox')}</span>
            </button>

            {/* 5. Le Perchoir */}
            <button
              onClick={() => handleTabSelect('roost')}
              className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1.5 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'roost'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Feather className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.roost')}</span>
            </button>
          </nav>

          {/* Right Action Icons (Optimized for Mobile-First Display) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Daily Date Button (Opens Calendar) - Visible on 2xl to save width on xl */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenCalendar();
              }}
              className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono transition cursor-pointer min-h-[36px] ${
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

            {/* Bouton Son direct (hors menu déroulant pour couper le son directement) */}
            <button
              onClick={toggleSound}
              className="flex p-1.5 sm:p-2 rounded-xl bg-[#06241b] border border-[#78350f] text-slate-300 hover:text-white hover:bg-slate-800 transition shrink-0 cursor-pointer min-h-[36px] items-center justify-center"
              title={soundEnabled ? t('nav.soundOn') : t('nav.soundOff')}
              aria-label={soundEnabled ? t('nav.soundOn') : t('nav.soundOff')}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Unified Player Records, Trophies & Stats Dropdown (Succès / Leaderboard / Stats à part) */}
            <div className="relative" ref={playerMenuRef}>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsPlayerMenuOpen(!isPlayerMenuOpen);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#06241b] border transition shrink-0 cursor-pointer min-h-[36px] ${
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
                  <Feather className="w-3 h-3 text-amber-400/90" />
                  <span>{feathersCount}</span>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
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
                      {feathersCount}
                    </span>
                  </div>

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
                        <span className="text-[10px] font-mono text-amber-400/90">{feathersCount}</span>
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
                </div>
              )}
            </div>

            {/* Language Switcher Dropdown - 100% visible, accessible and compact on mobile */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsLangMenuOpen(!isLangMenuOpen);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 rounded-xl bg-[#06241b] border transition shrink-0 cursor-pointer min-h-[40px] touch-manipulation ${
                  isLangMenuOpen
                    ? 'border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                    : 'border-[#78350f] text-slate-200 hover:border-amber-500/50 hover:text-amber-400'
                }`}
                title={t('nav.switchLang')}
                aria-label={t('nav.switchLang')}
                aria-expanded={isLangMenuOpen}
              >
                <Globe className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                <span className="text-xs shrink-0">{currentLangMeta.flag}</span>
                <span className="font-mono text-[11px] sm:text-xs font-bold">{currentLangMeta.shortCode}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180 text-amber-400' : ''}`} />
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

            {/* Admin Dashboard Direct Shortcut */}
            {isAdmin && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  if (onOpenAdminDashboard) {
                    onOpenAdminDashboard();
                  } else {
                    window.open('/api/track.php', '_blank');
                  }
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 hover:bg-amber-500/30 transition flex items-center justify-center shrink-0 min-h-[40px] shadow-sm shadow-amber-500/10 cursor-pointer group touch-manipulation"
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
                <span className="hidden 2xl:inline font-black whitespace-nowrap">
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
                <span className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-white max-w-[95px]">
                  <span className="truncate">{profile.username}</span>
                  {isAdmin && <Crown className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Sub-Navigation Bar (Scrollable without forcing parent width) */}
        <div className="flex xl:hidden overflow-x-auto py-1.5 sm:py-2 border-t border-[#0d543e]/60 no-scrollbar scroll-smooth w-full max-w-full px-1">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-max mx-auto px-1">
            {(
              [
                { id: 'gems', label: t('nav.gems'), icon: Compass },
                { id: 'microindies', label: t('nav.microindies', 'Micro-Indés'), icon: Sparkles },
                { id: 'catalog', label: t('nav.catalog', 'Catalogue'), icon: Database },
                { id: 'minigames', label: t('nav.games', 'Mini-Jeux'), icon: Puzzle, badge: '10' },
                { id: 'arcade', label: t('nav.arcade'), icon: Gamepad2 },
                { id: 'toolbox', label: t('nav.toolbox'), icon: Wrench },
                { id: 'roost', label: t('nav.roost'), icon: Feather },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active =
                item.id === 'minigames' ? isMinigamesActive : currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`shrink-0 flex items-center justify-center gap-1 sm:gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[40px] active:scale-95 touch-manipulation ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-[#06241b] text-slate-300 border border-[#78350f] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span
                      className={`text-[9px] font-black uppercase px-1 rounded ${
                        active
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
