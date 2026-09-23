import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Crown,
  Medal,
  RotateCw,
  Edit2,
  Check,
  Gamepad2,
  Zap,
  Upload,
  Calendar,
  Globe,
  HelpCircle,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  fetchLeaderboard,
  submitLeaderboardScore,
  AVATAR_OPTIONS,
  type LeaderboardCategory,
  type LeaderboardEntry,
} from '../../services/leaderboardService';
import { isScorePlausible } from '../../utils/securityAntiCheat';
import { useUserAccount } from '../../context/useUserAccount';
import { INDIE_AVATARS } from '../../data/avatars';
import { soundFx } from '../../utils/audio';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: LeaderboardCategory;
  initialGame?: string;
}

const ARCADE_GAMES_LIST = [
  { id: 'snake', label: 'Snake', icon: '🐍' },
  { id: 'flappy', label: 'Flappy Hibou', icon: '🦉' },
  { id: 'run', label: 'Course Sylvestre', icon: '🌲' },
  { id: 'pong', label: 'Pong', icon: '🏓' },
  { id: 'breakout', label: 'Breakout', icon: '🧱' },
  { id: 'tetris', label: 'Tetris', icon: '🧩' },
  { id: 'invaders', label: 'Space Invaders', icon: '👾' },
  { id: 'vectrex', label: 'Mine Storm', icon: '⚡' },
];

const TIME_ATTACK_LIST = [
  { id: 'screenle', label: 'Sprint Capture', icon: '📸' },
  { id: 'indledle', label: 'Sprint Classic', icon: '📚' },
  { id: 'linkle', label: 'Sprint Connexions', icon: '✨' },
  { id: 'profille', label: 'Sprint Profil', icon: '🔍' },
  { id: 'chrono', label: 'Sprint Chrono', icon: '⏳' },
  { id: 'pixel', label: 'Sprint Pixel', icon: '🎨' },
  { id: 'review', label: 'Sprint Critique', icon: '💬' },
  { id: 'blindtest', label: 'Sprint Blind Test', icon: '🎵' },
];

const QUIZ_MODES_LIST = [
  { id: 'standard', label: '10 Questions', icon: '🎯' },
  { id: 'survival', label: 'Survie (3 Vies)', icon: '❤️' },
  { id: 'infinite', label: 'Entraînement Infini', icon: '♾️' },
];

export function getAvatarVisual(avatarId?: string) {
  const indie = INDIE_AVATARS.find((a) => a.id === avatarId);
  if (indie) {
    return {
      id: indie.id,
      label: indie.name,
      icon: indie.emoji,
      imageUrl: indie.imageUrl,
    };
  }
  const legacy = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  if (legacy) {
    return {
      id: legacy.id,
      label: legacy.label,
      icon: legacy.icon,
      imageUrl: legacy.imageUrl,
    };
  }
  return {
    id: 'owl',
    label: 'Hootie',
    icon: '🦉',
    imageUrl: undefined,
  };
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'arcade',
  initialGame,
}) => {
  const { t } = useTranslation();
  const { profile, setUsername, setAvatar, isAdmin } = useUserAccount();

  const [category, setCategory] = useState<LeaderboardCategory>(initialCategory);
  const [selectedGame, setSelectedGame] = useState<string>(
    initialGame ||
      (initialCategory === 'arcade'
        ? 'snake'
        : initialCategory === 'quiz'
        ? 'standard'
        : 'screenle')
  );
  const [period, setPeriod] = useState<'all' | 'daily'>('all');

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [publishedSuccessRank, setPublishedSuccessRank] = useState<number | null>(null);

  // Profile editing directement connecté au compte utilisateur
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [nicknameInput, setNicknameInput] = useState<string>(profile.username);
  const [avatarInput, setAvatarInput] = useState<string>(profile.avatarId);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Read local personal best for this game (avec validation d'intégrité anti-triche)
  const localHighScore = (() => {
    if (typeof localStorage === 'undefined') return 0;
    let rawScore = 0;
    if (category === 'arcade') {
      const v =
        localStorage.getItem(`hoot_arcade_hs_${selectedGame}`) ||
        localStorage.getItem(`arcade_high_${selectedGame}`);
      rawScore = v ? parseInt(v, 10) : 0;
    } else if (category === 'timeattack') {
      try {
        const raw = localStorage.getItem('hoot_time_attack_stats_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          rawScore = parsed[selectedGame]?.highScore || 0;
        }
      } catch {
        // Ignore
      }
    } else if (category === 'quiz') {
      try {
        const specific = localStorage.getItem(`hoot_quiz_hs_${selectedGame}`);
        if (specific) rawScore = parseInt(specific, 10);
        else {
          const generic = localStorage.getItem('hoot_quiz_highscore');
          rawScore = generic ? parseInt(generic, 10) : 0;
        }
      } catch {
        // Ignore
      }
    }

    if (!isScorePlausible(category, selectedGame, rawScore)) {
      return 0;
    }
    return rawScore;
  })();

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialCategory) setCategory(initialCategory);
      if (initialGame) {
        setSelectedGame(initialGame);
      } else {
        setSelectedGame(
          initialCategory === 'arcade'
            ? 'snake'
            : initialCategory === 'quiz'
            ? 'standard'
            : 'screenle'
        );
      }
      setNicknameInput(profile.username);
      setAvatarInput(profile.avatarId);
      setPublishedSuccessRank(null);
    }
  }, [isOpen, initialCategory, initialGame, profile.username, profile.avatarId]);

  const loadScores = async (
    cat: LeaderboardCategory,
    gm: string,
    p: 'all' | 'daily' = period
  ) => {
    setLoading(true);
    const res = await fetchLeaderboard(cat, gm, 20, p);
    // Enrichir avec isCurrentPlayer basé directement sur le pseudo du compte
    const currentUserName = profile.username.toLowerCase();
    const enriched = (res.leaderboard || []).map((e) => ({
      ...e,
      isCurrentPlayer: e.nickname.toLowerCase() === currentUserName,
    }));
    setEntries(enriched);
    setTotalEntries(res.totalEntries);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadScores(category, selectedGame, period);
    }
  }, [isOpen, category, selectedGame, period, profile.username]);

  const handleCategoryChange = (cat: LeaderboardCategory) => {
    soundFx.playClick();
    setCategory(cat);
    setPublishedSuccessRank(null);
    const defaultGame =
      cat === 'arcade' ? 'snake' : cat === 'quiz' ? 'standard' : 'screenle';
    setSelectedGame(defaultGame);
  };

  const handleGameSelect = (gameId: string) => {
    soundFx.playClick();
    setSelectedGame(gameId);
    setPublishedSuccessRank(null);
  };

  const handlePeriodChange = (newPeriod: 'all' | 'daily') => {
    soundFx.playClick();
    setPeriod(newPeriod);
  };

  const handleSaveProfile = async () => {
    soundFx.playClick();
    setProfileError(null);
    const clean = nicknameInput.trim().slice(0, 16) || 'Hibou Anonyme';

    setIsCheckingProfile(true);
    const res = await setUsername(clean);
    if (avatarInput && avatarInput !== profile.avatarId) {
      setAvatar(avatarInput as any);
    }
    setIsCheckingProfile(false);

    if (!res.success) {
      soundFx.playError();
      setProfileError(res.error || 'Erreur lors de la mise à jour du profil.');
      return;
    }

    setIsEditingProfile(false);
    // Recharger pour rafraîchir tous les scores avec le nouveau pseudo
    loadScores(category, selectedGame, period);
  };

  const handlePublishLocalScore = async () => {
    if (localHighScore <= 0 || isSubmitting) return;
    soundFx.playClick();
    setIsSubmitting(true);
    setPublishedSuccessRank(null);
    try {
      const res = await submitLeaderboardScore(
        category,
        selectedGame,
        localHighScore,
        profile.username,
        profile.avatarId
      );
      if (res.success) {
        soundFx.playChime();
        if (res.rank) {
          setPublishedSuccessRank(res.rank);
        }
        await loadScores(category, selectedGame, period);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentAvatarInfo = getAvatarVisual(profile.avatarId);
  const currentGamesList =
    category === 'arcade'
      ? ARCADE_GAMES_LIST
      : category === 'timeattack'
      ? TIME_ATTACK_LIST
      : QUIZ_MODES_LIST;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative overflow-visible w-full max-w-2xl bg-[#06241b] border-2 border-[#78350f] rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <SylvestreIvyFrame density="medium" />
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#1e293b] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{t('leaderboard.title')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  Live
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t('leaderboard.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs (Arcade vs Time Attack vs Quiz) & Period Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 my-2.5 shrink-0">
          {/* 3 Categories */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#0b0f19] border border-[#1e293b] flex-1">
            <button
              onClick={() => handleCategoryChange('arcade')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
                category === 'arcade'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{t('leaderboard.arcadeTab')}</span>
            </button>

            <button
              onClick={() => handleCategoryChange('timeattack')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
                category === 'timeattack'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t('leaderboard.sprintTab')}</span>
            </button>

            <button
              onClick={() => handleCategoryChange('quiz')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
                category === 'quiz'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('leaderboard.quizTab')}</span>
            </button>
          </div>

          {/* Period Toggle : Global vs Daily */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#0b0f19] border border-[#1e293b] self-center sm:self-auto shrink-0">
            <button
              onClick={() => handlePeriodChange('all')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                period === 'all'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={t('leaderboard.allTimeTip')}
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{t('leaderboard.allTime')}</span>
            </button>
            <button
              onClick={() => handlePeriodChange('daily')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                period === 'daily'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={t('leaderboard.todayTip')}
            >
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{t('leaderboard.today')}</span>
            </button>
          </div>
        </div>

        {/* Games Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 shrink-0">
          {currentGamesList.map((g) => {
            const isSelected = selectedGame === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleGameSelect(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-[#131a29] text-slate-400 hover:text-white border border-[#1e293b]'
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Success Alert if published */}
        {publishedSuccessRank && (
          <div className="my-1 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>
                {t('leaderboard.publishedSuccess', { rank: publishedSuccessRank })}
              </span>
            </div>
            <button
              onClick={() => setPublishedSuccessRank(null)}
              className="text-emerald-400 hover:text-white cursor-pointer ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Player Profile & Publishing Banner */}
        <div className="my-2 p-3 rounded-2xl bg-[#0b0f19] border border-[#1e293b] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl p-1 rounded-xl bg-slate-800/80 flex items-center justify-center w-8 h-8 shrink-0">
              {currentAvatarInfo.imageUrl ? (
                <img src={currentAvatarInfo.imageUrl} alt={currentAvatarInfo.label} className="w-6 h-6 object-contain rounded-full" />
              ) : (
                currentAvatarInfo.icon
              )}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-white text-sm flex items-center gap-1.5">
                  <span>{profile.username}</span>
                  {(profile.username.toLowerCase() === 'hibouxe' || isAdmin) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black tracking-wide" title="Fondateur & Développeur">
                      👑 Créateur
                    </span>
                  )}
                </span>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsEditingProfile(!isEditingProfile);
                    setNicknameInput(profile.username);
                    setAvatarInput(profile.avatarId);
                  }}
                  className="text-slate-400 hover:text-amber-400 transition cursor-pointer"
                  title="Modifier mon pseudo et avatar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[11px] text-slate-400">
                {t('leaderboard.localRecord')}{' '}
                <strong className="text-amber-400 font-mono font-bold">{localHighScore} pts</strong>
              </div>
            </div>
          </div>

          {localHighScore > 0 && (
            <button
              onClick={handlePublishLocalScore}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isSubmitting ? t('leaderboard.publishing') : t('leaderboard.publishScore')}</span>
            </button>
          )}
        </div>

        {/* Inline Profile Editor Drawer */}
        <AnimatePresence>
          {isEditingProfile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 p-3 rounded-2xl bg-[#131a29] border border-amber-500/30 space-y-2.5 overflow-hidden shrink-0"
            >
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{t('leaderboard.customizeProfile')}</span>
                <span className="text-[10px] text-slate-400">Max 16 caractères</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={nicknameInput}
                  onChange={(e) => {
                    setNicknameInput(e.target.value);
                    if (profileError) setProfileError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveProfile();
                  }}
                  placeholder="Votre pseudo..."
                  disabled={isCheckingProfile}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                />

                <button
                  onClick={handleSaveProfile}
                  disabled={isCheckingProfile}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 disabled:opacity-50 transition cursor-pointer"
                >
                  {isCheckingProfile ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>OK</span>
                </button>
              </div>

              {profileError && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 rounded-lg text-left">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Avatar Selector */}
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto no-scrollbar p-0.5">
                {INDIE_AVATARS.filter((av) => !av.adminOnly || isAdmin).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarInput(av.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition cursor-pointer ${
                      avatarInput === av.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {av.imageUrl ? (
                      <img src={av.imageUrl} alt={av.name} className="w-3.5 h-3.5 object-contain rounded-full" />
                    ) : (
                      <span>{av.emoji}</span>
                    )}
                    <span className="text-[11px] font-bold">{av.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scores Table / List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pr-1 min-h-[180px]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RotateCw className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs">{t('leaderboard.loadingScores')}</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Trophy className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <div className="text-sm font-bold text-white">
                {t('leaderboard.noScores')}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('leaderboard.beFirst')}
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const avatarVisual = getAvatarVisual(entry.avatar);
              const isCreatorEntry = entry.nickname.toLowerCase() === 'hibouxe' || entry.avatar === 'hibouxe_creator';

              // Rank styling
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;

              return (
                <div
                  key={entry.id || `${entry.rank}-${entry.nickname}`}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                    entry.isCurrentPlayer
                      ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-400/30'
                      : isFirst
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : isSecond
                      ? 'bg-slate-800/40 border-slate-600/40'
                      : isThird
                      ? 'bg-amber-950/10 border-amber-700/30'
                      : 'bg-[#0b0f19] border-[#1e293b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {isFirst ? (
                        <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-sm">
                          <Crown className="w-4 h-4" />
                        </div>
                      ) : isSecond ? (
                        <div className="w-7 h-7 rounded-xl bg-slate-300/20 border border-slate-300/40 flex items-center justify-center text-slate-200 shadow-sm">
                          <Medal className="w-4 h-4" />
                        </div>
                      ) : isThird ? (
                        <div className="w-7 h-7 rounded-xl bg-amber-700/20 border border-amber-700/40 flex items-center justify-center text-amber-600 shadow-sm">
                          <Medal className="w-4 h-4" />
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-xs text-slate-400">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar & Name */}
                    <span className="text-lg flex items-center justify-center w-6 h-6 shrink-0">
                      {avatarVisual.imageUrl ? (
                        <img src={avatarVisual.imageUrl} alt={avatarVisual.label} className="w-5 h-5 object-contain rounded-full" />
                      ) : (
                        avatarVisual.icon
                      )}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs sm:text-sm font-bold ${entry.isCurrentPlayer ? 'text-amber-300 font-black' : 'text-white'}`}>
                          {entry.nickname}
                        </span>
                        {isCreatorEntry && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                            👑 Créateur
                          </span>
                        )}
                        {entry.isCurrentPlayer && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                            {t('leaderboard.you')}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {entry.date}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-sm sm:text-base text-amber-400">
                      {entry.score.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between gap-3 shrink-0 text-xs">
          <button
            onClick={() => loadScores(category, selectedGame, period)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{t('leaderboard.refresh')}</span>
          </button>

          <span className="text-[11px] text-slate-500">
            {t('leaderboard.championsRanked', { count: totalEntries })}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
