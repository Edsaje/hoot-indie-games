import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Dices,
  Clock,
  PiggyBank,
  Compass,
  HelpCircle,
  ExternalLink,
  RotateCw,
  Calendar,
  CheckCircle2,
  XCircle,
  Flame,
  Activity,
  Database,
} from 'lucide-react';
import { INDIE_GAMES } from '../../data/games';
import { UPCOMING_INDIE_GAMES } from '../../data/upcomingGames';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { SteamCatalogExplorer } from '../steam/SteamCatalogExplorer';
import { soundFx } from '../../utils/audio';
import { useAchievements } from '../../context/useAchievements';

type ToolboxTab = 'roulette' | 'backlog' | 'budget' | 'gems' | 'quiz' | 'radar' | 'analytics' | 'steam';

interface GameBacklogInfo {
  id: string;
  title: string;
  hours: number;
  steamUrl?: string;
  genre: string;
}

const BACKLOG_GAMES: GameBacklogInfo[] = [
  { id: 'hollow-knight', title: 'Hollow Knight', hours: 35, genre: 'Metroidvania', steamUrl: 'https://store.steampowered.com/app/367520/' },
  { id: 'celeste', title: 'Celeste', hours: 10, genre: 'Platformer', steamUrl: 'https://store.steampowered.com/app/504230/' },
  { id: 'outer-wilds', title: 'Outer Wilds', hours: 22, genre: 'Exploration', steamUrl: 'https://store.steampowered.com/app/753640/' },
  { id: 'hades', title: 'Hades', hours: 45, genre: 'Roguelike', steamUrl: 'https://store.steampowered.com/app/1145360/' },
  { id: 'dead-cells', title: 'Dead Cells', hours: 30, genre: 'Roguelite', steamUrl: 'https://store.steampowered.com/app/588650/' },
  { id: 'undertale', title: 'Undertale', hours: 7, genre: 'RPG', steamUrl: 'https://store.steampowered.com/app/391540/' },
  { id: 'slay-the-spire', title: 'Slay the Spire', hours: 50, genre: 'Deckbuilder', steamUrl: 'https://store.steampowered.com/app/646570/' },
  { id: 'tunic', title: 'Tunic', hours: 14, genre: 'Action-Adventure', steamUrl: 'https://store.steampowered.com/app/553420/' },
  { id: 'cuphead', title: 'Cuphead', hours: 12, genre: 'Boss Rush', steamUrl: 'https://store.steampowered.com/app/268910/' },
  { id: 'disco-elysium', title: 'Disco Elysium', hours: 32, genre: 'Narrative RPG', steamUrl: 'https://store.steampowered.com/app/632470/' },
  { id: 'inscryption', title: 'Inscryption', hours: 13, genre: 'Card Roguelike', steamUrl: 'https://store.steampowered.com/app/1092790/' },
  { id: 'stardew-valley', title: 'Stardew Valley', hours: 65, genre: 'Simulation', steamUrl: 'https://store.steampowered.com/app/413150/' },
  { id: 'subnautica', title: 'Subnautica', hours: 30, genre: 'Survival', steamUrl: 'https://store.steampowered.com/app/264710/' },
  { id: 'balatro', title: 'Balatro', hours: 40, genre: 'Poker Roguelike', steamUrl: 'https://store.steampowered.com/app/2379780/' },
  { id: 'animal-well', title: 'Animal Well', hours: 11, genre: 'Puzzle Metroidvania', steamUrl: 'https://store.steampowered.com/app/813230/' },
  { id: 'sea-of-stars', title: 'Sea of Stars', hours: 28, genre: 'Turn-based RPG', steamUrl: 'https://store.steampowered.com/app/1244090/' },
  { id: 'blasphemous', title: 'Blasphemous', hours: 16, genre: 'Action Soulslike', steamUrl: 'https://store.steampowered.com/app/774360/' },
  { id: 'signalis', title: 'Signalis', hours: 10, genre: 'Survival Horror', steamUrl: 'https://store.steampowered.com/app/1262350/' },
  { id: 'dave-the-diver', title: 'Dave the Diver', hours: 25, genre: 'Adventure RPG', steamUrl: 'https://store.steampowered.com/app/1868140/' },
];

interface SaleGameItem {
  id: string;
  title: string;
  normalPrice: number;
  salePrice: number;
  discount: number;
  hours: number;
  score: number; // /100
}

const SALE_GAMES: SaleGameItem[] = [
  { id: 'celeste', title: 'Celeste', normalPrice: 19.99, salePrice: 4.99, discount: 75, hours: 12, score: 96 },
  { id: 'hollow-knight', title: 'Hollow Knight', normalPrice: 14.79, salePrice: 7.39, discount: 50, hours: 35, score: 97 },
  { id: 'slay-the-spire', title: 'Slay the Spire', normalPrice: 22.99, salePrice: 7.81, discount: 66, hours: 50, score: 96 },
  { id: 'dead-cells', title: 'Dead Cells', normalPrice: 24.99, salePrice: 12.49, discount: 50, hours: 30, score: 94 },
  { id: 'outer-wilds', title: 'Outer Wilds', normalPrice: 22.99, salePrice: 13.79, discount: 40, hours: 22, score: 95 },
  { id: 'hades', title: 'Hades', normalPrice: 24.50, salePrice: 9.80, discount: 60, hours: 45, score: 98 },
  { id: 'undertale', title: 'Undertale', normalPrice: 9.99, salePrice: 2.99, discount: 70, hours: 8, score: 96 },
  { id: 'disco-elysium', title: 'Disco Elysium', normalPrice: 39.99, salePrice: 9.99, discount: 75, hours: 32, score: 95 },
  { id: 'tunic', title: 'Tunic', normalPrice: 27.99, salePrice: 13.99, discount: 50, hours: 15, score: 92 },
  { id: 'inscryption', title: 'Inscryption', normalPrice: 19.99, salePrice: 9.99, discount: 50, hours: 14, score: 95 },
  { id: 'balatro', title: 'Balatro', normalPrice: 13.99, salePrice: 12.59, discount: 10, hours: 40, score: 98 },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    questionFr: "Dans quel jeu explorez-vous un système solaire réinitialisé toutes les 22 minutes par l'explosion d'une supernova ?",
    questionEn: "In which game do you explore a planetary solar system resetting every 22 minutes due to a supernova?",
    options: ["Subnautica", "Outer Wilds", "No Man's Sky", "Signalis"],
    correctAnswer: 1,
    explanationFr: "Outer Wilds, créé par Mobius Digital, vous fait vivre une boucle temporelle de 22 minutes rythmée par le banjo d'Andrew Prahlow.",
    explanationEn: "Outer Wilds by Mobius Digital features a brilliant 22-minute cosmic time loop punctuated by Andrew Prahlow's iconic banjo.",
  },
  {
    id: 2,
    questionFr: "Quel compositeur de génie a créé l'intégralité de la bande originale d'Undertale tout en développant le jeu ?",
    questionEn: "Which solo creator composed the entire iconic soundtrack of Undertale while developing the game?",
    options: ["Lena Raine", "Toby Fox", "Darren Korb", "Christopher Larkin"],
    correctAnswer: 1,
    explanationFr: "Toby Fox a composé tous les thèmes inoubliables d'Undertale, dont Megalovania et Hopes and Dreams !",
    explanationEn: "Toby Fox composed every unforgettable Undertale track, including Megalovania and Hopes and Dreams!",
  },
  {
    id: 3,
    questionFr: "Dans Tunic, quel artefact central reconstituez-vous page par page tout au long de l'aventure ?",
    questionEn: "In Tunic, what core artifact do you reconstruct page by page throughout your adventure?",
    options: ["Un grimoire magique", "Le livret d'instructions rétro du jeu", "La carte de l'archipel", "Un journal de bord pirate"],
    correctAnswer: 1,
    explanationFr: "Le joueur reconstitue le manuel de jeu papier rétro façon NES, regorgeant d'illustrations et de codes secrets indéchiffrables au départ.",
    explanationEn: "Players piece together an authentic retro NES-style printed instruction manual filled with hidden cryptic puzzles.",
  },
  {
    id: 4,
    questionFr: "Combien d'années de développement solo ont été nécessaires à Eric Barone (ConcernedApe) pour créer Stardew Valley ?",
    questionEn: "How many years of dedicated solo development did Eric Barone spend creating Stardew Valley?",
    options: ["2 ans", "4 ans et demi", "7 ans", "1 an"],
    correctAnswer: 1,
    explanationFr: "Eric Barone a travaillé seul pendant 4 ans et demi, codant, dessinant le pixel art et composant les musiques jusqu'à la sortie en 2016.",
    explanationEn: "Eric Barone spent 4.5 years working 10+ hours a day alone on code, art, and music before releasing the gem in 2016.",
  },
  {
    id: 5,
    questionFr: "Dans Balatro, quel type d'objet modifie drastiquement les règles et déclenche des multiplicateurs exponentiels ?",
    questionEn: "In Balatro, which cards drastically break the traditional poker rules with wild multipliers?",
    options: ["Les Jokers", "Les Cartes Tarot", "Les Sceaux d'or", "Les Vouchers célestes"],
    correctAnswer: 0,
    explanationFr: "Les Jokers (150+ différents) constituent le cœur du deckbuilding de Balatro, octroyant des jetons et multiplicateurs démentiels !",
    explanationEn: "Jokers (150+ unique cards) drive Balatro's addictive synergy combinations and stratospheric score explosions!",
  },
];

export const ToolboxHub: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { unlockAchievement } = useAchievements();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const [activeTab, setActiveTab] = useState<ToolboxTab>('roulette');

  // --- Roulette State ---
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rouletteWinner, setRouletteWinner] = useState<typeof INDIE_GAMES[0] | null>(null);
  const [spinCount, setSpinCount] = useState<number>(0);

  // --- Backlog State ---
  const [selectedBacklogIds, setSelectedBacklogIds] = useState<string[]>([
    'celeste',
    'hades',
    'tunic',
  ]);
  const [dailyHours, setDailyHours] = useState<number>(2);

  // --- Budget State ---
  const [userBudget, setUserBudget] = useState<number>(30);
  const [optimizedCart, setOptimizedCart] = useState<SaleGameItem[]>([]);

  // --- Gems Filter State ---
  const [gemSearch, setGemSearch] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // --- Quiz State ---
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showQuizExplanation, setShowQuizExplanation] = useState<boolean>(false);

  // Spin Roulette Handler
  const handleSpinRoulette = () => {
    soundFx.playClick();
    setIsSpinning(true);
    setRouletteWinner(null);

    let candidates = INDIE_GAMES;
    if (selectedMood === 'cozy') {
      candidates = INDIE_GAMES.filter((g) =>
        ['stardew-valley', 'celeste', 'tunic', 'sea-of-stars', 'dave-the-diver'].includes(g.id)
      );
    } else if (selectedMood === 'action') {
      candidates = INDIE_GAMES.filter((g) =>
        ['hades', 'dead-cells', 'cuphead', 'blasphemous', 'hollow-knight'].includes(g.id)
      );
    } else if (selectedMood === 'cerebral') {
      candidates = INDIE_GAMES.filter((g) =>
        ['outer-wilds', 'slay-the-spire', 'balatro', 'inscryption', 'animal-well'].includes(g.id)
      );
    } else if (selectedMood === 'dark') {
      candidates = INDIE_GAMES.filter((g) =>
        ['disco-elysium', 'signalis', 'inscryption', 'blasphemous', 'hollow-knight'].includes(g.id)
      );
    }

    if (candidates.length === 0) candidates = INDIE_GAMES;

    let counter = 0;
    const interval = setInterval(() => {
      soundFx.playClick();
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
        setRouletteWinner(randomPick);
        setIsSpinning(false);
        setSpinCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            unlockAchievement('roulette_gambler');
          }
          return next;
        });
        soundFx.playVictory();
      }
    }, 120);
  };

  // Backlog Calculations
  const toggleBacklogItem = (id: string) => {
    soundFx.playClick();
    if (selectedBacklogIds.includes(id)) {
      setSelectedBacklogIds(selectedBacklogIds.filter((item) => item !== id));
    } else {
      setSelectedBacklogIds([...selectedBacklogIds, id]);
    }
  };

  const totalBacklogHours = selectedBacklogIds.reduce((acc, id) => {
    const item = BACKLOG_GAMES.find((g) => g.id === id);
    return acc + (item ? item.hours : 0);
  }, 0);

  const daysToComplete = dailyHours > 0 ? Math.ceil(totalBacklogHours / dailyHours) : 0;
  const projectedFinishDate = new Date();
  projectedFinishDate.setDate(projectedFinishDate.getDate() + daysToComplete);

  // Budget Knapsack Optimizer
  const optimizeBudget = () => {
    soundFx.playClick();
    // Greedy heuristic sorting by value = (score * hours) / salePrice
    const sorted = [...SALE_GAMES].sort((a, b) => {
      const valA = (a.score * a.hours) / a.salePrice;
      const valB = (b.score * b.hours) / b.salePrice;
      return valB - valA;
    });

    const cart: SaleGameItem[] = [];
    let currentCost = 0;

    for (const game of sorted) {
      if (currentCost + game.salePrice <= userBudget) {
        cart.push(game);
        currentCost += game.salePrice;
      }
    }

    setOptimizedCart(cart);
    soundFx.playChime();
  };

  // Quiz Answer Handler
  const handleQuizAnswer = (optionIdx: number) => {
    if (showQuizExplanation) return;
    setSelectedOption(optionIdx);
    setShowQuizExplanation(true);
    if (optionIdx === QUIZ_QUESTIONS[currentQuestionIdx].correctAnswer) {
      setQuizScore((prev) => prev + 1);
      soundFx.playChime();
    } else {
      soundFx.playError();
    }
  };

  const nextQuizQuestion = () => {
    soundFx.playClick();
    setSelectedOption(null);
    setShowQuizExplanation(false);
    if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setCurrentQuestionIdx(0);
      setQuizScore(0);
    }
  };

  // Filtered Gems
  const allGenresList = Array.from(
    new Set(INDIE_GAMES.flatMap((g) => g.genre))
  ).sort();

  const filteredGems = INDIE_GAMES.filter((g) => {
    const matchesSearch =
      gemSearch.trim() === '' ||
      g.title.toLowerCase().includes(gemSearch.toLowerCase()) ||
      g.developer.toLowerCase().includes(gemSearch.toLowerCase());
    const matchesGenre =
      selectedGenre === 'all' || g.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Wrench className="w-3.5 h-3.5" />
          Hub Pratique
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t('toolbox.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl mx-auto">
          {t('toolbox.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-[#131a29] p-1.5 rounded-2xl border border-[#1e293b] max-w-2xl mx-auto">
        {(
          [
            { id: 'roulette', label: t('toolbox.tabs.roulette'), icon: Dices },
            { id: 'backlog', label: t('toolbox.tabs.backlog'), icon: Clock },
            { id: 'budget', label: t('toolbox.tabs.budget'), icon: PiggyBank },
            { id: 'gems', label: t('toolbox.tabs.gems'), icon: Compass },
            { id: 'quiz', label: t('toolbox.tabs.quiz'), icon: HelpCircle },
            { id: 'radar', label: lang === 'fr' ? 'Radar Sorties' : 'Upcoming Radar', icon: Flame },
            { id: 'analytics', label: lang === 'fr' ? 'Observatoire Télémétrie' : 'Cookieless Tracker', icon: Activity },
            { id: 'steam', label: lang === 'fr' ? 'Catalogue Steam' : 'Steam Catalog', icon: Database },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                active
                  ? 'bg-[#f59e0b] text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ROULETTE */}
      {activeTab === 'roulette' && (
        <div className="max-w-2xl mx-auto bg-[#131a29] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
            <Dices className="w-5 h-5 text-[#f59e0b]" />
            {t('toolbox.roulette.heading')}
          </h2>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-slate-300">
              {lang === 'fr' ? 'Sélectionnez une ambiance pour tirer au sort un jeu adapté à votre soirée.' : 'Select a vibe to randomly pick an indie game tailored for tonight.'}
            </p>
            {spinCount > 0 && (
              <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 shrink-0 ml-2">
                {spinCount} {spinCount === 1 ? 'tirage' : 'tirages'}
              </span>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t('toolbox.roulette.mood')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'all', label: t('toolbox.roulette.allMoods') },
                { id: 'cozy', label: t('toolbox.roulette.cozy') },
                { id: 'action', label: t('toolbox.roulette.action') },
                { id: 'cerebral', label: t('toolbox.roulette.cerebral') },
                { id: 'dark', label: t('toolbox.roulette.dark') },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedMood(m.id);
                  }}
                  className={`py-2 px-2.5 text-xs rounded-xl font-bold border transition text-center ${
                    selectedMood === m.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-[#0b0f19] border-[#1e293b] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSpinRoulette}
            disabled={isSpinning}
            className="w-full py-4 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-base rounded-2xl transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? t('toolbox.roulette.spinning') : t('toolbox.roulette.spin')}
          </button>

          {rouletteWinner && (
            <div className="mt-8 bg-[#0b0f19] border-2 border-amber-500/40 rounded-2xl p-5 animate-in zoom-in-95 duration-300">
              <div className="text-xs uppercase tracking-widest text-[#f59e0b] font-bold mb-2">
                {t('toolbox.roulette.resultTitle')}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={rouletteWinner.screenshots[5] || rouletteWinner.screenshots[0]}
                  alt={rouletteWinner.title}
                  className="w-full sm:w-44 h-28 object-cover rounded-xl border border-[#1e293b]"
                />
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-black text-white">
                    {rouletteWinner.title}
                  </h3>
                  <div className="text-xs text-[#f59e0b] font-semibold mt-0.5">
                    {rouletteWinner.releaseYear} • {rouletteWinner.developer}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 italic">
                    "{rouletteWinner.hints.tagline[lang]}"
                  </p>
                  <div className="mt-3">
                    {rouletteWinner.steamUrl && (
                      <a
                        href={rouletteWinner.steamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition"
                      >
                        {t('toolbox.roulette.launchSteam')}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BACKLOG ESTIMATOR */}
      {activeTab === 'backlog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#131a29] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#f59e0b]" />
                {t('toolbox.backlog.heading')}
              </h2>
              <button
                onClick={() => setSelectedBacklogIds([])}
                className="text-xs text-slate-400 hover:text-red-400 transition underline"
              >
                {t('toolbox.backlog.clearSelection')}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              {t('toolbox.backlog.desc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
              {BACKLOG_GAMES.map((game) => {
                const isSelected = selectedBacklogIds.includes(game.id);
                return (
                  <div
                    key={game.id}
                    onClick={() => toggleBacklogItem(game.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-[#0b0f19] border-[#1e293b] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                          isSelected
                            ? 'bg-[#f59e0b] border-amber-500 text-slate-950 font-bold'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 leading-tight">
                          {game.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {game.genre}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#f59e0b]">
                      ~{game.hours}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backlog Summary Sidebar */}
          <div className="bg-[#131a29] border border-[#1e293b] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Synthèse Prévisionnelle
              </h3>

              <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl mb-4 text-center">
                <div className="text-xs text-slate-400 mb-1">
                  {t('toolbox.backlog.totalEstimated')}
                </div>
                <div className="text-4xl font-black text-white">
                  {totalBacklogHours} <span className="text-lg text-[#f59e0b]">heures</span>
                </div>
                <div className="text-xs text-amber-400/80 mt-1">
                  {t('toolbox.backlog.selectedGames', { count: selectedBacklogIds.length })}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>{t('toolbox.backlog.dailyHours')}</span>
                  <span className="text-[#f59e0b]">
                    {t('toolbox.backlog.hoursPerDay', { count: dailyHours })}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Calendar className="w-4 h-4 text-[#8b5cf6]" />
                  {t('toolbox.backlog.completionDate')}
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  {daysToComplete === 0
                    ? '-'
                    : projectedFinishDate.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Soit environ {daysToComplete} jour(s) de périple ludique.
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500 italic">
              "Le véritable voyage dans un jeu indé ne réside pas dans l'achèvement, mais dans chaque secret découvert."
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STEAM SALE OPTIMIZER */}
      {activeTab === 'budget' && (
        <div className="max-w-3xl mx-auto bg-[#131a29] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-[#f59e0b]" />
            {t('toolbox.budget.heading')}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            {t('toolbox.budget.desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('toolbox.budget.budgetLabel')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="150"
                  value={userBudget}
                  onChange={(e) => setUserBudget(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 bg-[#0b0f19] border-2 border-[#1e293b] focus:border-[#f59e0b] rounded-2xl text-white font-bold text-base focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
              </div>
            </div>

            <button
              onClick={optimizeBudget}
              className="w-full sm:w-auto mt-auto px-6 py-3.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap"
            >
              {t('toolbox.budget.calculate')}
            </button>
          </div>

          {optimizedCart.length > 0 && (
            <div className="bg-[#0b0f19] border-2 border-emerald-500/40 rounded-2xl p-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4 border-b border-[#1e293b] pb-3">
                <h3 className="font-black text-white text-base">
                  {t('toolbox.budget.optimalSelection')}
                </h3>
                <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  {optimizedCart.length} jeux sélectionnés
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {optimizedCart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#131a29] border border-[#1e293b] text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{item.title}</span>
                      <span className="ml-2 text-xs text-slate-300">~{item.hours}h • {item.score}% positif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs">
                        -{item.discount}%
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {item.salePrice.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#1e293b]">
                <div className="p-2 bg-[#131a29] rounded-xl">
                  <div className="text-xs uppercase text-slate-300 font-bold">Total</div>
                  <div className="text-sm font-black text-white">
                    {optimizedCart.reduce((acc, i) => acc + i.salePrice, 0).toFixed(2)} €
                  </div>
                </div>
                <div className="p-2 bg-[#131a29] rounded-xl">
                  <div className="text-xs uppercase text-slate-300 font-bold">Reste</div>
                  <div className="text-sm font-black text-emerald-400">
                    {(userBudget - optimizedCart.reduce((acc, i) => acc + i.salePrice, 0)).toFixed(2)} €
                  </div>
                </div>
                <div className="p-2 bg-[#131a29] rounded-xl">
                  <div className="text-xs uppercase text-slate-300 font-bold">Heures de jeu</div>
                  <div className="text-sm font-black text-[#f59e0b]">
                    ~{optimizedCart.reduce((acc, i) => acc + i.hours, 0)}h
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HIDDEN GEMS EXPLORER */}
      {activeTab === 'gems' && (
        <div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <input
              type="text"
              value={gemSearch}
              onChange={(e) => setGemSearch(e.target.value)}
              placeholder={t('toolbox.gems.search')}
              className="w-full sm:flex-1 px-4 py-3 bg-[#131a29] border border-[#1e293b] focus:border-[#f59e0b] rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none"
            />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-[#131a29] border border-[#1e293b] rounded-2xl text-slate-300 text-sm focus:outline-none"
            >
              <option value="all">{t('toolbox.gems.filterGenre')}</option>
              {allGenresList.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGems.map((game) => (
              <div
                key={game.id}
                className="bg-[#131a29] border border-[#1e293b] rounded-2xl overflow-hidden hover:border-amber-500/50 transition duration-200 group flex flex-col justify-between"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-950">
                  <img
                    src={game.screenshots[5] || game.screenshots[0]}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-amber-400 border border-white/10">
                    {game.releaseYear}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-amber-400 transition">
                      {game.title}
                    </h3>
                    <div className="text-xs text-slate-400 mb-2">
                      {game.developer}
                    </div>
                    <p className="text-xs text-slate-300 italic mb-3 line-clamp-2">
                      "{game.hints.tagline[lang]}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {game.genre.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-0.5 rounded-md bg-[#0b0f19] text-slate-300 text-xs font-medium border border-slate-800"
                        >
                          {g}
                        </span>
                      ))}
                    </div>

                    {game.steamUrl && (
                      <a
                        href={game.steamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                        title={t('common.viewOnSteam')}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: INDIE LORE & TRIVIA QUIZ */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto bg-[#131a29] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              {t('toolbox.quiz.question', {
                current: currentQuestionIdx + 1,
                total: QUIZ_QUESTIONS.length,
              })}
            </span>
            <span className="text-xs font-mono font-bold text-slate-300 bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#1e293b]">
              {t('toolbox.quiz.score', {
                score: quizScore,
                total: QUIZ_QUESTIONS.length,
              })}
            </span>
          </div>

          <h3 className="text-lg font-black text-white mb-6 leading-relaxed">
            {lang === 'fr'
              ? QUIZ_QUESTIONS[currentQuestionIdx].questionFr
              : QUIZ_QUESTIONS[currentQuestionIdx].questionEn}
          </h3>

          <div className="space-y-3 mb-6">
            {QUIZ_QUESTIONS[currentQuestionIdx].options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === QUIZ_QUESTIONS[currentQuestionIdx].correctAnswer;

              let btnStyle = 'bg-[#0b0f19] border-[#1e293b] text-slate-300 hover:border-slate-600';
              if (showQuizExplanation) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-red-950/60 border-red-500 text-red-300';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleQuizAnswer(idx)}
                  disabled={showQuizExplanation}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all text-sm flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {showQuizExplanation && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {showQuizExplanation && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {showQuizExplanation && (
            <div className="p-4 rounded-2xl bg-[#0b0f19] border border-amber-500/30 mb-6 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-200">
              <span className="font-bold text-[#f59e0b] block mb-1">
                {t('toolbox.quiz.explanation')}
              </span>
              {lang === 'fr'
                ? QUIZ_QUESTIONS[currentQuestionIdx].explanationFr
                : QUIZ_QUESTIONS[currentQuestionIdx].explanationEn}
            </div>
          )}

          {showQuizExplanation && (
            <button
              onClick={nextQuizQuestion}
              className="w-full py-3 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg shadow-amber-500/20 active:scale-95"
            >
              {currentQuestionIdx < QUIZ_QUESTIONS.length - 1
                ? t('toolbox.quiz.next')
                : t('toolbox.quiz.restart')}
            </button>
          )}
        </div>
      )}

      {/* TAB 6: RADAR SORTIES INDÉES */}
      {activeTab === 'radar' && (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
          <div className="bg-[#131a29] border border-[#1e293b] rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#f59e0b]" />
                {lang === 'fr' ? 'Radar des Sorties Indés Attendues' : 'Anticipated Indie Releases Radar'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'fr'
                  ? 'Surveillance des futures pépites indés, fenêtres de sortie et wishlists Steam officielles.'
                  : 'Tracking upcoming indie masterworks, launch windows, and official Steam wishlists.'}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              {UPCOMING_INDIE_GAMES.length} {lang === 'fr' ? 'jeux sous surveillance' : 'games on radar'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UPCOMING_INDIE_GAMES.map((game) => (
              <div
                key={game.id}
                className="bg-[#131a29] border border-[#1e293b] rounded-2xl p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        {game.expectedDate[lang]}
                      </span>
                      <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition mt-1.5">
                        {game.title}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium">
                        {game.developer} {game.publisher !== game.developer && `• ${game.publisher}`}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs uppercase font-bold text-slate-400 block">
                        Hype
                      </span>
                      <span className="text-sm font-mono font-black text-amber-400">
                        {game.hypeScore}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {game.description[lang]}
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] mb-4 text-xs text-amber-200/90 italic">
                    « {game.highlight[lang]} »
                  </div>
                </div>

                <div>
                  {/* Platforms & Genres */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {game.genres.map((g, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#0b0f19] border border-[#1e293b] text-xs text-slate-300 font-medium"
                      >
                        {g[lang]}
                      </span>
                    ))}
                    {game.platforms.map((p, i) => (
                      <span
                        key={`plat-${i}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  {game.steamUrl && (
                    <a
                      href={game.steamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0b0f19] hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold text-xs transition"
                    >
                      <span>{lang === 'fr' ? 'Suivre & Wishlist sur Steam' : 'Wishlist on Steam'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: ANALYTICS & TELEMETRY */}
      {activeTab === 'analytics' && <AnalyticsDashboard />}

      {/* TAB 8: STEAM CATALOG EXPLORER & INGESTION */}
      {activeTab === 'steam' && <SteamCatalogExplorer />}
    </div>
  );
};
