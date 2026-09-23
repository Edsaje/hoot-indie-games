import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/common/Navbar';
import type { NavTab } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { FirefliesBackground } from './components/common/FirefliesBackground';
import { MiniGamesNav, type MiniGameSubTab } from './components/minigames/MiniGamesNav';
import type { ArcadeGameId } from './components/arcade/ArcadeModal';

// Modals (Lazy Loaded)
const StatsModal = React.lazy(() => import('./components/common/StatsModal').then(module => ({ default: module.StatsModal })));
const OwlEasterEggModal = React.lazy(() => import('./components/common/OwlEasterEggModal').then(module => ({ default: module.OwlEasterEggModal })));
const AchievementsModal = React.lazy(() => import('./components/common/AchievementsModal').then(module => ({ default: module.AchievementsModal })));
const CalendarArchiveModal = React.lazy(() => import('./components/common/CalendarArchiveModal').then(module => ({ default: module.CalendarArchiveModal })));
const ProfileModal = React.lazy(() => import('./components/common/ProfileModal').then(module => ({ default: module.ProfileModal })));
const AuthModal = React.lazy(() => import('./components/common/AuthModal').then(module => ({ default: module.AuthModal })));
const ArcadeModal = React.lazy(() => import('./components/arcade/ArcadeModal').then(module => ({ default: module.ArcadeModal })));
const LeaderboardModal = React.lazy(() => import('./components/common/LeaderboardModal').then(module => ({ default: module.LeaderboardModal })));
const AdminDashboardModal = React.lazy(() => import('./components/admin/AdminDashboardModal').then(module => ({ default: module.AdminDashboardModal })));
const FriendsModal = React.lazy(() => import('./components/friends/FriendsModal').then(module => ({ default: module.FriendsModal })));
const FeatherShopModal = React.lazy(() => import('./components/shop/FeatherShopModal').then(module => ({ default: module.FeatherShopModal })));
const ChatDrawer = React.lazy(() => import('./components/chat/ChatDrawer').then(module => ({ default: module.ChatDrawer })));

// Main Views & Hubs (Lazy Loaded)
const GemExplorerHome = React.lazy(() => import('./components/gems/GemExplorerHome').then(module => ({ default: module.GemExplorerHome })));
const MiniGamesHub = React.lazy(() => import('./components/minigames/MiniGamesHub').then(module => ({ default: module.MiniGamesHub })));
const SteamCatalogExplorer = React.lazy(() => import('./components/steam/SteamCatalogExplorer').then(module => ({ default: module.SteamCatalogExplorer })));
const MicroIndieHub = React.lazy(() => import('./components/microindies/MicroIndieHub').then(module => ({ default: module.MicroIndieHub })));
const TheRoostHub = React.lazy(() => import('./components/roost/TheRoostHub').then(module => ({ default: module.TheRoostHub })));
const ArcadeHallView = React.lazy(() => import('./components/arcade/ArcadeHallView').then(module => ({ default: module.ArcadeHallView })));
const ToolboxHub = React.lazy(() => import('./components/toolbox/ToolboxHub').then(module => ({ default: module.ToolboxHub })));

// Mini-Games (Lazy Loaded)
const ScreenleGame = React.lazy(() => import('./components/screenle/ScreenleGame').then(module => ({ default: module.ScreenleGame })));
const IndledleGame = React.lazy(() => import('./components/indledle/IndledleGame').then(module => ({ default: module.IndledleGame })));
const LinkleGame = React.lazy(() => import('./components/linkle/LinkleGame').then(module => ({ default: module.LinkleGame })));
const ProfilleGame = React.lazy(() => import('./components/profille/ProfilleGame').then(module => ({ default: module.ProfilleGame })));
const ChronoGame = React.lazy(() => import('./components/chrono/ChronoGame').then(module => ({ default: module.ChronoGame })));
const PixelGame = React.lazy(() => import('./components/pixel/PixelGame').then(module => ({ default: module.PixelGame })));
const ReviewGame = React.lazy(() => import('./components/review/ReviewGame').then(module => ({ default: module.ReviewGame })));
const BlindTestGame = React.lazy(() => import('./components/blindtest/BlindTestGame').then(module => ({ default: module.BlindTestGame })));
const IndieQuizGame = React.lazy(() => import('./components/quiz/IndieQuizGame').then(module => ({ default: module.IndieQuizGame })));
const TimeAttackHub = React.lazy(() => import('./components/timeattack/TimeAttackHub').then(module => ({ default: module.TimeAttackHub })));
const VersusArena = React.lazy(() => import('./components/versus/VersusArena').then(module => ({ default: module.VersusArena })));
import type { LeaderboardCategory } from './services/leaderboardService';
import type { TimeAttackMode } from './types/timeAttack';
import type { DailyGameMode } from './context/GameStatsContext';
import { GameStatsProvider } from './context/GameStatsProvider';
import { AchievementsProvider } from './context/AchievementsProvider';
import { useAchievements } from './context/useAchievements';
import { UserAccountProvider } from './context/UserAccountProvider';
import { SteamCatalogProvider } from './context/SteamCatalogProvider';
import { FriendsProvider } from './context/FriendsProvider';
import { ChatProvider } from './context/ChatProvider';
import { getAppLanguage } from './utils/localization';
import { useKonamiCode } from './utils/useKonamiCode';
import { CrtRetroControl } from './components/common/CrtRetroControl';
import { Calendar, RefreshCw, Archive, Flame } from 'lucide-react';
import { soundFx } from './utils/audio';
import { getTodayDateString, getYesterdayDateString, isDatePlayable } from './utils/streakManager';

export const AppContent: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Mini-game sub-tab state (Hub or one of the 7 disciplines)
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameSubTab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#screenle')) return 'screenle';
      if (hash.startsWith('#indledle')) return 'indledle';
      if (hash.startsWith('#linkle')) return 'linkle';
      if (hash.startsWith('#profille')) return 'profille';
      if (hash.startsWith('#chrono') || hash.startsWith('#timeline')) return 'chrono';
      if (hash.startsWith('#pixel') || hash.startsWith('#silhouette')) return 'pixel';
      if (hash.startsWith('#review') || hash.startsWith('#critique')) return 'review';
      if (hash.startsWith('#blindtest') || hash.startsWith('#audioldle') || hash.startsWith('#ost')) return 'blindtest';
      if (hash.startsWith('#timeattack')) return 'timeattack';
      if (hash.startsWith('#versus')) return 'versus';
    }
    return 'hub';
  });

  // Top level navigation tab: gems | minigames | arcade | toolbox | roost
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (
        hash.startsWith('#minigames') ||
        hash.startsWith('#screenle') ||
        hash.startsWith('#indledle') ||
        hash.startsWith('#linkle') ||
        hash.startsWith('#profille') ||
        hash.startsWith('#chrono') ||
        hash.startsWith('#timeline') ||
        hash.startsWith('#pixel') ||
        hash.startsWith('#silhouette') ||
        hash.startsWith('#review') ||
        hash.startsWith('#critique') ||
        hash.startsWith('#blindtest') ||
        hash.startsWith('#audioldle') ||
        hash.startsWith('#ost') ||
        hash.startsWith('#timeattack') ||
        hash.startsWith('#versus')
      ) {
        return 'minigames';
      }
      if (hash.startsWith('#micro') || hash.startsWith('#itch')) return 'microindies';
      if (hash.startsWith('#catalog') || hash.startsWith('#steam')) return 'catalog';
      if (hash.startsWith('#arcade')) return 'arcade';
      if (hash.startsWith('#toolbox')) return 'toolbox';
      if (hash.startsWith('#roost')) return 'roost';
    }
    return 'gems';
  });

  const [timeAttackInitialMode, setTimeAttackInitialMode] = useState<TimeAttackMode | undefined>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#timeattack')) {
      const match = window.location.hash.match(/#timeattack=([a-z]+)/);
      if (match && ['screenle', 'indledle', 'linkle', 'profille'].includes(match[1])) {
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
  const [isFriendsOpen, setIsFriendsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      return hash.startsWith('#friends') || hash.startsWith('#friend=');
    }
    return false;
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState<boolean>(false);
  const [arcadeGame, setArcadeGame] = useState<ArcadeGameId>('snake');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [leaderboardCategory, setLeaderboardCategory] = useState<LeaderboardCategory>('arcade');
  const [leaderboardGame, setLeaderboardGame] = useState<string>('snake');
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      return hash.startsWith('#shop') || hash.startsWith('#boutique');
    }
    return false;
  });

  const { unlockAchievement } = useAchievements();

  // Mode Rétro CRT Cathodique (Débloqué via le Code Konami)
  const [isCrtActive, setIsCrtActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hoot_crt_mode') === 'true';
    }
    return false;
  });
  const [showCrtControl, setShowCrtControl] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hoot_crt_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isCrtActive) {
        document.body.setAttribute('data-crt', 'true');
      } else {
        document.body.removeAttribute('data-crt');
      }
    }
  }, [isCrtActive]);

  useKonamiCode({
    enabled: true,
    onSuccess: () => {
      soundFx.playKonamiJingle();
      unlockAchievement('konami_code');
      setIsCrtActive((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('hoot_crt_mode', String(next));
        } catch {
          // Ignore
        }
        return next;
      });
      setShowCrtControl(true);
    },
  });

  const handleOpenArcade = (gameId: ArcadeGameId = 'snake') => {
    setArcadeGame(gameId);
    setIsArcadeOpen(true);
  };

  const handleOpenLeaderboard = (category: LeaderboardCategory = 'arcade', gameId?: string) => {
    soundFx.playClick();
    setLeaderboardCategory(category);
    if (gameId) {
      setLeaderboardGame(gameId);
    } else {
      setLeaderboardGame(
        category === 'arcade' ? 'snake' : category === 'quiz' ? 'standard' : 'screenle'
      );
    }
    setIsLeaderboardOpen(true);
  };

  // Switch navigation tabs with sub-game resolution
  const handleTabChange = (tab: NavTab) => {
    if (
      tab === 'minigames' ||
      ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest', 'timeattack', 'versus'].includes(tab)
    ) {
      setCurrentTab('minigames');
      if (tab === 'minigames') {
        setActiveMiniGame('hub');
      } else {
        setActiveMiniGame(tab as MiniGameSubTab);
      }
    } else {
      setCurrentTab(tab);
    }
  };

  // Hash listener for direct deep linking (#minigames, #screenle, #indledle, #linkle, #profille, #chrono, #pixel, #review, #blindtest, #timeattack, #versus, #arcade, #toolbox, #roost, #gems)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#minigames')) {
        setCurrentTab('minigames');
        setActiveMiniGame('hub');
      } else if (hash.startsWith('#screenle')) {
        setCurrentTab('minigames');
        setActiveMiniGame('screenle');
      } else if (hash.startsWith('#indledle')) {
        setCurrentTab('minigames');
        setActiveMiniGame('indledle');
      } else if (hash.startsWith('#linkle')) {
        setCurrentTab('minigames');
        setActiveMiniGame('linkle');
      } else if (hash.startsWith('#profille')) {
        setCurrentTab('minigames');
        setActiveMiniGame('profille');
      } else if (hash.startsWith('#chrono') || hash.startsWith('#timeline')) {
        setCurrentTab('minigames');
        setActiveMiniGame('chrono');
      } else if (hash.startsWith('#pixel') || hash.startsWith('#silhouette')) {
        setCurrentTab('minigames');
        setActiveMiniGame('pixel');
      } else if (hash.startsWith('#review') || hash.startsWith('#critique')) {
        setCurrentTab('minigames');
        setActiveMiniGame('review');
      } else if (hash.startsWith('#blindtest') || hash.startsWith('#audioldle') || hash.startsWith('#ost')) {
        setCurrentTab('minigames');
        setActiveMiniGame('blindtest');
      } else if (hash.startsWith('#timeattack')) {
        setCurrentTab('minigames');
        setActiveMiniGame('timeattack');
        const match = window.location.hash.match(/#timeattack=([a-z]+)/);
        if (match && ['screenle', 'indledle', 'linkle', 'profille'].includes(match[1])) {
          setTimeAttackInitialMode(match[1] as TimeAttackMode);
        }
      } else if (hash.startsWith('#versus')) {
        setCurrentTab('minigames');
        setActiveMiniGame('versus');
      } else if (hash.startsWith('#quiz') || hash.startsWith('#quizz')) {
        setCurrentTab('minigames');
        setActiveMiniGame('quiz');
      } else if (hash.startsWith('#catalog') || hash.startsWith('#steam')) {
        setCurrentTab('catalog');
      } else if (hash.startsWith('#arcade')) {
        setCurrentTab('arcade');
      } else if (hash.startsWith('#toolbox')) {
        setCurrentTab('toolbox');
      } else if (hash.startsWith('#roost')) {
        setCurrentTab('roost');
      } else if (hash.startsWith('#leaderboard')) {
        const match = window.location.hash.match(/#leaderboard=([a-z]+)/);
        if (match && ['arcade', 'timeattack', 'quiz'].includes(match[1])) {
          handleOpenLeaderboard(match[1] as LeaderboardCategory);
        } else {
          handleOpenLeaderboard('arcade');
        }
      } else if (hash.startsWith('#friends') || hash.startsWith('#friend=')) {
        setIsFriendsOpen(true);
      } else if (hash.startsWith('#shop') || hash.startsWith('#boutique')) {
        setIsShopOpen(true);
      } else if (hash.startsWith('#gems') || hash === '') {
        setCurrentTab('gems');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // SEO dynamic document title and URL hash synchronization
  useEffect(() => {
    const lang = getAppLanguage(i18n.language);

    let pageTitle = '';
    let targetHash = '';

    const siteTitles: Partial<Record<NavTab, Record<string, string>>> = {
      gems: {
        fr: 'Hoot Indie Games | Le Sanctuaire des Jeux Vidéo Indépendants',
        en: 'Hoot Indie Games | The Indie Video Game Sanctuary',
        es: 'Hoot Indie Games | El Santuario de los Videojuegos Independientes',
        de: 'Hoot Indie Games | Das Refugium für Indie-Videospiele',
        ja: 'Hoot Indie Games | インディーゲームの聖域',
        'pt-BR': 'Hoot Indie Games | O Santuário dos Jogos Independentes',
      },
      catalog: {
        fr: 'Catalogue Steam Indé — Bibliothèque Étendue & Découvertes | Hoot Indie Games',
        en: 'Indie Steam Catalog — Extended Library & Discoveries | Hoot Indie Games',
        es: 'Catálogo Steam Indie — Biblioteca extendida y descubrimientos | Hoot Indie Games',
        de: 'Indie-Steam-Katalog — Umfassende Bibliothek & Entdeckungen | Hoot Indie Games',
        ja: 'Steamインディーカタログ — 拡張ライブラリ＆名作発見 | Hoot Indie Games',
        'pt-BR': 'Catálogo Steam Indie — Biblioteca estendida e descobertas | Hoot Indie Games',
      },
      arcade: {
        fr: "Salle d'Arcade Rétro & Vectrex 1982 | Hoot Indie Games",
        en: 'Retro Arcade Hall & 1982 Vectrex | Hoot Indie Games',
        es: 'Salón Arcade Retro y Vectrex 1982 | Hoot Indie Games',
        de: 'Retro-Arcade-Halle & 1982 Vectrex | Hoot Indie Games',
        ja: 'レトロアーケード＆1982 Vectrex | Hoot Indie Games',
        'pt-BR': 'Salão de Arcade Retrô e Vectrex 1982 | Hoot Indie Games',
      },
      toolbox: {
        fr: 'Boîte à Outils & Radar Indé | Hoot Indie Games',
        en: 'Toolbox Hub & Indie Radar | Hoot Indie Games',
        es: 'Caja de herramientas y radar indie | Hoot Indie Games',
        de: 'Werkzeugkasten & Indie-Radar | Hoot Indie Games',
        ja: 'インディーツールボックス＆レーダー | Hoot Indie Games',
        'pt-BR': 'Caixa de Ferramentas e Radar Indie | Hoot Indie Games',
      },
      roost: {
        fr: 'Le Perchoir Sylvestre — Portfolio & Projets | Hoot Indie Games',
        en: 'The Roost — Portfolio & Indie Projects | Hoot Indie Games',
        es: 'El Posadero Silvestre — Portafolio y proyectos | Hoot Indie Games',
        de: 'Der Horst — Portfolio & Indie-Projekte | Hoot Indie Games',
        ja: 'フクロウの止まり木 — ポートフォリオ＆プロジェクト | Hoot Indie Games',
        'pt-BR': 'O Poleiro Silvestre — Portfólio e Projetos | Hoot Indie Games',
      },
      minigames: {
        fr: 'Mini-Jeux Indés — Défis & Énigmes Quotidiennes | Hoot Indie Games',
        en: 'Indie Mini-Games — Challenges & Daily Puzzles | Hoot Indie Games',
        es: 'Minijuegos Indie — Desafíos y puzles diarios | Hoot Indie Games',
        de: 'Indie-Minispiele — Tägliche Herausforderungen & Rätsel | Hoot Indie Games',
        ja: 'インディーミニゲーム — デイリーパズル＆挑戦 | Hoot Indie Games',
        'pt-BR': 'Minijogos Indie — Desafios e Quebra-cabeças Diários | Hoot Indie Games',
      },
    };

    if (currentTab === 'minigames' && activeMiniGame !== 'hub') {
      const gameTitle = t(`minigamesHub.${activeMiniGame}.title`);
      const gameSubtitle = t(`minigamesHub.${activeMiniGame}.subtitle`);
      pageTitle = `${gameTitle} — ${gameSubtitle} | Hoot Indie Games`;
      targetHash = `#${activeMiniGame}`;
    } else if (currentTab === 'minigames') {
      pageTitle = siteTitles.minigames?.[lang] || siteTitles.minigames?.en || 'Hoot Indie Games';
      targetHash = '#minigames';
    } else {
      pageTitle = siteTitles[currentTab]?.[lang] || siteTitles[currentTab]?.en || 'Hoot Indie Games';
      targetHash = currentTab === 'gems' ? '' : `#${currentTab}`;
    }

    document.title = pageTitle;

    if (window.location.hash !== targetHash && !(targetHash === '' && window.location.hash === '')) {
      if (targetHash === '') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } else {
        history.replaceState(null, '', targetHash);
      }
    }
  }, [currentTab, activeMiniGame, i18n.language, t]);

  // Scroll to top automatically whenever tab or mini-game sub-mode changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentTab, activeMiniGame]);

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString(todayStr);

  // Ensure selected date is playable (today or yesterday), otherwise fallback to today
  useEffect(() => {
    if (!isDatePlayable(currentDate, todayStr)) {
      setCurrentDate(todayStr);
    }
  }, [currentDate, todayStr]);

  const isYesterdayMode = currentDate === yesterdayStr;
  const isArchiveMode = currentDate !== todayStr;

  const isDailyPuzzleActive =
    currentTab === 'minigames' &&
    ['screenle', 'indledle', 'linkle', 'profille'].includes(activeMiniGame);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-transparent bg-ambient-stars text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Ambient glowing fireflies canvas background */}
      <FirefliesBackground />

      {/* Top sticky Navbar (Consolidated 5 tabs, Mobile-First) */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenFriends={() => setIsFriendsOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLeaderboard={() => handleOpenLeaderboard('arcade')}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onEasterEggTrigger={() => setIsEasterEggOpen(true)}
        currentDate={currentDate}
      />

      {/* Date Switcher & Practice Bar for Daily Games */}
      {isDailyPuzzleActive && (
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
              <span className="font-semibold">{t('app.puzzleDate')}</span>
              <span className="text-amber-400 font-mono font-bold">{currentDate}</span>
              <Archive className="w-3 h-3 text-slate-500 ml-1" />
            </button>

            {isYesterdayMode ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider animate-pulse">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                {t('app.yesterdayBanner')}
              </span>
            ) : isArchiveMode ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                {t('app.archiveBanner')}
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
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" /></div>}>
        <main className="flex-1 w-full relative z-10">
          {currentTab === 'gems' && (
            <GemExplorerHome
            currentDate={currentDate}
            onNavigateTab={handleTabChange}
            onOpenArcade={handleOpenArcade}
          />
        )}

        {currentTab === 'minigames' && (
          <div>
            {/* Sub-Navigation Bar for Mini-games */}
            <MiniGamesNav
              activeSubTab={activeMiniGame}
              onSelectSubTab={setActiveMiniGame}
              currentDate={currentDate}
            />

            {/* Active Game or Hub */}
            <div className="w-full">
              {activeMiniGame === 'hub' && (
                <MiniGamesHub
                  onSelectGame={(g) => setActiveMiniGame(g)}
                  currentDate={currentDate}
                />
              )}

              {activeMiniGame === 'screenle' && (
                <ScreenleGame
                  key={currentDate}
                  currentDate={currentDate}
                  onSelectDate={(newDate) => setCurrentDate(newDate)}
                />
              )}

              {activeMiniGame === 'indledle' && (
                <IndledleGame
                  key={currentDate}
                  currentDate={currentDate}
                  onSelectDate={(newDate) => setCurrentDate(newDate)}
                />
              )}

              {activeMiniGame === 'linkle' && (
                <LinkleGame
                  key={currentDate}
                  currentDate={currentDate}
                  onSelectDate={(newDate) => setCurrentDate(newDate)}
                />
              )}

              {activeMiniGame === 'profille' && (
                <ProfilleGame
                  key={currentDate}
                  currentDate={currentDate}
                  onSelectDate={(newDate) => setCurrentDate(newDate)}
                />
              )}

              {activeMiniGame === 'chrono' && (
                <ChronoGame
                  key={currentDate}
                  currentDate={currentDate}
                  onSelectDate={(newDate) => setCurrentDate(newDate)}
                />
              )}

              {activeMiniGame === 'pixel' && (
                <PixelGame
                  key={currentDate}
                  currentDate={currentDate}
                  onSelectDate={(newDate) => setCurrentDate(newDate)}
                />
              )}

              {activeMiniGame === 'review' && (
                <ReviewGame
                  key={currentDate}
                  currentDate={currentDate}
                  onSelectDate={(newDate) => setCurrentDate(newDate)}
                />
              )}

              {activeMiniGame === 'blindtest' && (
                <BlindTestGame
                  key={currentDate}
                  currentDate={currentDate}
                  onSelectDate={(newDate) => setCurrentDate(newDate)}
                />
              )}

              {activeMiniGame === 'timeattack' && (
                <TimeAttackHub
                  initialMode={timeAttackInitialMode}
                  onOpenLeaderboard={(mode) => handleOpenLeaderboard('timeattack', mode)}
                />
              )}

              {activeMiniGame === 'versus' && (
                <VersusArena onOpenAuth={() => setIsAuthOpen(true)} />
              )}

              {activeMiniGame === 'quiz' && (
                <IndieQuizGame onOpenLeaderboard={(mode) => handleOpenLeaderboard('quiz', mode)} />
              )}
            </div>
          </div>
        )}

        {currentTab === 'microindies' && (
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 animate-in fade-in duration-300">
            <MicroIndieHub />
          </div>
        )}

        {currentTab === 'catalog' && (
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 animate-in fade-in duration-300">
            <SteamCatalogExplorer />
          </div>
        )}
        {currentTab === 'arcade' && (
          <ArcadeHallView
            onOpenGame={handleOpenArcade}
            onOpenLeaderboard={(gameId) => handleOpenLeaderboard('arcade', gameId)}
          />
        )}
        {currentTab === 'toolbox' && <ToolboxHub />}
        {currentTab === 'roost' && (
          <TheRoostHub
            onOpenArcade={handleOpenArcade}
            onNavigateMiniGames={() => handleTabChange('minigames')}
          />
        )}
      </main>

      {/* Global Modals */}
      {isStatsOpen && (
        <StatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
          initialTab={
            currentTab === 'minigames' &&
            ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest'].includes(activeMiniGame)
              ? (activeMiniGame as DailyGameMode)
              : 'screenle'
          }
        />
      )}

      {isAchievementsOpen && (
        <AchievementsModal
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
        />
      )}

      {isCalendarOpen && (
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
      )}

      {isProfileOpen && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
          onOpenFriends={() => setIsFriendsOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
        />
      )}

      {isShopOpen && (
        <FeatherShopModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {isFriendsOpen && (
        <FriendsModal
          isOpen={isFriendsOpen}
          onClose={() => setIsFriendsOpen(false)}
          onStartVersusDuel={(roomCode) => {
            setIsFriendsOpen(false);
            window.location.hash = `#versus=${roomCode}`;
            setCurrentTab('minigames');
            setActiveMiniGame('versus');
          }}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {isEasterEggOpen && (
        <OwlEasterEggModal
          isOpen={isEasterEggOpen}
          onClose={() => setIsEasterEggOpen(false)}
          onOpenArcade={() => handleOpenArcade('snake')}
        />
      )}

      {isArcadeOpen && (
        <ArcadeModal
          isOpen={isArcadeOpen}
          initialGame={arcadeGame}
          onClose={() => setIsArcadeOpen(false)}
          onOpenLeaderboard={(gameId) => handleOpenLeaderboard('arcade', gameId)}
        />
      )}

      {isLeaderboardOpen && (
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
          initialCategory={leaderboardCategory}
          initialGame={leaderboardGame}
        />
      )}

      {isAdminDashboardOpen && (
        <AdminDashboardModal
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
        />
      )}

      <ChatDrawer />

      {showCrtControl && (
        <CrtRetroControl
          isActive={isCrtActive}
          onToggle={() => {
            setIsCrtActive((prev) => {
              const next = !prev;
              try {
                localStorage.setItem('hoot_crt_mode', String(next));
              } catch {
                // Ignore
              }
              return next;
            });
          }}
          onClose={() => setShowCrtControl(false)}
        />
      )}
      </React.Suspense>

      {/* Footer */}
      <div className="relative z-10">
        <Footer
          onSelectTab={handleTabChange}
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
            <FriendsProvider>
              <ChatProvider>
                <AppContent />
              </ChatProvider>
            </FriendsProvider>
          </SteamCatalogProvider>
        </AchievementsProvider>
      </GameStatsProvider>
    </UserAccountProvider>
  );
}
