import React, { useState } from 'react';
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
} from 'lucide-react';
import { OwlLogo } from './OwlLogo';
import { SteamIcon } from './SteamIcon';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';
import { useUserAccount } from '../../context/useUserAccount';
import { INDIE_AVATARS } from '../../data/avatars';
import { telemetry } from '../../services/telemetry';
import { getTodayDateString, getYesterdayDateString } from '../../utils/streakManager';

export type NavTab =
  | 'gems'
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
  onEasterEggTrigger,
  currentDate,
}) => {
  const { t, i18n } = useTranslation();
  const { feathersCount, unlockAchievement } = useAchievements();
  const { profile, isAuthenticated, isAdmin, isSteamConnected, steamAccount } = useUserAccount();
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

  const toggleLanguage = () => {
    soundFx.playClick();
    const nextLang = i18n.language.startsWith('fr') ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
    unlockAchievement('polyglot');
    telemetry.track('interaction', 'language_toggle', nextLang);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1e293b]">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand & Owl Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <OwlLogo onEasterEggTrigger={onEasterEggTrigger} size="md" />
            <div
              className="cursor-pointer select-none"
              onClick={() => handleTabSelect('gems')}
            >
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white tracking-wider flex items-center gap-1">
                  HOOT <span className="text-[#f59e0b]">INDIE</span> GAMES
                </span>
              </div>
              <p className="hidden 2xl:block text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Consolidated 5 tabs, Mobile-First & No Overflow) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#131a29] p-1 rounded-2xl border border-[#1e293b] shrink-0">
            {/* 1. Pépites */}
            <button
              onClick={() => handleTabSelect('gems')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'gems'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              {t('nav.gems')}
            </button>

            {/* 2. Mini-jeux (Consolidated Screenle, Indledle, Linkle, Profille, Chrono, Time Attack, Versus) */}
            <button
              onClick={() => handleTabSelect('minigames')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isMinigamesActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'arcade'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              {t('nav.arcade')}
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* 4. Boîte à Outils */}
            <button
              onClick={() => handleTabSelect('toolbox')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'toolbox'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              {t('nav.toolbox')}
            </button>

            {/* 5. Le Perchoir */}
            <button
              onClick={() => handleTabSelect('roost')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'roost'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              {t('nav.roost')}
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Daily Date Button (Opens Calendar) */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenCalendar();
              }}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono transition cursor-pointer ${
                isYesterday
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-[#131a29] border-[#1e293b] text-slate-300 hover:text-white hover:border-amber-500/40'
              }`}
              title={
                isYesterday
                  ? (i18n.language.startsWith('fr') ? "Défi d'hier (Veille) • Flamme préservable" : "Yesterday's puzzle • Streak rescue")
                  : (i18n.language.startsWith('fr') ? "Calendrier quotidien (Aujourd'hui & Veille)" : "Daily calendar (Today & Yesterday)")
              }
            >
              {isYesterday ? (
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              ) : (
                <Calendar className="w-3.5 h-3.5 text-[#f59e0b]" />
              )}
              <span className="hidden 2xl:inline">{currentDate}</span>
              {isYesterday && (
                <span className="text-[10px] font-black text-amber-300 px-1 py-0.2 rounded bg-amber-500/20">
                  J-1
                </span>
              )}
            </button>

            {/* Achievements Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenAchievements();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition text-xs font-bold"
              title={i18n.language.startsWith('fr') ? "Trésor des Plumes d'Or" : 'Feather Trove Achievements'}
              aria-label="Achievements"
            >
              <Feather className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-amber-300">{feathersCount}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title={soundEnabled ? t('nav.soundOn') : t('nav.soundOff')}
              aria-label={soundEnabled ? t('nav.soundOn') : t('nav.soundOff')}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Leaderboard Modal Button */}
            {onOpenLeaderboard && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLeaderboard();
                }}
                className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition"
                title={i18n.language.startsWith('fr') ? 'Classements en Ligne (Arcade & Time Attack)' : 'Online Leaderboards'}
                aria-label="Leaderboards"
              >
                <Trophy className="w-4 h-4 text-amber-400/80 hover:text-amber-400" />
              </button>
            )}

            {/* Stats Modal Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenStats();
              }}
              className="p-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-[#f59e0b] hover:bg-slate-800 transition"
              title={t('nav.stats')}
              aria-label={t('nav.stats')}
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#131a29] border border-[#1e293b] text-xs font-bold text-slate-200 hover:border-amber-500/50 hover:text-amber-400 transition"
              title={t('nav.switchLang')}
            >
              <Globe className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>{i18n.language.startsWith('fr') ? 'FR' : 'EN'}</span>
            </button>

            {/* Admin Dashboard Direct Shortcut */}
            {isAdmin && (
              <a
                href="/api/track.php"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 hover:bg-amber-500/30 transition flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/10 cursor-pointer"
                title="Tableau de Bord Analytics Administrateur (/api/track.php)"
                aria-label="Admin Track Analytics"
              >
                <Crown className="w-4 h-4 text-amber-400" />
              </a>
            )}

            {/* Sign In / Sign Up Button OR Authenticated User Profile */}
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenAuth();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer shrink-0"
                title={i18n.language.startsWith('fr') ? 'Se connecter ou créer un compte' : 'Sign In or Sign Up'}
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="font-black whitespace-nowrap">
                  {i18n.language.startsWith('fr') ? 'Connexion' : 'Sign In'}
                </span>
                <span className="hidden 2xl:inline font-black whitespace-nowrap">
                  {i18n.language.startsWith('fr') ? ' / Inscription' : ' / Up'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenProfile();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#131a29] border border-[#1e293b] hover:border-amber-500/50 hover:bg-[#182133] transition group relative cursor-pointer shrink-0"
                title={isSteamConnected ? `Profil (${steamAccount?.personaName} sur Steam)` : t('nav.profile')}
                aria-label={t('nav.profile')}
              >
                <div className="relative flex items-center justify-center">
                  <span className="text-sm">{currentAvatar.emoji}</span>
                  {isSteamConnected && (
                    <span className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#171a21] border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-sm">
                      <SteamIcon className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-white max-w-[95px] truncate flex items-center gap-1">
                  {profile.username}
                  {isAdmin && <Crown className="w-3 h-3 text-amber-400 shrink-0 inline ml-0.5" />}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Sub-Navigation Bar (Consolidated 5 tabs, Mobile-First) */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-[#1e293b]/60 no-scrollbar justify-between">
          {(
            [
              { id: 'gems', label: t('nav.gems'), icon: Compass },
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
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex-1 ${
                  active
                    ? 'bg-[#f59e0b] text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-[#131a29] text-slate-300 border border-[#1e293b] hover:text-white'
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
    </header>
  );
};
