import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/common/Navbar';
import type { NavTab } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { StatsModal } from './components/common/StatsModal';
import { OwlEasterEggModal } from './components/common/OwlEasterEggModal';
import { AchievementsModal } from './components/common/AchievementsModal';
import { CalendarArchiveModal } from './components/common/CalendarArchiveModal';
import { FirefliesBackground } from './components/common/FirefliesBackground';
import { ScreenleGame } from './components/screenle/ScreenleGame';
import { IndledleGame } from './components/indledle/IndledleGame';
import { LinkleGame } from './components/linkle/LinkleGame';
import { ToolboxHub } from './components/toolbox/ToolboxHub';
import { TheRoostHub } from './components/roost/TheRoostHub';
import { GameStatsProvider } from './context/GameStatsProvider';
import { AchievementsProvider } from './context/AchievementsProvider';
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
  const [currentTab, setCurrentTab] = useState<NavTab>('screenle');
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);

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
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider animate-pulse">
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
        {currentTab === 'toolbox' && <ToolboxHub />}
        {currentTab === 'roost' && <TheRoostHub />}
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
        onSelectDate={(newDate) => setCurrentDate(newDate)}
      />

      <OwlEasterEggModal
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
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
    <GameStatsProvider>
      <AchievementsProvider>
        <AppContent />
      </AchievementsProvider>
    </GameStatsProvider>
  );
}
