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
} from 'lucide-react';
import {
  fetchLeaderboard,
  submitLeaderboardScore,
  getPlayerNickname,
  setPlayerNickname,
  getPlayerAvatar,
  setPlayerAvatar,
  AVATAR_OPTIONS,
  type LeaderboardCategory,
  type LeaderboardEntry,
} from '../../services/leaderboardService';
import { soundFx } from '../../utils/audio';

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
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'arcade',
  initialGame,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const [category, setCategory] = useState<LeaderboardCategory>(initialCategory);
  const [selectedGame, setSelectedGame] = useState<string>(
    initialGame || (initialCategory === 'arcade' ? 'snake' : 'screenle')
  );

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile editing
  const [nickname, setNicknameState] = useState<string>(() => getPlayerNickname());
  const [avatar, setAvatarState] = useState<string>(() => getPlayerAvatar());
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [nicknameInput, setNicknameInput] = useState<string>(nickname);
  const [avatarInput, setAvatarInput] = useState<string>(avatar);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Read local personal best for this game
  const localHighScore = (() => {
    if (typeof localStorage === 'undefined') return 0;
    if (category === 'arcade') {
      const v =
        localStorage.getItem(`hoot_arcade_hs_${selectedGame}`) ||
        localStorage.getItem(`arcade_high_${selectedGame}`);
      return v ? parseInt(v, 10) : 0;
    } else {
      try {
        const raw = localStorage.getItem('hoot_time_attack_stats_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed[selectedGame]?.highScore || 0;
        }
      } catch {
        // Ignore
      }
    }
    return 0;
  })();

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialCategory) setCategory(initialCategory);
      if (initialGame) {
        setSelectedGame(initialGame);
      } else {
        setSelectedGame(initialCategory === 'timeattack' ? 'screenle' : 'snake');
      }
      setNicknameState(getPlayerNickname());
      setAvatarState(getPlayerAvatar());
    }
  }, [isOpen, initialCategory, initialGame]);

  const loadScores = async (cat: LeaderboardCategory, gm: string) => {
    setLoading(true);
    const res = await fetchLeaderboard(cat, gm, 20);
    setEntries(res.leaderboard);
    setTotalEntries(res.totalEntries);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadScores(category, selectedGame);
    }
  }, [isOpen, category, selectedGame]);

  const handleCategoryChange = (cat: LeaderboardCategory) => {
    soundFx.playClick();
    setCategory(cat);
    const defaultGame = cat === 'arcade' ? 'snake' : 'screenle';
    setSelectedGame(defaultGame);
  };

  const handleGameSelect = (gameId: string) => {
    soundFx.playClick();
    setSelectedGame(gameId);
  };

  const handleSaveProfile = () => {
    soundFx.playClick();
    const clean = nicknameInput.trim().slice(0, 16) || 'Hibou Anonyme';
    setPlayerNickname(clean);
    setPlayerAvatar(avatarInput);
    setNicknameState(clean);
    setAvatarState(avatarInput);
    setIsEditingProfile(false);
    // Reload to refresh highlighting
    loadScores(category, selectedGame);
  };

  const handlePublishLocalScore = async () => {
    if (localHighScore <= 0 || isSubmitting) return;
    soundFx.playClick();
    setIsSubmitting(true);
    try {
      const res = await submitLeaderboardScore(category, selectedGame, localHighScore, nickname, avatar);
      if (res.success) {
        soundFx.playChime();
        await loadScores(category, selectedGame);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentAvatarInfo = AVATAR_OPTIONS.find((a) => a.id === avatar) || AVATAR_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#0f172a] border border-[#1e293b] rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#1e293b] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{lang === 'fr' ? 'Classement Mondial' : 'Global Leaderboard'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  Live
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'fr'
                  ? 'Comparez vos records face aux joueurs de la communauté Hoot.'
                  : 'Compare your high scores with the Hoot community.'}
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

        {/* Main Category Tabs (Arcade vs Time Attack) */}
        <div className="grid grid-cols-2 gap-2 my-3 p-1 rounded-2xl bg-[#0b0f19] border border-[#1e293b] shrink-0">
          <button
            onClick={() => handleCategoryChange('arcade')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              category === 'arcade'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Bornes Arcade (8)' : 'Arcade Hall (8)'}</span>
          </button>

          <button
            onClick={() => handleCategoryChange('timeattack')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              category === 'timeattack'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Time Attack (4)' : 'Time Attack (4)'}</span>
          </button>
        </div>

        {/* Games Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 shrink-0">
          {(category === 'arcade' ? ARCADE_GAMES_LIST : TIME_ATTACK_LIST).map((g) => {
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

        {/* Player Profile & Publishing Banner */}
        <div className="my-2 p-3 rounded-2xl bg-[#0b0f19] border border-[#1e293b] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl p-1 rounded-xl bg-slate-800/80">{currentAvatarInfo.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-sm">{nickname}</span>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsEditingProfile(!isEditingProfile);
                    setNicknameInput(nickname);
                    setAvatarInput(avatar);
                  }}
                  className="text-slate-400 hover:text-amber-400 transition"
                  title="Modifier mon pseudo et avatar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'fr' ? 'Mon record local :' : 'My local record:'}{' '}
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
              <span>{isSubmitting ? (lang === 'fr' ? 'Publication...' : 'Publishing...') : (lang === 'fr' ? 'Publier mon score' : 'Publish My Score')}</span>
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
                <span>{lang === 'fr' ? 'Personnaliser mon profil joueur' : 'Customize Player Profile'}</span>
                <span className="text-[10px] text-slate-400">Max 16 caractères</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="Votre pseudo..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                />

                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>OK</span>
                </button>
              </div>

              {/* Avatar Selector */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {AVATAR_OPTIONS.map((av) => (
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
                    <span>{av.icon}</span>
                    <span className="text-[11px] font-bold">{av.label}</span>
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
              <span className="text-xs">{lang === 'fr' ? 'Chargement du classement...' : 'Loading scores...'}</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Trophy className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <div className="text-sm font-bold text-white">
                {lang === 'fr' ? 'Aucun score enregistré encore !' : 'No scores recorded yet!'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'fr' ? 'Soyez le premier champion à inscrire votre record.' : 'Be the first champion to post a record.'}
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const avatarInfo = AVATAR_OPTIONS.find((a) => a.id === entry.avatar) || AVATAR_OPTIONS[0];

              // Rank styling
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;

              return (
                <div
                  key={entry.id || entry.rank}
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
                    <span className="text-lg">{avatarInfo.icon}</span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold ${entry.isCurrentPlayer ? 'text-amber-300 font-black' : 'text-white'}`}>
                          {entry.nickname}
                        </span>
                        {entry.isCurrentPlayer && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                            {lang === 'fr' ? 'Vous' : 'You'}
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
            onClick={() => loadScores(category, selectedGame)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Rafraîchir' : 'Refresh'}</span>
          </button>

          <span className="text-[11px] text-slate-500">
            {totalEntries} {lang === 'fr' ? 'champions enregistrés' : 'champions ranked'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
