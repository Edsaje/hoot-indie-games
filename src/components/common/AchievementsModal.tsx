import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAchievements } from '../../context/useAchievements';
import { soundFx } from '../../utils/audio';
import {
  X,
  Feather,
  Eye,
  Sparkles,
  Globe,
  Moon,
  BookOpen,
  Dices,
  Compass,
  Award,
  Trophy,
  Puzzle,
  Swords,
  Lock,
  CheckCircle2,
  Gamepad2,
  Zap,
  Sun,
  Crown,
  Play,
} from 'lucide-react';
import type { Achievement } from '../../types/achievements';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { getLocalizedText } from '../../utils/localization';
import { getChallengeStatusForDate, getTodayDateString } from '../../utils/streakManager';
import {
  getClaimedDailyFeathers,
  DAILY_GAME_FEATHER_REWARD,
  DAILY_GRAND_SLAM_BONUS,
  ALL_DAILY_GAMES,
  formatFeathers,
} from '../../utils/featherEconomy';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateGame?: (gameId: string) => void;
}

const renderIcon = (iconName: string, isUnlocked: boolean) => {
  const className = `w-5 h-5 ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`;
  switch (iconName) {
    case 'Feather':
      return <Feather className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'Moon':
      return <Moon className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Dices':
      return <Dices className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Puzzle':
      return <Puzzle className={className} />;
    case 'Swords':
      return <Swords className={className} />;
    case 'Gamepad2':
      return <Gamepad2 className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

const DAILY_GAMES_METADATA = [
  {
    id: 'screenle',
    title: 'Capture',
    subtitle: "Capture d'écran du jour zoomée",
    icon: '📸',
    border: 'border-cyan-500/40',
    badge: 'bg-cyan-500/20 text-cyan-300',
  },
  {
    id: 'indledle',
    title: 'Classic',
    subtitle: 'Wordle du jeu indé en 6 essais',
    icon: '🔍',
    border: 'border-amber-500/40',
    badge: 'bg-amber-500/20 text-amber-300',
  },
  {
    id: 'linkle',
    title: 'Connexions',
    subtitle: 'Reliez 16 pépites en 4 familles',
    icon: '🧩',
    border: 'border-purple-500/40',
    badge: 'bg-purple-500/20 text-purple-300',
  },
  {
    id: 'profille',
    title: 'Profil',
    subtitle: "Fiche d'identité aux indices textuels",
    icon: '📋',
    border: 'border-emerald-500/40',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    id: 'chrono',
    title: 'Chrono',
    subtitle: 'Frise chronologique de 5 jeux',
    icon: '⏳',
    border: 'border-teal-500/40',
    badge: 'bg-teal-500/20 text-teal-300',
  },
  {
    id: 'pixel',
    title: 'Pixel & Silhouette',
    subtitle: 'Mosaïque dé-pixellisée & ombre',
    icon: '🎨',
    border: 'border-indigo-500/40',
    badge: 'bg-indigo-500/20 text-indigo-300',
  },
  {
    id: 'review',
    title: 'Critique Steam',
    subtitle: 'Évaluation officielle caviardée',
    icon: '💬',
    border: 'border-rose-500/40',
    badge: 'bg-rose-500/20 text-rose-300',
  },
  {
    id: 'blindtest',
    title: 'Blind Test OST',
    subtitle: 'Extraits musicaux au synthétiseur',
    icon: '🎵',
    border: 'border-violet-500/40',
    badge: 'bg-violet-500/20 text-violet-300',
  },
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  onNavigateGame,
}) => {
  const { t, i18n } = useTranslation();
  const { allAchievements, unlockedIds, feathersCount } = useAchievements();
  const [mainTab, setMainTab] = useState<'permanent' | 'daily'>('permanent');
  const [filter, setFilter] = useState<'all' | 'gameplay' | 'exploration' | 'mastery'>('all');

  const todayStr = useMemo(() => getTodayDateString(), []);
  const challengeStatus = useMemo(() => getChallengeStatusForDate(todayStr), [todayStr]);
  const claimedRecord = useMemo(() => getClaimedDailyFeathers(todayStr), [todayStr, feathersCount]);

  if (!isOpen) return null;

  // Calculs Succès Permanents
  const filteredAchievements = allAchievements.filter((ach) => {
    if (filter === 'all') return true;
    return ach.category === filter;
  });

  // Filtrage strict : uniquement les succès valides dans allAchievements
  const validUnlockedIds = useMemo(() => {
    const validSet = new Set(allAchievements.map((a) => a.id));
    return Array.from(new Set(unlockedIds.filter((id) => validSet.has(id))));
  }, [unlockedIds, allAchievements]);

  const totalPossibleFeathers = allAchievements.reduce((acc, a) => acc + a.feathersReward, 0);
  const unlockedAchievementFeathers = validUnlockedIds.reduce((sum, id) => {
    const ach = allAchievements.find((a) => a.id === id);
    return sum + (ach ? ach.feathersReward : 0);
  }, 0);
  const progressPercent = Math.min(100, Math.round((validUnlockedIds.length / allAchievements.length) * 100));

  // Calculs Quotidien
  const completedDailyCount = ALL_DAILY_GAMES.filter((g) => {
    const st = challengeStatus[g as keyof typeof challengeStatus];
    return st === 'won' || claimedRecord.claimedGames.includes(g);
  }).length;

  const dailyFeathersClaimed =
    claimedRecord.claimedGames.length * DAILY_GAME_FEATHER_REWARD +
    (claimedRecord.grandSlamClaimed ? DAILY_GRAND_SLAM_BONUS : 0);

  const totalDailyFeathersPossible = 8 * DAILY_GAME_FEATHER_REWARD + DAILY_GRAND_SLAM_BONUS; // 105
  const dailyFeathersRemaining = Math.max(0, totalDailyFeathersPossible - dailyFeathersClaimed);
  const dailyProgressPercent = Math.round((dailyFeathersClaimed / totalDailyFeathersPossible) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-modal-title"
      className="fixed inset-0 z-[65] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative overflow-visible w-full max-w-2xl bg-[#06241b] border-2 border-[#78350f] rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col max-h-[90dvh]">
        <SylvestreIvyFrame density="medium" rounded="3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Feather className="w-6 h-6" />
            </div>
            <div>
              <h2 id="achievements-modal-title" className="text-xl font-black text-white flex items-center gap-2">
                {t('achievementsModal.title')}
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold">
                  <Feather className="w-3.5 h-3.5 text-amber-400" />
                  {formatFeathers(feathersCount)} 🪶
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Accomplissez des défis permanents et récoltez vos plumes quotidiennes.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Onglets : Succès Permanents vs Quotidien */}
        <div className="flex items-center gap-2 p-1 bg-[#04130e] rounded-2xl border border-[#0d3b2c] mt-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setMainTab('permanent');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
              mainTab === 'permanent'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'text-slate-300 hover:text-white hover:bg-[#06241b]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Succès du Sanctuaire ({validUnlockedIds.length}/{allAchievements.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setMainTab('daily');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
              mainTab === 'daily'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'text-slate-300 hover:text-white hover:bg-[#06241b]'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Quotidien ({completedDailyCount}/8 • +{dailyFeathersRemaining} 🪶)</span>
          </button>
        </div>

        {/* SECTION 1 : SUCCÈS PERMANENTS */}
        {mainTab === 'permanent' && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Global Progress Bar */}
            <div className="py-3.5 border-b border-[#1e293b]/70 shrink-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">
                  {t('achievementsModal.overallProgress')}
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {validUnlockedIds.length} / {allAchievements.length} ({progressPercent}%) • {unlockedAchievementFeathers} / {totalPossibleFeathers} {t('achievementsModal.feathersUnit')}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#131a29] rounded-full overflow-hidden border border-[#1e293b]">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar shrink-0">
              {(
                [
                  { id: 'all', label: t('achievementsModal.all') },
                  { id: 'gameplay', label: t('achievementsModal.gameplay') },
                  { id: 'mastery', label: t('achievementsModal.mastery') },
                  { id: 'exploration', label: t('achievementsModal.exploration') },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundFx.playClick();
                    setFilter(cat.id);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filter === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-[#131a29] text-slate-400 hover:text-slate-200 border border-[#1e293b]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Achievements List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 mt-1 no-scrollbar">
              {filteredAchievements.map((achievement: Achievement) => {
                const unlocked = validUnlockedIds.includes(achievement.id);
                const isSecret = achievement.secret && !unlocked;

                return (
                  <div
                    key={achievement.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                      unlocked
                        ? 'bg-[#131a29]/90 border-amber-500/30 shadow-sm'
                        : 'bg-[#0f1422]/50 border-[#1e293b]/60 opacity-70'
                    }`}
                  >
                    {/* Icon Circle */}
                    <div
                      className={`p-3 rounded-xl border shrink-0 ${
                        unlocked
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : 'bg-[#131a29] border-[#1e293b] text-slate-500'
                      }`}
                    >
                      {isSecret ? <Lock className="w-5 h-5 text-slate-600" /> : renderIcon(achievement.icon, unlocked)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold truncate ${
                            unlocked ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {isSecret
                            ? t('achievementsModal.secretTitle')
                            : getLocalizedText(achievement.title, i18n.language)}
                        </h4>
                        {unlocked && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {isSecret
                          ? t('achievementsModal.secretDesc')
                          : getLocalizedText(achievement.description, i18n.language)}
                      </p>
                    </div>

                    {/* Feathers Reward */}
                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 border ${
                        unlocked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-[#131a29] text-slate-400 border-[#1e293b]'
                      }`}
                    >
                      +{achievement.feathersReward} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2 : QUOTIDIEN (FARM DE PLUMES) */}
        {mainTab === 'daily' && (
          <div className="flex flex-col flex-1 min-h-0 mt-2">
            {/* Daily Feathers Progress Header */}
            <div className="p-3.5 rounded-2xl bg-[#041a12] border-2 border-emerald-500/40 mb-3 shrink-0">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Récolte du jour ({todayStr})</span>
                </span>
                <span className="font-mono font-bold text-amber-300">
                  {dailyFeathersClaimed} / {totalDailyFeathersPossible} Plumes 🪶 ({dailyProgressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#010a07] rounded-full overflow-hidden border border-[#0d3b2c] mb-2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>{completedDailyCount} sur 8 mini-jeux résolus</span>
                <span className="text-amber-400 font-bold">
                  {dailyFeathersRemaining > 0
                    ? `+${dailyFeathersRemaining} Plumes encore à remporter aujourd'hui !`
                    : '🎉 Toutes les plumes du jour ont été récoltées !'}
                </span>
              </div>
            </div>

            {/* Bonus Grand Chelem */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 mb-2.5 shrink-0 ${
                claimedRecord.grandSlamClaimed
                  ? 'bg-amber-500/15 border-amber-400/60 text-amber-200'
                  : completedDailyCount === 8
                  ? 'bg-amber-500/20 border-amber-400 animate-pulse text-amber-100'
                  : 'bg-[#091f17] border-[#134e3a] text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>Grand Chelem Quotidien</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[10px] font-mono font-black">
                      +{DAILY_GRAND_SLAM_BONUS} 🪶
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Résolvez les 8 mini-jeux du jour avant minuit pour empocher le bonus suprême.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                {claimedRecord.grandSlamClaimed ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Validé !</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {completedDailyCount}/8
                  </span>
                )}
              </div>
            </div>

            {/* List of 8 Daily Games */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
              {DAILY_GAMES_METADATA.map((game) => {
                const st = challengeStatus[game.id as keyof typeof challengeStatus];
                const isWon = st === 'won' || claimedRecord.claimedGames.includes(game.id);
                const isClaimed = claimedRecord.claimedGames.includes(game.id);

                return (
                  <div
                    key={game.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isClaimed
                        ? 'bg-[#06241a]/80 border-emerald-500/40 shadow-sm'
                        : isWon
                        ? 'bg-amber-500/10 border-amber-400/60'
                        : 'bg-[#04140f] border-[#0e3b2d] hover:border-[#10b981]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-2xl shrink-0 p-1.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                        {game.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white truncate">
                            {t(`minigamesHub.${game.id}.title`, { defaultValue: game.title })}
                          </h4>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${game.badge}`}>
                            +{DAILY_GAME_FEATHER_REWARD} 🪶
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {t(`minigamesHub.${game.id}.subtitle`, { defaultValue: game.subtitle })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Obtenu</span>
                        </span>
                      ) : isWon ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/25 text-amber-300 border border-amber-400/60 text-xs font-bold animate-pulse">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Réussi !</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            if (onNavigateGame) {
                              onNavigateGame(game.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40 transition cursor-pointer active:scale-95"
                          title={`Jouer au défi ${game.title}`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Jouer</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#1e293b] mt-3 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Solde actuel : <strong className="text-amber-300 font-mono">{formatFeathers(feathersCount)} Plumes</strong>
            </span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
