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
import { AuthModal } from './components/common/AuthModal';
import { FirefliesBackground } from './components/common/FirefliesBackground';
import { GemExplorerHome } from './components/gems/GemExplorerHome';
import { ScreenleGame } from './components/screenle/ScreenleGame';
import { IndledleGame } from './components/indledle/IndledleGame';
import { LinkleGame } from './components/linkle/LinkleGame';
import { VersusArena } from './components/versus/VersusArena';
import { ToolboxHub } from './components/toolbox/ToolboxHub';
import { TheRoostHub } from './components/roost/TheRoostHub';
import { ArcadeHallView } from './components/arcade/ArcadeHallView';
import { ArcadeModal, type ArcadeGameId } from './components/arcade/ArcadeModal';
import { TimeAttackHub } from './components/timeattack/TimeAttackHub';
import type { TimeAttackMode } from './types/timeAttack';
import { GameStatsProvider } from './context/GameStatsProvider';
import { AchievementsProvider } from './context/AchievementsProvider';
import { UserAccountProvider } from './context/UserAccountProvider';
import { SteamCatalogProvider } from './context/SteamCatalogProvider';
import { Calendar, RefreshCw, Archive, Flame } from 'lucide-react';
import { soundFx } from './utils/audio';
import { getTodayDateString, getYesterdayDateString, isDatePlayable } from './utils/streakManager';

export const AppContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.startsWith('#versus')) return 'versus';
      if (window.location.hash.startsWith('#arcade')) return 'arcade';
      if (window.location.hash.startsWith('#timeattack')) return 'timeattack';
      if (window.location.hash.startsWith('#screenle')) return 'screenle';
      if (window.location.hash.startsWith('#indledle')) return 'indledle';
      if (window.location.hash.startsWith('#linkle')) return 'linkle';
      if (window.location.hash.startsWith('#toolbox')) return 'toolbox';
      if (window.location.hash.startsWith('#roost')) return 'roost';
    }
    return 'gems';
  });
  const [timeAttackInitialMode, setTimeAttackInitialMode] = useState<TimeAttackMode | undefined>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#timeattack')) {
      const match = window.location.hash.match(/#timeattack=([a-z]+)/);
      if (match && ['screenle', 'indledle', 'linkle'].includes(match[1])) {
        return match[1] as TimeAttackMode;
      }
    }
    return undefined;
  });
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState<boolean>(false);
  const [arcadeGame, setArcadeGame] = useState<ArcadeGameId>('snake');

  const handleOpenArcade = (gameId: ArcadeGameId = 'snake') => {
    setArcadeGame(gameId);
    setIsArcadeOpen(true);
  };

  // Hash listener pour deep linking direct (#screenle, #indledle, #linkle, #versus, #arcade, #timeattack, #toolbox, #roost, #gems)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#screenle')) setCurrentTab('screenle');
      else if (hash.startsWith('#indledle')) setCurrentTab('indledle');
      else if (hash.startsWith('#linkle')) setCurrentTab('linkle');
      else if (hash.startsWith('#versus')) setCurrentTab('versus');
      else if (hash.startsWith('#arcade')) setCurrentTab('arcade');
      else if (hash.startsWith('#timeattack')) {
        setCurrentTab('timeattack');
        const match = window.location.hash.match(/#timeattack=([a-z]+)/);
        if (match && ['screenle', 'indledle', 'linkle'].includes(match[1])) {
          setTimeAttackInitialMode(match[1] as TimeAttackMode);
        }
      }
      else if (hash.startsWith('#toolbox')) setCurrentTab('toolbox');
      else if (hash.startsWith('#roost')) setCurrentTab('roost');
      else if (hash.startsWith('#gems')) setCurrentTab('gems');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Synchronisation dynamique du titre du document et du hash pour le SEO et le partage
  useEffect(() => {
    const isFr = i18n.language.startsWith('fr');
    const titles: Record<NavTab, { fr: string; en: string }> = {
      gems: {
        fr: 'Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants',
        en: 'Hoot Indie Games | The Indie Video Game Sanctuary',
      },
      screenle: {
        fr: "Screenle — Défi Quotidien par Capture d'Écran | Hoot Indie Games",
        en: 'Screenle — Daily Screenshot Challenge | Hoot Indie Games',
      },
      indledle: {
        fr: 'Indledle — Défi Quotidien de Déduction | Hoot Indie Games',
        en: 'Indledle — Daily Indie Deduction Puzzle | Hoot Indie Games',
      },
      linkle: {
        fr: 'Linkle — 16 Connexions Thématiques Secrètes | Hoot Indie Games',
        en: 'Linkle — 16 Secret Thematic Connections | Hoot Indie Games',
      },
      versus: {
        fr: 'Arène Versus 1v1 — Duels Multijoueurs en Direct | Hoot Indie Games',
        en: '1v1 Versus Arena — Real-Time Multiplayer Duels | Hoot Indie Games',
      },
      arcade: {
        fr: "Salle d'Arcade Rétro & Vectrex 1982 | Hoot Indie Games",
        en: 'Retro Arcade Hall & 1982 Vectrex | Hoot Indie Games',
      },
      timeattack: {
        fr: 'Time Attack ⚡ — Sprint Chronométré de Jeux Indés | Hoot Indie Games',
        en: 'Time Attack ⚡ — Timed Indie Game Sprint | Hoot Indie Games',
      },
      toolbox: {
        fr: 'Boîte à Outils & Radar Indé | Hoot Indie Games',
        en: 'Toolbox Hub & Indie Radar | Hoot Indie Games',
      },
      roost: {
        fr: 'Le Perchoir Sylvestre — Portfolio & Projets | Hoot Indie Games',
        en: 'The Roost — Portfolio & Indie Projects | Hoot Indie Games',
      },
    };

    document.title = isFr ? titles[currentTab].fr : titles[currentTab].en;

    // Met à jour le hash sans recharger la page
    const targetHash = currentTab === 'gems' ? '' : `#${currentTab}`;
    if (window.location.hash !== targetHash && !(currentTab === 'gems' && window.location.hash === '')) {
      if (targetHash === '') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } else {
        history.replaceState(null, '', targetHash);
      }
    }
  }, [currentTab, i18n.language]);

  // Remonter en haut de la page automatiquement à chaque changement d'onglet
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentTab]);

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString(todayStr);

  // Assurer que la date sélectionnée reste jouable (aujourd'hui ou hier), sinon revenir à aujourd'hui
  useEffect(() => {
    if (!isDatePlayable(currentDate, todayStr)) {
      setCurrentDate(todayStr);
    }
  }, [currentDate, todayStr]);

  const isYesterdayMode = currentDate === yesterdayStr;
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
        onOpenAuth={() => setIsAuthOpen(true)}
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

            {isYesterdayMode ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider animate-pulse">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                {currentLang === 'fr' ? 'Défi d’hier (Veille) • Flamme préservable' : 'Yesterday • Streak Rescue'}
              </span>
            ) : isArchiveMode ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                {currentLang === 'fr' ? 'Mode Archive' : 'Archive Mode'}
              </span>
            ) : null}
          </div>

          {isArchiveMode && (
            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentDate(todayStr);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg font-bold transition cursor-pointer"
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
        {currentTab === 'gems' && (
          <GemExplorerHome
            currentDate={currentDate}
            onNavigateTab={setCurrentTab}
            onOpenArcade={handleOpenArcade}
          />
        )}
        {currentTab === 'screenle' && (
          <ScreenleGame
            key={currentDate}
            currentDate={currentDate}
            onSelectDate={(newDate) => setCurrentDate(newDate)}
          />
        )}
        {currentTab === 'indledle' && (
          <IndledleGame
            key={currentDate}
            currentDate={currentDate}
            onSelectDate={(newDate) => setCurrentDate(newDate)}
          />
        )}
        {currentTab === 'linkle' && (
          <LinkleGame
            key={currentDate}
            currentDate={currentDate}
            onSelectDate={(newDate) => setCurrentDate(newDate)}
          />
        )}
        {currentTab === 'versus' && <VersusArena />}
        {currentTab === 'arcade' && <ArcadeHallView onOpenGame={handleOpenArcade} />}
        {currentTab === 'timeattack' && <TimeAttackHub initialMode={timeAttackInitialMode} />}
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
          if (isDatePlayable(newDate, todayStr)) {
            setCurrentDate(newDate);
          }
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
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
