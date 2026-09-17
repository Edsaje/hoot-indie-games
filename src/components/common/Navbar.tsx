import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Volume2,
  VolumeX,
  BarChart3,
  Globe,
  Camera,
  Layers,
  Sparkles,
  Feather,
  Wrench,
  Calendar,
} from 'lucide-react';
import { OwlLogo } from './OwlLogo';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';

export type NavTab = 'screenle' | 'indledle' | 'linkle' | 'toolbox' | 'roost';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  onOpenCalendar: () => void;
  onEasterEggTrigger: () => void;
  currentDate: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenStats,
  onOpenAchievements,
  onOpenCalendar,
  onEasterEggTrigger,
  currentDate,
}) => {
  const { t, i18n } = useTranslation();
  const { feathersCount, unlockAchievement } = useAchievements();
  const [soundEnabled, setSoundEnabled] = useState(soundFx.isEnabled());

  const toggleSound = () => {
    const next = soundFx.toggleSound();
    setSoundEnabled(next);
  };

  const toggleLanguage = () => {
    soundFx.playClick();
    const nextLang = i18n.language.startsWith('fr') ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
    unlockAchievement('polyglot');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Owl Logo */}
          <div className="flex items-center gap-3">
            <OwlLogo onEasterEggTrigger={onEasterEggTrigger} size="md" />
            <div
              className="cursor-pointer select-none"
              onClick={() => {
                soundFx.playClick();
                onTabChange('screenle');
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white tracking-wider flex items-center gap-1">
                  HOOT <span className="text-[#f59e0b]">INDIE</span> GAMES
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Bilingue
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#131a29] p-1.5 rounded-2xl border border-[#1e293b]">
            <button
              onClick={() => {
                soundFx.playClick();
                onTabChange('screenle');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'screenle'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              {t('nav.screenle')}
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onTabChange('indledle');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'indledle'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t('nav.indledle')}
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onTabChange('linkle');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'linkle'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('nav.linkle')}
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={() => {
                soundFx.playClick();
                onTabChange('toolbox');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'toolbox'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              {t('nav.toolbox')}
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onTabChange('roost');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'roost'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              {t('nav.roost')}
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Daily Date Button (Opens Calendar) */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenCalendar();
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131a29] border border-[#1e293b] text-slate-300 hover:text-white hover:border-amber-500/40 text-xs font-mono transition cursor-pointer"
              title="Ouvrir les archives quotidiennes"
            >
              <Calendar className="w-3.5 h-3.5 text-[#f59e0b]" />
              {currentDate}
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
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-[#1e293b]/60 no-scrollbar">
          {(
            [
              { id: 'screenle', label: t('nav.screenle'), icon: Camera },
              { id: 'indledle', label: t('nav.indledle'), icon: Layers },
              { id: 'linkle', label: t('nav.linkle'), icon: Sparkles },
              { id: 'toolbox', label: t('nav.toolbox'), icon: Wrench },
              { id: 'roost', label: t('nav.roost'), icon: Feather },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  active
                    ? 'bg-[#f59e0b] text-slate-950 font-black'
                    : 'bg-[#131a29] text-slate-300 border border-[#1e293b]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
