import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/common/Navbar';
import type { NavTab } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { StatsModal } from './components/common/StatsModal';
import { OwlEasterEggModal } from './components/common/OwlEasterEggModal';
import { AchievementsModal } from './components/common/AchievementsModal';
import { CalendarArchiveModal } from './components/common/CalendarArchiveModal';
import { ProfileModal } from './components/common/ProfileModal';
import { FirefliesBackground } from './components/common/FirefliesBackground';
import { ScreenleGame } from './components/screenle/ScreenleGame';
import { IndledleGame } from './components/indledle/IndledleGame';
import { LinkleGame } from './components/linkle/LinkleGame';
import { VersusArena } from './components/versus/VersusArena';
import { ToolboxHub } from './components/toolbox/ToolboxHub';
import { TheRoostHub } from './components/roost/TheRoostHub';
import { ArcadeModal, type ArcadeGameId } from './components/arcade/ArcadeModal';
import { GameStatsProvider } from './context/GameStatsProvider';
import { AchievementsProvider } from './context/AchievementsProvider';
import { UserAccountProvider } from './context/UserAccountProvider';
import { SteamCatalogProvider } from './context/SteamCatalogProvider';
import { Calendar, RefreshCw, Archive } from 'lucide-react';
import { soundFx } from './utils/audio';

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AppContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#versus')) {
      return 'versus';
    }
    return 'screenle';
  });
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState<boolean>(false);
  const [arcadeGame, setArcadeGame] = useState<ArcadeGameId>('snake');

  const handleOpenArcade = (gameId: ArcadeGameId = 'snake') => {
    setArcadeGame(gameId);
    setIsArcadeOpen(true);
  };

  // Hash listener pour deep linking direct (#versus, #linkle)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#versus')) {
        setCurrentTab('versus');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const todayStr = getTodayDateString();
  const isArchiveMode = currentDate !== todayStr;
  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0b0f19] bg-ambient-stars text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Ambient glowing fireflies canvas background */}
      <FirefliesBackground />

      {/* Top sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onEasterEggTrigger={() => setIsEasterEggOpen(true)}
        currentDate={currentDate}
      />

      {/* Date Switcher & Practice Bar for Daily Games */}
      {['screenle', 'indledle', 'linkle'].includes(currentTab) && (
        <div className="w-full max-w-4xl mx-auto px-4 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsCalendarOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] hover:border-amber-500/40 rounded-lg text-slate-300 font-medium transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="font-semibold">{currentLang === 'fr' ? 'Défi du :' : 'Puzzle date:'}</span>
              <span className="text-amber-400 font-mono font-bold">{currentDate}</span>
              <Archive className="w-3 h-3 text-slate-500 ml-1" />
            </button>

            {isArchiveMode && (
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                {currentLang === 'fr' ? 'Mode Archive' : 'Archive Mode'}
              </span>
            )}
          </div>

          {isArchiveMode && (
            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentDate(todayStr);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg font-bold transition"
              title="Revenir au jour courant"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t('common.today')}</span>
            </button>
          )}
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full relative z-10">
        {currentTab === 'screenle' && <ScreenleGame key={currentDate} currentDate={currentDate} />}
        {currentTab === 'indledle' && <IndledleGame key={currentDate} currentDate={currentDate} />}
        {currentTab === 'linkle' && <LinkleGame key={currentDate} currentDate={currentDate} />}
        {currentTab === 'versus' && <VersusArena />}
        {currentTab === 'toolbox' && <ToolboxHub />}
        {currentTab === 'roost' && <TheRoostHub onOpenArcade={handleOpenArcade} />}
      </main>

      {/* Global Modals */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        initialTab={
          ['screenle', 'indledle', 'linkle'].includes(currentTab)
            ? (currentTab as 'screenle' | 'indledle' | 'linkle')
            : 'screenle'
        }
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      <CalendarArchiveModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentDate={currentDate}
        onSelectDate={(newDate) => {
          if (newDate <= todayStr) {
            setCurrentDate(newDate);
          }
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <OwlEasterEggModal
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
        onOpenArcade={() => handleOpenArcade('snake')}
      />

      <ArcadeModal
        isOpen={isArcadeOpen}
        initialGame={arcadeGame}
        onClose={() => setIsArcadeOpen(false)}
      />

      {/* Footer */}
      <div className="relative z-10">
        <Footer
          onSelectTab={setCurrentTab}
          onEasterEggTrigger={() => setIsEasterEggOpen(true)}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <UserAccountProvider>
      <GameStatsProvider>
        <AchievementsProvider>
          <SteamCatalogProvider>
            <AppContent />
          </SteamCatalogProvider>
        </AchievementsProvider>
      </GameStatsProvider>
    </UserAccountProvider>
  );
}
