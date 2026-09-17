import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Users,
  Zap,
  Clock,
  Trophy,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INDIE_GAMES } from '../../data/games';
import type { Game } from '../../types/game';
import { useUserAccount } from '../../context/useUserAccount';
import { useAchievements } from '../../context/useAchievements';
import { INDIE_AVATARS } from '../../data/avatars';
import { soundFx } from '../../utils/audio';

type VersusPhase = 'lobby' | 'queueing' | 'countdown' | 'playing' | 'round_end' | 'match_end';

interface OpponentData {
  id: string;
  name: string;
  avatarId: string;
  elo: number;
  score: number;
  isBot?: boolean;
}

const BOT_NAMES = [
  'SilksongBeliever',
  'KnightOfHallownest',
  'CelesteSpeedrunner',
  'HadesRebel',
  'BalatroAddict',
  'DredgeCaptain',
  'IndieGamer_FR',
  'NocturneGamer',
];

// Fonctions pures externes pour le matchmaking et la sélection
function getWaitTime(): number {
  return 1800 + Math.random() * 1500;
}

function getRandomBot(playerElo: number): OpponentData {
  const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
  const avatar = INDIE_AVATARS[Math.floor(Math.random() * INDIE_AVATARS.length)];
  const elo = Math.max(800, playerElo + Math.floor((Math.random() - 0.5) * 120));
  return {
    id: 'bot_' + Math.random().toString(36).substring(2, 7),
    name,
    avatarId: avatar.id,
    elo,
    score: 0,
    isBot: true,
  };
}

function getRandomGame(): Game {
  return INDIE_GAMES[Math.floor(Math.random() * INDIE_GAMES.length)];
}

function getBotDecision(): { willGuess: boolean; delayMs: number } {
  return {
    willGuess: Math.random() < 0.75,
    delayMs: (7 + Math.random() * 9) * 1000,
  };
}

function createFriendOpponent(code: string): OpponentData {
  return {
    id: 'friend_' + Math.random().toString(36).substring(2, 7),
    name: `Rival #${code.toUpperCase()}`,
    avatarId: 'knight',
    elo: 1020,
    score: 0,
    isBot: true,
  };
}

export const VersusArena: React.FC = () => {
  const { profile, recordVersusResult } = useUserAccount();
  const { unlockAchievement } = useAchievements();

  const [phase, setPhase] = useState<VersusPhase>('lobby');
  const [roomCode, setRoomCode] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#versus=')) {
      return window.location.hash.replace('#versus=', '').trim().toUpperCase();
    }
    return '';
  });
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Match State
  const [opponent, setOpponent] = useState<OpponentData | null>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(1);
  const [currentRoundGame, setCurrentRoundGame] = useState<Game>(() => INDIE_GAMES[0]);
  const [timerSeconds, setTimerSeconds] = useState<number>(20);
  const [countdown, setCountdown] = useState<number>(3);
  const [roundWinner, setRoundWinner] = useState<'player' | 'opponent' | 'draw' | null>(null);

  // Player guessing state
  const [guessQuery, setGuessQuery] = useState<string>('');
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const playerAvatar = INDIE_AVATARS.find((a) => a.id === profile.avatarId) || INDIE_AVATARS[0];
  const opponentAvatar = opponent
    ? INDIE_AVATARS.find((a) => a.id === opponent.avatarId) || INDIE_AVATARS[1]
    : INDIE_AVATARS[1];

  // Filtre de recherche de jeux pour le guess
  const filteredGames = guessQuery.trim().length > 0
    ? INDIE_GAMES.filter((g) =>
        g.title.toLowerCase().includes(guessQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Fermer la liste de suggestions au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Nettoyage des timers
  const clearAllTimers = () => {
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Création d'un salon avec un ami
  const handleCreateRoom = () => {
    soundFx.playClick();
    const code = 'HOOT-' + Math.floor(100 + Math.random() * 900);
    setRoomCode(code);
    window.location.hash = `versus=${code}`;
  };

  const handleCopyInvite = () => {
    soundFx.playClick();
    const url = `${window.location.origin}${window.location.pathname}#versus=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Lancement du Matchmaking Rapide
  const handleStartQueue = () => {
    soundFx.playClick();
    setPhase('queueing');

    const waitTime = getWaitTime();
    setTimeout(() => {
      setOpponent(getRandomBot(profile.versusStats.eloRating));
      startCountdown();
    }, waitTime);
  };

  // Rejoindre un salon avec un ami
  const handleJoinRoom = () => {
    if (!joinCodeInput.trim()) return;
    soundFx.playClick();

    setOpponent(createFriendOpponent(joinCodeInput));
    startCountdown();
  };

  // Compte à rebours avant le round 1
  const startCountdown = () => {
    setPhase('countdown');
    setCountdown(3);
    setPlayerScore(0);
    setOpponentScore(0);
    setCurrentRoundNumber(1);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startRound(1, 0, 0);
          return 0;
        }
        soundFx.playClick();
        return prev - 1;
      });
    }, 1000);
  };

  // Lancement d'une manche
  const startRound = (roundNum: number, currentPScore: number, currentOScore: number) => {
    clearAllTimers();
    setPhase('playing');
    setCurrentRoundNumber(roundNum);
    setTimerSeconds(20);
    setRoundWinner(null);
    setGuessQuery('');
    setIsLockedOut(false);

    // Tirer un jeu indé aléatoire pour la manche
    const randomGame = getRandomGame();
    setCurrentRoundGame(randomGame);

    // Timer du round
    roundTimerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(roundTimerRef.current!);
          handleRoundTimeout(currentPScore, currentOScore, roundNum);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Comportement de l'adversaire (simulation de temps de réponse dynamique)
    const bot = getBotDecision();
    if (bot.willGuess) {
      botTimerRef.current = setTimeout(() => {
        handleOpponentCorrectGuess(currentPScore, currentOScore, roundNum);
      }, bot.delayMs);
    }
  };

  // Fin du temps imparti (manche nulle)
  const handleRoundTimeout = (pScore: number, oScore: number, roundNum: number) => {
    soundFx.playError();
    setRoundWinner('draw');
    setPhase('round_end');

    setTimeout(() => {
      advanceRound(pScore, oScore, roundNum);
    }, 2800);
  };

  // Victoire de manche par l'adversaire
  const handleOpponentCorrectGuess = (pScore: number, oScore: number, roundNum: number) => {
    clearAllTimers();
    soundFx.playError();
    const newOScore = oScore + 1;
    setOpponentScore(newOScore);
    setRoundWinner('opponent');
    setPhase('round_end');

    setTimeout(() => {
      advanceRound(pScore, newOScore, roundNum);
    }, 2800);
  };

  // Proposition du joueur
  const handlePlayerGuess = (game: Game) => {
    if (isLockedOut || phase !== 'playing') return;

    setSearchFocused(false);
    setGuessQuery('');

    if (game.id === currentRoundGame.id) {
      // Victoire de manche par le joueur !
      clearAllTimers();
      soundFx.playVictory();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6'],
      });

      const newPScore = playerScore + 1;
      setPlayerScore(newPScore);
      setRoundWinner('player');
      setPhase('round_end');

      setTimeout(() => {
        advanceRound(newPScore, opponentScore, currentRoundNumber);
      }, 2800);
    } else {
      // Mauvaise réponse : pénalité de blocage de 3s
      soundFx.playError();
      setIsLockedOut(true);
      setLockoutRemaining(3);

      let rem = 3;
      lockoutTimerRef.current = setInterval(() => {
        rem -= 1;
        setLockoutRemaining(rem);
        if (rem <= 0) {
          clearInterval(lockoutTimerRef.current!);
          setIsLockedOut(false);
        }
      }, 1000);
    }
  };

  // Passage à la manche suivante ou fin de match
  const advanceRound = (pScore: number, oScore: number, roundNum: number) => {
    // Format Best of 3 : Premier à 2 points gagne
    if (pScore >= 2 || oScore >= 2 || roundNum >= 3) {
      endMatch(pScore, oScore);
    } else {
      startRound(roundNum + 1, pScore, oScore);
    }
  };

  // Fin du match
  const endMatch = (finalPScore: number, finalOScore: number) => {
    clearAllTimers();
    setPhase('match_end');
    const isVictory = finalPScore > finalOScore;

    if (isVictory) {
      soundFx.playVictory();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#10b981', '#6366f1'],
      });
      unlockAchievement('versus_champion');
      recordVersusResult(true, opponent?.elo || 1000);
    } else {
      soundFx.playError();
      recordVersusResult(false, opponent?.elo || 1000);
    }
  };

  // Calcul du flou et du zoom selon le temps restant
  const getVisualClueStyles = () => {
    if (phase === 'round_end' || phase === 'match_end') {
      return { filter: 'blur(0px)', transform: 'scale(1)' };
    }
    if (timerSeconds > 15) {
      return { filter: 'blur(16px)', transform: 'scale(2.2)' };
    }
    if (timerSeconds > 10) {
      return { filter: 'blur(9px)', transform: 'scale(1.6)' };
    }
    if (timerSeconds > 5) {
      return { filter: 'blur(4px)', transform: 'scale(1.2)' };
    }
    return { filter: 'blur(0px)', transform: 'scale(1)' };
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Lobby / Matchmaking Selection */}
      {phase === 'lobby' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Swords className="w-4 h-4" />
              Mode Versus 1v1 • Screenle Sprint
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Arène Face-à-Face
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
              Mesurez votre culture vidéoludique en direct contre un ami ou un joueur aléatoire. Première personne à 2 victoires de manche l'emporte !
            </p>
          </div>

          {/* User Versus Card Preview */}
          <div className="max-w-md mx-auto p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${playerAvatar.bgGradient} flex items-center justify-center text-2xl shadow-md`}
              >
                {playerAvatar.emoji}
              </div>
              <div>
                <div className="text-sm font-black text-white">{profile.username}</div>
                <div className="text-xs text-amber-400 font-semibold">{profile.title}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Votre Rang ELO</div>
              <div className="text-lg font-black text-indigo-400">
                {profile.versusStats.eloRating}
              </div>
            </div>
          </div>

          {/* 2 Modes Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Mode 1: Matchmaking Aléatoire */}
            <div className="p-6 bg-gradient-to-b from-[#131a29] to-[#0e1422] border border-[#1e293b] hover:border-amber-500/40 rounded-3xl shadow-xl flex flex-col justify-between transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white mb-1">
                  Matchmaking Rapide
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Affrontez un rival en ligne de niveau équivalent. Appariement instantané avec un joueur réel ou un champion simulé.
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleStartQueue}
                  className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  Lancer la Recherche
                </button>
              </div>
            </div>

            {/* Mode 2: Duel entre Amis */}
            <div className="p-6 bg-gradient-to-b from-[#131a29] to-[#0e1422] border border-[#1e293b] hover:border-indigo-500/40 rounded-3xl shadow-xl flex flex-col justify-between transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white mb-1">
                  Duel entre Amis
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Créez une salle privée avec un code unique ou rejoignez l'invitation d'un proche.
                </p>

                {roomCode ? (
                  <div className="p-3 bg-[#0b0f19] border border-amber-500/40 rounded-xl space-y-2 mb-4">
                    <div className="text-[11px] text-slate-400 font-medium">
                      Code de votre salon :
                    </div>
                    <div className="text-xl font-black text-amber-400 tracking-wider font-mono">
                      {roomCode}
                    </div>
                    <button
                      onClick={handleCopyInvite}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLink ? 'Lien copié !' : 'Copier le lien d’invitation'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 mb-3 transition-colors"
                  >
                    Créer un Salon Privé
                  </button>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="HOOT-..."
                    maxLength={10}
                    className="flex-1 px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs font-mono font-bold text-white uppercase placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!joinCodeInput.trim()}
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors disabled:opacity-40"
                  >
                    Rejoindre
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queueing / Searching Screen */}
      {phase === 'queueing' && (
        <div className="max-w-md mx-auto text-center py-16 px-4 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-2xl space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-xl">
              <Swords className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Recherche d'un Adversaire...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Recherche dans le Perchoir d'un joueur autour de {profile.versusStats.eloRating} ELO
            </p>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              clearAllTimers();
              setPhase('lobby');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors"
          >
            Annuler la recherche
          </button>
        </div>
      )}

      {/* Countdown Screen */}
      {phase === 'countdown' && opponent && (
        <div className="max-w-md mx-auto text-center py-14 px-4 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${playerAvatar.bgGradient} flex items-center justify-center text-3xl shadow-lg mx-auto mb-2`}
              >
                {playerAvatar.emoji}
              </div>
              <div className="text-xs font-black text-white">{profile.username}</div>
            </div>

            <div className="text-2xl font-black text-amber-400">VS</div>

            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${opponentAvatar.bgGradient} flex items-center justify-center text-3xl shadow-lg mx-auto mb-2`}
              >
                {opponentAvatar.emoji}
              </div>
              <div className="text-xs font-black text-white">{opponent.name}</div>
            </div>
          </div>

          <div className="text-6xl font-black text-amber-400 animate-pulse">
            {countdown}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Préparez vos claviers !
          </p>
        </div>
      )}

      {/* Playing / Round End Screen */}
      {(phase === 'playing' || phase === 'round_end') && opponent && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Header Scoreboard */}
          <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl flex items-center justify-between shadow-md">
            {/* Player Side */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${playerAvatar.bgGradient} flex items-center justify-center text-xl shrink-0`}
              >
                {playerAvatar.emoji}
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {profile.username}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${playerScore >= 1 ? 'bg-amber-400' : 'bg-slate-700'}`}
                  />
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${playerScore >= 2 ? 'bg-amber-400' : 'bg-slate-700'}`}
                  />
                </div>
              </div>
            </div>

            {/* Match State & Timer */}
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Manche {currentRoundNumber}/3
              </div>
              <div className="flex items-center justify-center gap-1 text-xl font-black text-amber-400 font-mono">
                <Clock className="w-4 h-4" />
                {timerSeconds}s
              </div>
            </div>

            {/* Opponent Side */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {opponent.name}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${opponentScore >= 1 ? 'bg-rose-500' : 'bg-slate-700'}`}
                  />
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${opponentScore >= 2 ? 'bg-rose-500' : 'bg-slate-700'}`}
                  />
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opponentAvatar.bgGradient} flex items-center justify-center text-xl shrink-0`}
              >
                {opponentAvatar.emoji}
              </div>
            </div>
          </div>

          {/* Screenshot Display Box */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-[#1e293b] shadow-2xl flex items-center justify-center">
            <img
              src={currentRoundGame.screenshots[0] || currentRoundGame.screenshots[5]}
              alt="Indie Guess Challenge"
              style={getVisualClueStyles()}
              className="w-full h-full object-cover transition-all duration-700 select-none pointer-events-none"
            />

            {/* Clues Overlays */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-slate-300">
                {timerSeconds <= 12 ? (
                  <span>Genre : <strong className="text-amber-400">{currentRoundGame.genre.slice(0, 2).join(', ')}</strong></span>
                ) : (
                  <span className="text-slate-500 italic">Indice genre à 12s...</span>
                )}
              </div>

              <div className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-slate-300">
                {timerSeconds <= 6 ? (
                  <span>Année : <strong className="text-amber-400">{currentRoundGame.releaseYear}</strong></span>
                ) : (
                  <span className="text-slate-500 italic">Indice année à 6s...</span>
                )}
              </div>
            </div>

            {/* Round Over Overlay */}
            {phase === 'round_end' && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                {roundWinner === 'player' && (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Manche Remportée !</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      C'était bien <strong className="text-emerald-400">{currentRoundGame.title}</strong> !
                    </p>
                  </>
                )}
                {roundWinner === 'opponent' && (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mb-3">
                      <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Adversaire plus rapide !</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Le jeu était <strong className="text-rose-400">{currentRoundGame.title}</strong>.
                    </p>
                  </>
                )}
                {roundWinner === 'draw' && (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-600 text-slate-400 flex items-center justify-center mb-3">
                      <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Temps Écoulé !</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Personne n'a trouvé : c'était <strong className="text-amber-400">{currentRoundGame.title}</strong>.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Player Input Area */}
          {phase === 'playing' && (
            <div className="relative" ref={searchContainerRef}>
              {isLockedOut ? (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-center text-xs text-rose-300 font-bold animate-pulse">
                  ⚠️ Mauvaise réponse ! Pénalité de blocage : {lockoutRemaining}s
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center px-4 py-3 bg-[#131a29] border border-[#1e293b] focus-within:border-amber-500 rounded-2xl shadow-lg">
                    <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      value={guessQuery}
                      onChange={(e) => {
                        setGuessQuery(e.target.value);
                        setSearchFocused(true);
                      }}
                      onFocus={() => setSearchFocused(true)}
                      placeholder="Tapez le titre du jeu indé pour buzzer..."
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
                      autoFocus
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {searchFocused && filteredGames.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-1.5 bg-[#0e1422] border border-[#1e293b] rounded-2xl shadow-2xl z-30 max-h-56 overflow-y-auto space-y-1">
                      {filteredGames.map((game) => (
                        <button
                          key={game.id}
                          onClick={() => handlePlayerGuess(game)}
                          className="w-full p-2 rounded-xl flex items-center gap-3 hover:bg-amber-500/10 hover:border-amber-500/30 border border-transparent text-left transition-all group"
                        >
                          <img
                            src={game.screenshots[5] || game.screenshots[0]}
                            alt={game.title}
                            className="w-10 h-7 object-cover rounded-lg shrink-0 border border-slate-800"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white group-hover:text-amber-400 truncate">
                              {game.title}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {game.releaseYear} • {game.genre.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Match Over Modal */}
      {phase === 'match_end' && opponent && (
        <div className="max-w-md mx-auto text-center py-10 px-6 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-2xl space-y-6">
          {playerScore > opponentScore ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1">
                  Victoire Éclatante !
                </div>
                <h3 className="text-3xl font-black text-white">
                  Score : {playerScore} - {opponentScore}
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Félicitations ! Vous avez terrassé {opponent.name} avec brio.
                </p>
              </div>

              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl flex items-center justify-around text-xs">
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Plumes Gagnées</div>
                  <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    +30
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Progression ELO</div>
                  <div className="text-sm font-black text-emerald-400">+22</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto shadow-xl">
                <Swords className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-black text-rose-400 uppercase tracking-wider mb-1">
                  Défaite Honorable
                </div>
                <h3 className="text-3xl font-black text-white">
                  Score : {playerScore} - {opponentScore}
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  {opponent.name} s'est montré plus rapide cette fois-ci.
                </p>
              </div>

              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl flex items-center justify-around text-xs">
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Consolation</div>
                  <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    +5 Plumes
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Progression ELO</div>
                  <div className="text-sm font-black text-slate-400">-12</div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                soundFx.playClick();
                startCountdown();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Revanche
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setPhase('lobby');
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#0b0f19] border border-[#1e293b] hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Retour au Salon
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
