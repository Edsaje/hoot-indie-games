import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/common/Navbar';
import type { NavTab } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { StatsModal } from './components/common/StatsModal';
import { OwlEasterEggModal } from './components/common/OwlEasterEggModal';
import { ScreenleGame } from './components/screenle/ScreenleGame';
import { IndledleGame } from './components/indledle/IndledleGame';
import { LinkleGame } from './components/linkle/LinkleGame';
import { ToolboxHub } from './components/toolbox/ToolboxHub';
import { TheRoostHub } from './components/roost/TheRoostHub';
import { GameStatsProvider } from './context/GameStatsProvider';
import { Calendar, RefreshCw } from 'lucide-react';

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<NavTab>('screenle');
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);

  // Available test dates for practice mode
  const testDates = ['2026-09-17', '2026-09-18', '2026-09-19'];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] bg-ambient-stars text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenStats={() => setIsStatsOpen(true)}
        onEasterEggTrigger={() => setIsEasterEggOpen(true)}
        currentDate={currentDate}
      />

      {/* Date Switcher & Practice Bar for Daily Games */}
      {['screenle', 'indledle', 'linkle'].includes(currentTab) && (
        <div className="w-full max-w-4xl mx-auto px-4 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="font-semibold text-slate-300">Date du défi :</span>
            <select
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-[#131a29] border border-[#1e293b] rounded-lg px-2 py-1 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {testDates.map((d) => (
                <option key={d} value={d}>
                  {d} {d === getTodayDateString() ? `(${t('common.today')})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCurrentDate(getTodayDateString())}
            className="flex items-center gap-1 hover:text-amber-400 transition"
            title="Revenir au jour courant"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{t('common.today')}</span>
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full">
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

      <OwlEasterEggModal
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
      />

      {/* Footer */}
      <Footer
        onSelectTab={setCurrentTab}
        onEasterEggTrigger={() => setIsEasterEggOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <GameStatsProvider>
      <AppContent />
    </GameStatsProvider>
  );
}
