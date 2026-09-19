import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  AlertCircle,
  Radio,
  Bot,
  Lock,
  Mail,
  Key,
  Cloud,
  ShieldCheck,
  ArrowRight,
  User,
  LogOut,
  Camera,
  Sliders,
  MessageSquareQuote,
  Music,
  Calendar,
  Target,
  FileSearch,
  Dices,
  Disc,
  Play,
  Pause,
  ThumbsUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Peer, type DataConnection } from 'peerjs';
import { INDIE_GAMES } from '../../data/games';
import type { Game } from '../../types/game';
import type { VersusDiscipline } from '../../types/versus';
import { useUserAccount } from '../../context/useUserAccount';
import { useAchievements } from '../../context/useAchievements';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { INDIE_AVATARS } from '../../data/avatars';
import { soundFx } from '../../utils/audio';
import { telemetry } from '../../services/telemetry';
import { SteamIcon } from '../common/SteamIcon';
import { getRandomReviewPuzzle, type ReviewPuzzle } from '../../data/reviewPuzzles';
import { getRandomBlindTestPuzzle, noteToFrequency, type BlindTestPuzzle } from '../../data/blindtestPuzzles';

type VersusPhase = 'lobby' | 'waiting_friend' | 'queueing' | 'countdown' | 'playing' | 'round_end' | 'match_end';

interface OpponentData {
  id: string;
  name: string;
  avatarId: string;
  elo: number;
  score: number;
  isBot?: boolean;
}

interface PeerMessage {
  type:
    | 'handshake'
    | 'handshake_ack'
    | 'start_countdown'
    | 'round_start'
    | 'guess_wrong'
    | 'round_won'
    | 'round_timeout'
    | 'rematch_ready'
    | 'player_left';
  profile?: {
    name: string;
    avatarId: string;
    elo: number;
  };
  gameId?: string;
  roundNum?: number;
  guessTitle?: string;
  gameTitle?: string;
  score?: number;
  discipline?: VersusDiscipline;
  choiceIds?: string[];
  puzzleSeed?: string;
}

function generateRoomCode(): string {
  return `HOOT-${Math.floor(100 + Math.random() * 900)}`;
}

function generatePeerId(): string {
  return `peer_${Math.random().toString(36).substring(2, 7)}`;
}

const BOT_NAMES = [
  'Grand-Duc de la Canopée',
  'Chouette Harfang',
  'Effraie des Ombres',
  'SilksongBeliever',
  'KnightOfHallownest',
  'CelesteSpeedrunner',
  'BalatroAddict',
];

function getRandomBot(playerElo: number): OpponentData {
  const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
  const avatar = INDIE_AVATARS[Math.floor(Math.random() * INDIE_AVATARS.length)];
  const elo = Math.max(800, playerElo + Math.floor((Math.random() - 0.5) * 80));
  return {
    id: generatePeerId(),
    name,
    avatarId: avatar.id,
    elo,
    score: 0,
    isBot: true,
  };
}

function pickRandomGame(pool: Game[]): Game {
  if (!pool || pool.length === 0) return INDIE_GAMES[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

function getBotDecision(): { willGuess: boolean; delayMs: number } {
  return {
    willGuess: Math.random() < 0.72,
    delayMs: (8 + Math.random() * 8) * 1000,
  };
}

interface VersusArenaProps {
  onOpenAuth?: () => void;
}

export const VersusArena: React.FC<VersusArenaProps> = ({ onOpenAuth }) => {
  const {
    profile,
    isAuthenticated,
    isSteamConnected,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    connectSteamWithOpenId,
    updateProfile,
    setUsername,
    recordVersusResult,
    logout,
  } = useUserAccount();
  const { unlockAchievement } = useAchievements();
  const { allPlayableGames } = useSteamCatalog();

  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authUsername, setAuthUsername] = useState<string>(profile.username || '');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isGuestPlaying, setIsGuestPlaying] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hoot_versus_guest_enabled') === 'true';
    }
    return false;
  });

  const hasAccount =
    isAuthenticated ||
    Boolean(profile.email) ||
    Boolean(profile.steam?.steamId) ||
    isSteamConnected ||
    profile.isCloudSynced ||
    isGuestPlaying;

  const handleSteam1Click = () => {
    soundFx.playClick();
    if (authUsername.trim() && authUsername.trim() !== profile.username) {
      setUsername(authUsername.trim());
    }
    connectSteamWithOpenId();
  };

  const handleGoogle1Click = async () => {
    soundFx.playClick();
    setAuthLoading(true);
    setAuthError(null);
    if (authUsername.trim() && authUsername.trim() !== profile.username) {
      setUsername(authUsername.trim());
    }
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        soundFx.playVictory();
      } else {
        soundFx.playError();
        setAuthError(res.error || 'Connexion Google indisponible.');
      }
    } catch (err: any) {
      soundFx.playError();
      setAuthError(err.message || 'Erreur lors de la connexion Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInstantGuest1Click = () => {
    soundFx.playVictory();
    const finalName = authUsername.trim() || profile.username || 'Duelliste Mystère';
    setUsername(finalName);
    setIsGuestPlaying(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hoot_versus_guest_enabled', 'true');
    }
    updateProfile({
      username: finalName,
      email: profile.email || `${finalName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'joueur'}@versus.local`,
    });
  };

  const handleSwitchAccount = async () => {
    soundFx.playClick();
    setIsGuestPlaying(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hoot_versus_guest_enabled');
    }
    await logout();
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Veuillez renseigner votre email et mot de passe.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'signup') {
        if (authUsername.trim()) {
          setUsername(authUsername.trim());
        }
        const res = await signUpWithEmail(authEmail.trim(), authPassword);
        setAuthLoading(false);
        if (res.success) {
          soundFx.playVictory();
        } else {
          soundFx.playError();
          setAuthError(res.error || 'Erreur lors de la création du compte.');
        }
      } else {
        const res = await loginWithEmail(authEmail.trim(), authPassword);
        setAuthLoading(false);
        if (res.success) {
          soundFx.playVictory();
        } else {
          soundFx.playError();
          setAuthError(res.error || 'Identifiants incorrects.');
        }
      }
    } catch {
      setAuthLoading(false);
      soundFx.playError();
      setAuthError('Une erreur inattendue est survenue.');
    }
  };

  const [phase, setPhase] = useState<VersusPhase>('lobby');
  const [roomCode, setRoomCode] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#versus=')) {
      return window.location.hash.replace('#versus=', '').trim().toUpperCase();
    }
    return '';
  });
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);
  const [opponentPenaltyNotice, setOpponentPenaltyNotice] = useState<string | null>(null);

  const gamePool = allPlayableGames.length > 0 ? allPlayableGames : INDIE_GAMES;

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

  // Multi-disciplines duel state
  const [selectedDiscipline, setSelectedDiscipline] = useState<VersusDiscipline>('all');
  const [currentRoundDiscipline, setCurrentRoundDiscipline] = useState<VersusDiscipline>('screenle');
  const [currentRoundChoices, setCurrentRoundChoices] = useState<Game[]>([]);
  const [currentReviewPuzzle, setCurrentReviewPuzzle] = useState<ReviewPuzzle | null>(null);
  const [currentBlindTestPuzzle, setCurrentBlindTestPuzzle] = useState<BlindTestPuzzle | null>(null);

  // Pixel Canvas Ref
  const pixelCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Web Audio synth for Versus Blind Test
  const versusAudioCtxRef = useRef<AudioContext | null>(null);
  const versusActiveNodesRef = useRef<{ stop: () => void }[]>([]);
  const versusAudioTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versusAnimFrameRef = useRef<number | null>(null);
  const versusAnalyserRef = useRef<AnalyserNode | null>(null);
  const [isVersusAudioPlaying, setIsVersusAudioPlaying] = useState<boolean>(false);
  const [versusFrequencies, setVersusFrequencies] = useState<number[]>(new Array(12).fill(0));

  // Arrêt propre du son synthétisé en duel
  const stopVersusAudio = useCallback(() => {
    if (versusAudioTimeoutRef.current) {
      clearTimeout(versusAudioTimeoutRef.current);
      versusAudioTimeoutRef.current = null;
    }
    if (versusAnimFrameRef.current) {
      cancelAnimationFrame(versusAnimFrameRef.current);
      versusAnimFrameRef.current = null;
    }
    versusActiveNodesRef.current.forEach((n) => {
      try {
        n.stop();
      } catch {
        // Ignorer
      }
    });
    versusActiveNodesRef.current = [];
    setIsVersusAudioPlaying(false);
    setVersusFrequencies(new Array(12).fill(0));
  }, []);

  // Lecture du Blind Test pour le Versus
  const playVersusAudio = useCallback((puzzle: BlindTestPuzzle) => {
    stopVersusAudio();
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!versusAudioCtxRef.current || versusAudioCtxRef.current.state === 'closed') {
      versusAudioCtxRef.current = new AudioContextClass();
    }
    const ctx = versusAudioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    versusAnalyserRef.current = analyser;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, ctx.currentTime);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    const startTime = ctx.currentTime + 0.05;
    let noteTime = startTime;
    const melody = puzzle.audioConfig.melody;
    const instrument = puzzle.audioConfig.instrument;
    const nodes: { stop: () => void }[] = [];
    const playDuration = 5.0;

    let noteIdx = 0;
    while (noteTime < startTime + playDuration && melody.length > 0) {
      const item = melody[noteIdx % melody.length];
      const dur = item.duration;
      const freq = noteToFrequency(item.note, item.octave);

      const timeLeftSec = (startTime + playDuration) - noteTime;
      if (timeLeftSec <= 0.02) break;

      const effectiveDur = Math.min(dur, timeLeftSec);

      if (freq > 0) {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        if (instrument === 'chiptune') {
          osc.type = 'square';
        } else if (instrument === 'synth') {
          osc.type = 'sawtooth';
        } else if (instrument === 'piano' || instrument === 'guitar') {
          osc.type = 'triangle';
        } else {
          osc.type = 'sine';
        }

        osc.frequency.setValueAtTime(freq, noteTime);

        const attack = Math.min(0.04, effectiveDur * 0.2);
        noteGain.gain.setValueAtTime(0.001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.3, noteTime + attack);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + effectiveDur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + effectiveDur);
        nodes.push(osc);
      }

      noteTime += dur;
      noteIdx++;
    }

    versusActiveNodesRef.current = nodes;
    setIsVersusAudioPlaying(true);

    const updateFreqs = () => {
      if (!versusAnalyserRef.current) return;
      const dataArray = new Uint8Array(versusAnalyserRef.current.frequencyBinCount);
      versusAnalyserRef.current.getByteFrequencyData(dataArray);

      const sampled: number[] = [];
      const step = Math.max(1, Math.floor(dataArray.length / 12));
      for (let i = 0; i < 12; i++) {
        sampled.push(dataArray[i * step] || 0);
      }
      setVersusFrequencies(sampled);
      versusAnimFrameRef.current = requestAnimationFrame(updateFreqs);
    };
    versusAnimFrameRef.current = requestAnimationFrame(updateFreqs);

    versusAudioTimeoutRef.current = setTimeout(() => {
      stopVersusAudio();
    }, playDuration * 1000);
  }, [stopVersusAudio]);

  // Choix de la discipline de la manche
  const pickRoundDiscipline = (roundNum: number): VersusDiscipline => {
    if (selectedDiscipline !== 'all') {
      return selectedDiscipline;
    }
    const order: VersusDiscipline[] = [
      'screenle',
      'pixel',
      'review',
      'blindtest',
      'chrono',
      'profille',
      'indledle',
      'linkle',
    ];
    return order[(roundNum - 1) % order.length];
  };

  // Génération des 4 choix (identiques pour les 2 joueurs via WebRTC)
  const generateRoundChoices = (target: Game, pool: Game[]): Game[] => {
    const decoys = pool
      .filter((g) => g.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [target, ...decoys].sort(() => Math.random() - 0.5);
  };

  // Rendu pixel dynamique sur canevas HTML5
  const pixelResolution =
    timerSeconds > 15 ? 8 : timerSeconds > 10 ? 16 : timerSeconds > 5 ? 28 : timerSeconds > 0 ? 54 : 120;

  useEffect(() => {
    if (currentRoundDiscipline !== 'pixel' || !pixelCanvasRef.current || !currentRoundGame) return;

    const canvas = pixelCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentRoundGame.screenshots[0] || currentRoundGame.screenshots[5];
    img.onload = () => {
      canvas.width = 640;
      canvas.height = 360;

      if (phase === 'round_end' || phase === 'match_end') {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return;
      }

      const res = pixelResolution;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = res;
      offCanvas.height = Math.round(res * (img.naturalHeight / img.naturalWidth));
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offCanvas, 0, 0, offCanvas.width, offCanvas.height, 0, 0, canvas.width, canvas.height);
    };
  }, [currentRoundDiscipline, currentRoundGame, pixelResolution, phase]);

  // PeerJS refs
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const isHostRef = useRef<boolean>(false);
  const currentRoundGameRef = useRef<Game>(INDIE_GAMES[0]);
  const playerScoreRef = useRef<number>(0);
  const opponentScoreRef = useRef<number>(0);
  const roundNumRef = useRef<number>(1);

  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const playerAvatar = INDIE_AVATARS.find((a) => a.id === profile.avatarId) || INDIE_AVATARS[0];
  const opponentAvatar = opponent
    ? INDIE_AVATARS.find((a) => a.id === opponent.avatarId) || INDIE_AVATARS[1]
    : INDIE_AVATARS[1];

  // Synchroniser les refs pour les callbacks WebRTC
  useEffect(() => {
    currentRoundGameRef.current = currentRoundGame;
    playerScoreRef.current = playerScore;
    opponentScoreRef.current = opponentScore;
    roundNumRef.current = currentRoundNumber;
  }, [currentRoundGame, playerScore, opponentScore, currentRoundNumber]);

  const filteredGames = guessQuery.trim().length > 0
    ? gamePool.filter((g) =>
        g.title.toLowerCase().includes(guessQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearAllTimers = () => {
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
    stopVersusAudio();
  };

  const cleanupP2P = () => {
    stopVersusAudio();
    try {
      if (connRef.current) {
        connRef.current.close();
        connRef.current = null;
      }
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    } catch {
      // Ignorer
    }
    isHostRef.current = false;
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
      cleanupP2P();
    };
  }, []);

  // Envoi d'un message WebRTC P2P sécurisé
  const sendP2P = (msg: PeerMessage) => {
    if (connRef.current && connRef.current.open) {
      try {
        connRef.current.send(msg);
      } catch (err) {
        console.warn('Erreur envoi WebRTC:', err);
      }
    }
  };

  // Traitement des messages WebRTC reçus
  const handleP2PMessage = (msg: PeerMessage) => {
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'handshake': {
        // L'hôte reçoit la connexion de l'invité
        if (msg.profile) {
          setOpponent({
            id: generatePeerId(),
            name: msg.profile.name || 'Ami en ligne',
            avatarId: msg.profile.avatarId || 'knight',
            elo: msg.profile.elo || 1000,
            score: 0,
            isBot: false,
          });
          // Répondre avec les infos de l'hôte
          sendP2P({
            type: 'handshake_ack',
            profile: {
              name: profile.username,
              avatarId: profile.avatarId,
              elo: profile.versusStats.eloRating,
            },
          });
          setConnectionNotice('Adversaire connecté ! Démarrage du duel...');
          setTimeout(() => {
            setConnectionNotice(null);
            launchMatchP2P();
          }, 1200);
        }
        break;
      }

      case 'handshake_ack': {
        // L'invité reçoit la confirmation de l'hôte
        if (msg.profile) {
          setOpponent({
            id: 'peer_host',
            name: msg.profile.name || 'Hôte du Salon',
            avatarId: msg.profile.avatarId || 'knight',
            elo: msg.profile.elo || 1000,
            score: 0,
            isBot: false,
          });
          setConnectionNotice('Connexion établie avec l\'hôte !');
          setTimeout(() => setConnectionNotice(null), 1500);
        }
        break;
      }

      case 'start_countdown': {
        // L'invité reçoit le signal du compte à rebours
        startCountdownScreen();
        break;
      }

      case 'round_start': {
        // L'invité reçoit le jeu exact du round, la discipline et les 4 choix
        if (msg.gameId) {
          const matched = gamePool.find((g) => g.id === msg.gameId) || gamePool[0];
          setCurrentRoundGame(matched);
          const disc = msg.discipline || 'screenle';
          setCurrentRoundDiscipline(disc);

          if (msg.choiceIds && msg.choiceIds.length > 0) {
            const choices = msg.choiceIds.map((id) => gamePool.find((g) => g.id === id) || matched);
            setCurrentRoundChoices(choices);
          } else {
            setCurrentRoundChoices(generateRoundChoices(matched, gamePool));
          }

          if (disc === 'review') {
            const pz = getRandomReviewPuzzle(msg.puzzleSeed || String(Date.now()));
            setCurrentReviewPuzzle(pz);
          } else if (disc === 'blindtest') {
            const btp = getRandomBlindTestPuzzle(msg.puzzleSeed || String(Date.now()));
            setCurrentBlindTestPuzzle(btp);
            playVersusAudio(btp);
          }

          beginRoundExecution(msg.roundNum || 1, playerScoreRef.current, opponentScoreRef.current);
        }
        break;
      }

      case 'guess_wrong': {
        // L'adversaire a fait une mauvaise réponse et est bloqué 3s
        soundFx.playClick();
        setOpponentPenaltyNotice(`⚡ Votre rival s'est trompé sur « ${msg.guessTitle || 'un jeu'} » ! (Bloqué 3s)`);
        setTimeout(() => setOpponentPenaltyNotice(null), 3000);
        break;
      }

      case 'round_won': {
        // L'adversaire a trouvé la bonne réponse en premier !
        clearAllTimers();
        soundFx.playError();
        const newScore = (msg.score !== undefined ? msg.score : opponentScoreRef.current + 1);
        setOpponentScore(newScore);
        setRoundWinner('opponent');
        setPhase('round_end');

        setTimeout(() => {
          advanceRoundP2P(playerScoreRef.current, newScore, roundNumRef.current);
        }, 2800);
        break;
      }

      case 'round_timeout': {
        // Temps écoulé reçu de l'hôte
        clearAllTimers();
        soundFx.playError();
        setRoundWinner('draw');
        setPhase('round_end');

        setTimeout(() => {
          advanceRoundP2P(playerScoreRef.current, opponentScoreRef.current, roundNumRef.current);
        }, 2800);
        break;
      }

      case 'player_left': {
        setConnectionNotice('L\'adversaire a quitté la partie.');
        break;
      }
    }
  };

  // Création d'un salon WebRTC P2P (Hôte)
  const handleCreateRoom = () => {
    soundFx.playClick();
    const code = generateRoomCode();
    setRoomCode(code);
    setPhase('waiting_friend');
    setConnectionNotice(null);
    try {
      window.history.replaceState(null, '', `#versus=${code}`);
    } catch {
      // Ignorer
    }

    isHostRef.current = true;
    const peerId = `hoot-arena-${code.toLowerCase()}`;

    try {
      const peer = new Peer(peerId, { debug: 0 });
      peerRef.current = peer;

      peer.on('open', () => {
        // Prêt à recevoir une connexion
      });

      peer.on('connection', (conn) => {
        connRef.current = conn;

        conn.on('open', () => {
          // Attendre le handshake du client
        });

        conn.on('data', (data) => {
          handleP2PMessage(data as PeerMessage);
        });

        conn.on('close', () => {
          setConnectionNotice('Adversaire déconnecté.');
        });
      });

      peer.on('error', (err) => {
        console.warn('Erreur PeerJS Hôte:', err);
        setConnectionNotice('Le code était occupé ou indisponible, veuillez réessayer.');
      });
    } catch {
      setConnectionNotice('Initialisation P2P impossible dans ce navigateur.');
    }
  };

  // Rejoindre un salon WebRTC P2P (Invité)
  const handleJoinRoom = () => {
    if (!joinCodeInput.trim()) return;
    soundFx.playClick();
    cleanupP2P();

    const cleanCode = joinCodeInput.trim().toUpperCase();
    setRoomCode(cleanCode);
    setConnectionNotice('Connexion au salon de votre ami...');
    isHostRef.current = false;

    const targetPeerId = `hoot-arena-${cleanCode.toLowerCase()}`;

    try {
      const peer = new Peer({ debug: 0 });
      peerRef.current = peer;

      peer.on('open', () => {
        const conn = peer.connect(targetPeerId);
        connRef.current = conn;

        conn.on('open', () => {
          // Envoyer notre handshake
          conn.send({
            type: 'handshake',
            profile: {
              name: profile.username,
              avatarId: profile.avatarId,
              elo: profile.versusStats.eloRating,
            },
          });
        });

        conn.on('data', (data) => {
          handleP2PMessage(data as PeerMessage);
        });

        conn.on('close', () => {
          setConnectionNotice('Le salon a été fermé par l\'hôte.');
        });
      });

      peer.on('error', (err) => {
        console.warn('Erreur PeerJS Invité:', err);
        setConnectionNotice('Salon introuvable. Vérifiez que votre ami a bien créé le salon et que le code est exact.');
      });
    } catch {
      setConnectionNotice('Erreur lors de la tentative de connexion.');
    }
  };

  const handleCopyInvite = () => {
    soundFx.playClick();
    const url = `${window.location.origin}${window.location.pathname}#versus=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Lancement du duel P2P (déclenché par l'hôte après handshake)
  const launchMatchP2P = () => {
    sendP2P({ type: 'start_countdown' });
    startCountdownScreen();
  };

  // Entraînement Solo honnête contre le bot IA du Grand-Duc
  const handleStartSoloBot = () => {
    soundFx.playClick();
    cleanupP2P();
    setPhase('queueing');

    setTimeout(() => {
      setOpponent(getRandomBot(profile.versusStats.eloRating));
      startCountdownScreen();
    }, 1500);
  };

  // Compte à rebours 3-2-1
  const startCountdownScreen = () => {
    setPhase('countdown');
    setCountdown(3);
    setPlayerScore(0);
    setOpponentScore(0);
    setCurrentRoundNumber(1);

    telemetry.track('versus', 'versus_play', opponent?.name || 'Duel 1v1', undefined, {
      opponentElo: opponent?.elo || 1000,
      isBot: Boolean(opponent?.isBot),
    });

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (isHostRef.current || opponent?.isBot) {
            // L'hôte choisit le jeu initial, la discipline et les 4 choix
            const disc = pickRoundDiscipline(1);
            const game = pickRandomGame(gamePool);
            const choices = generateRoundChoices(game, gamePool);
            const seed = `${Date.now()}_${Math.random()}`;

            setCurrentRoundGame(game);
            setCurrentRoundDiscipline(disc);
            setCurrentRoundChoices(choices);

            if (disc === 'review') {
              const pz = getRandomReviewPuzzle(seed);
              setCurrentReviewPuzzle(pz);
            } else if (disc === 'blindtest') {
              const btp = getRandomBlindTestPuzzle(seed);
              setCurrentBlindTestPuzzle(btp);
              playVersusAudio(btp);
            }

            sendP2P({
              type: 'round_start',
              gameId: game.id,
              roundNum: 1,
              discipline: disc,
              choiceIds: choices.map((c) => c.id),
              puzzleSeed: seed,
            });
            beginRoundExecution(1, 0, 0);
          }
          return 0;
        }
        soundFx.playClick();
        return prev - 1;
      });
    }, 1000);
  };

  // Début réel d'une manche
  const beginRoundExecution = (
    roundNum: number,
    currentPScore: number,
    currentOScore: number
  ) => {
    clearAllTimers();
    setPhase('playing');
    setCurrentRoundNumber(roundNum);
    setTimerSeconds(20);
    setRoundWinner(null);
    setGuessQuery('');
    setIsLockedOut(false);
    setOpponentPenaltyNotice(null);

    // Timer du round
    roundTimerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(roundTimerRef.current!);
          if (isHostRef.current || opponent?.isBot) {
            sendP2P({ type: 'round_timeout' });
            handleRoundTimeout(currentPScore, currentOScore, roundNum);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Si on joue contre le bot IA, déclencher sa décision simulée
    if (opponent?.isBot) {
      const bot = getBotDecision();
      if (bot.willGuess) {
        botTimerRef.current = setTimeout(() => {
          handleOpponentCorrectGuess(currentPScore, currentOScore, roundNum);
        }, bot.delayMs);
      }
    }
  };

  // Fin du temps imparti (manche nulle)
  const handleRoundTimeout = (pScore: number, oScore: number, roundNum: number) => {
    soundFx.playError();
    setRoundWinner('draw');
    setPhase('round_end');

    setTimeout(() => {
      advanceRoundP2P(pScore, oScore, roundNum);
    }, 2800);
  };

  // Victoire de manche par le bot IA
  const handleOpponentCorrectGuess = (pScore: number, oScore: number, roundNum: number) => {
    clearAllTimers();
    soundFx.playError();
    const newOScore = oScore + 1;
    setOpponentScore(newOScore);
    setRoundWinner('opponent');
    setPhase('round_end');

    setTimeout(() => {
      advanceRoundP2P(pScore, newOScore, roundNum);
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

      // Notifier l'adversaire en WebRTC
      sendP2P({
        type: 'round_won',
        score: newPScore,
        gameTitle: currentRoundGame.title,
      });

      setTimeout(() => {
        advanceRoundP2P(newPScore, opponentScore, currentRoundNumber);
      }, 2800);
    } else {
      // Mauvaise réponse : pénalité de blocage de 3s
      soundFx.playError();
      setIsLockedOut(true);
      setLockoutRemaining(3);

      // Avertir l'adversaire de la pénalité
      sendP2P({
        type: 'guess_wrong',
        guessTitle: game.title,
      });

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
  const advanceRoundP2P = (pScore: number, oScore: number, roundNum: number) => {
    if (pScore >= 2 || oScore >= 2 || roundNum >= 3) {
      endMatch(pScore, oScore);
    } else {
      if (isHostRef.current || opponent?.isBot) {
        const nextDisc = pickRoundDiscipline(roundNum + 1);
        const nextGame = pickRandomGame(gamePool);
        const choices = generateRoundChoices(nextGame, gamePool);
        const seed = `${Date.now()}_${Math.random()}`;

        setCurrentRoundGame(nextGame);
        setCurrentRoundDiscipline(nextDisc);
        setCurrentRoundChoices(choices);

        if (nextDisc === 'review') {
          const pz = getRandomReviewPuzzle(seed);
          setCurrentReviewPuzzle(pz);
        } else if (nextDisc === 'blindtest') {
          const btp = getRandomBlindTestPuzzle(seed);
          setCurrentBlindTestPuzzle(btp);
          playVersusAudio(btp);
        }

        sendP2P({
          type: 'round_start',
          gameId: nextGame.id,
          roundNum: roundNum + 1,
          discipline: nextDisc,
          choiceIds: choices.map((c) => c.id),
          puzzleSeed: seed,
        });
        beginRoundExecution(roundNum + 1, pScore, oScore);
      }
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
      telemetry.track('versus', 'versus_win', opponent?.name || 'Inconnu', finalPScore, {
        finalScore: `${finalPScore}-${finalOScore}`,
        opponentElo: opponent?.elo || 1000,
        isBot: Boolean(opponent?.isBot),
      });
    } else {
      soundFx.playError();
      recordVersusResult(false, opponent?.elo || 1000);
      telemetry.track('versus', 'versus_loss', opponent?.name || 'Inconnu', finalPScore, {
        finalScore: `${finalPScore}-${finalOScore}`,
        opponentElo: opponent?.elo || 1000,
        isBot: Boolean(opponent?.isBot),
      });
    }
  };

  // Calcul du flou progressif
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

  const VERSUS_DISCIPLINES: { id: VersusDiscipline; label: string; icon: any; color: string; desc: string }[] = [
    {
      id: 'all',
      label: 'Décathlon Indé (Mixte)',
      icon: Dices,
      color: 'from-amber-500 to-orange-600',
      desc: 'Alterne les épreuves : Capture, Pixel, Critique Steam, Blind Test, Chronologie...',
    },
    {
      id: 'screenle',
      label: 'Capture d\'écran',
      icon: Camera,
      color: 'from-amber-500 to-amber-600',
      desc: 'Dé-zoom & dé-floutage progressif d\'une capture',
    },
    {
      id: 'pixel',
      label: 'Pixel & Silhouette',
      icon: Sliders,
      color: 'from-rose-500 to-pink-600',
      desc: 'Mosaïque pixellisée qui s\'affine seconde par seconde',
    },
    {
      id: 'review',
      label: 'Critique Steam',
      icon: MessageSquareQuote,
      color: 'from-cyan-500 to-blue-600',
      desc: 'Avis Steam de joueurs authentiques caviardés (████)',
    },
    {
      id: 'blindtest',
      label: 'Blind Test OST',
      icon: Music,
      color: 'from-fuchsia-500 to-pink-600',
      desc: 'Extrait sonore synthétisé en direct et visualiseur',
    },
    {
      id: 'chrono',
      label: 'Chronologie',
      icon: Calendar,
      color: 'from-orange-500 to-amber-600',
      desc: 'Défis temporels : avant, après et millésimes cultes',
    },
    {
      id: 'profille',
      label: 'Profil Identité',
      icon: FileSearch,
      color: 'from-purple-500 to-indigo-600',
      desc: 'Déduction par studio de dev, année et genre',
    },
    {
      id: 'indledle',
      label: 'Classic Indle',
      icon: Target,
      color: 'from-emerald-500 to-teal-600',
      desc: 'Déduction progressive par attributs et moteur',
    },
    {
      id: 'linkle',
      label: 'Connexions',
      icon: Sparkles,
      color: 'from-sky-500 to-indigo-500',
      desc: 'Repérez le lien commun ou complétez le groupe',
    },
  ];

  const getDisciplineMeta = (disc: VersusDiscipline) => {
    return VERSUS_DISCIPLINES.find((d) => d.id === disc) || VERSUS_DISCIPLINES[0];
  };

  // Raccourcis clavier (1, 2, 3, 4) pour buzzer instantanément sur les 4 choix
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'playing' || isLockedOut || searchFocused) return;

      if (['1', '&'].includes(e.key) && currentRoundChoices[0]) {
        e.preventDefault();
        handlePlayerGuess(currentRoundChoices[0]);
      } else if (['2', 'é'].includes(e.key) && currentRoundChoices[1]) {
        e.preventDefault();
        handlePlayerGuess(currentRoundChoices[1]);
      } else if (['3', '"'].includes(e.key) && currentRoundChoices[2]) {
        e.preventDefault();
        handlePlayerGuess(currentRoundChoices[2]);
      } else if (['4', "'"].includes(e.key) && currentRoundChoices[3]) {
        e.preventDefault();
        handlePlayerGuess(currentRoundChoices[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isLockedOut, searchFocused, currentRoundChoices, handlePlayerGuess]);

  const renderDisciplineChallenge = () => {
    switch (currentRoundDiscipline) {
      case 'pixel':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            <canvas ref={pixelCanvasRef} className="w-full h-full object-cover select-none pointer-events-none" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono text-rose-400 font-bold flex items-center gap-1.5 pointer-events-none">
              <Sliders className="w-3.5 h-3.5" />
              <span>Mosaïque {pixelResolution}px</span>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="relative w-full h-full flex flex-col justify-center p-6 md:p-8 bg-slate-950 overflow-hidden select-none">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  {currentReviewPuzzle?.author?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{currentReviewPuzzle?.author || 'Joueur Steam'}</div>
                  <div className="text-[10px] text-slate-400">{currentReviewPuzzle?.hoursPlayed || 42} h enregistrées</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
                <ThumbsUp className="w-3 h-3" />
                <span>Recommandé</span>
              </div>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-slate-200 italic leading-relaxed">
              "{phase === 'round_end'
                ? (currentReviewPuzzle?.fullReviewFr || currentRoundGame.title)
                : (currentReviewPuzzle?.redactedReviewFr || 'Critique Steam en cours de décodage...')}"
            </p>
          </div>
        );

      case 'blindtest':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 overflow-hidden select-none">
            <div className="relative mb-3">
              <div
                className={`w-20 h-20 rounded-full border-4 border-slate-700 bg-slate-900 flex items-center justify-center shadow-xl ${
                  isVersusAudioPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '3s' }}
              >
                <div className="w-8 h-8 rounded-full bg-fuchsia-600/30 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                  <Disc className="w-5 h-5" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isVersusAudioPlaying) {
                    stopVersusAudio();
                  } else if (currentBlindTestPuzzle) {
                    playVersusAudio(currentBlindTestPuzzle);
                  }
                }}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg transition active:scale-90 cursor-pointer"
              >
                {isVersusAudioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
            </div>

            <div className="text-center mb-3">
              <div className="text-[10px] uppercase font-bold text-fuchsia-400 tracking-wider">
                {currentBlindTestPuzzle?.audioConfig?.instrument || 'Synthétiseur'} • {currentBlindTestPuzzle?.audioConfig?.bpm || 120} BPM
              </div>
              <div className="text-xs font-semibold text-slate-300">
                {isVersusAudioPlaying ? '🎵 Extrait OST en cours d\'écoute...' : 'Cliquez pour réécouter l\'extrait'}
              </div>
            </div>

            {/* Spectre 12 barres */}
            <div className="w-48 h-8 flex items-end justify-center gap-1">
              {versusFrequencies.map((val, i) => {
                const heightPercent = isVersusAudioPlaying ? Math.max(15, Math.round((val / 255) * 100)) : 12;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-fuchsia-600 to-pink-400 rounded-t-sm transition-all duration-75"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'chrono':
        return (
          <div className="relative w-full h-full flex flex-col justify-center items-center p-6 bg-slate-950 overflow-hidden text-center select-none">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-xs uppercase font-bold text-orange-400 tracking-wider mb-1">
              Frise Chronologique Indé
            </div>
            <h4 className="text-base sm:text-lg font-black text-white max-w-md leading-snug mb-2">
              Retrouvez l'année exacte de sortie ou son ordre chronologique !
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold text-slate-300">
                Genre : {currentRoundGame.genre.slice(0, 2).join(', ')}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold text-slate-300">
                Studio : {timerSeconds <= 12 ? currentRoundGame.developer : 'Dévoilé à 12s'}
              </span>
            </div>
          </div>
        );

      case 'indledle':
      case 'profille':
      case 'linkle':
        return (
          <div className="relative w-full h-full flex flex-col justify-center items-center p-6 bg-slate-950 overflow-hidden text-center select-none">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mb-2">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-xs uppercase font-bold text-indigo-400 tracking-wider mb-2">
              Déduction d'Attributs &amp; Identité
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-md w-full text-left">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Genre</div>
                <div className="text-xs font-bold text-white truncate">{currentRoundGame.genre.join(', ')}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Année</div>
                <div className="text-xs font-bold text-amber-400">
                  {timerSeconds <= 10 ? currentRoundGame.releaseYear : 'Débloqué à 10s'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Développeur</div>
                <div className="text-xs font-bold text-sky-400 truncate">
                  {timerSeconds <= 14 ? currentRoundGame.developer : 'Débloqué à 14s'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Direction Artistique</div>
                <div className="text-xs font-bold text-emerald-400 truncate">
                  {currentRoundGame.artStyle?.fr || 'Indé culte'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'screenle':
      default:
        return (
          <img
            src={currentRoundGame.screenshots[0] || currentRoundGame.screenshots[5]}
            alt="Indie Guess Challenge"
            style={getVisualClueStyles()}
            className="w-full h-full object-cover transition-all duration-700 select-none pointer-events-none"
          />
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Notifications bar */}
      {connectionNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-[#131a29] border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{connectionNotice}</span>
        </div>
      )}

      {/* COMPTE REQUIS POUR LE 1V1 */}
      {!hasAccount ? (
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Compte Joueur Requis • Cloud Souverain</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Accédez à l'Arène 1v1
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Pour défier vos amis en P2P WebRTC, affronter le Grand-Duc et sauvegarder votre cote ELO sur notre cloud souverain, connectez-vous ou créez votre compte joueur gratuit.
            </p>
          </div>

          {/* Avantages du compte */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-[#131a29]/80 border border-[#1e293b] rounded-2xl text-center text-xs">
            <div className="p-2 space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-amber-400" />
              <div className="font-bold text-white text-[11px]">Classement ELO</div>
              <div className="text-[10px] text-slate-400">Progression garantie</div>
            </div>
            <div className="p-2 space-y-1">
              <Cloud className="w-5 h-5 mx-auto text-emerald-400" />
              <div className="font-bold text-white text-[11px]">Cloud Souverain</div>
              <div className="text-[10px] text-slate-400">0 perte de données</div>
            </div>
            <div className="p-2 space-y-1">
              <Swords className="w-5 h-5 mx-auto text-indigo-400" />
              <div className="font-bold text-white text-[11px]">Duels P2P</div>
              <div className="text-[10px] text-slate-400">Temps réel direct</div>
            </div>
          </div>

          {/* Carte Formulaire & Méthodes 1 Clic */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-[#131a29] to-[#0e1422] border border-amber-500/30 rounded-3xl shadow-2xl space-y-6">
            {/* Champ Pseudo Rapide */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Votre Pseudo de Duelliste</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Personnalisable à tout moment</span>
              </label>
              <input
                type="text"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Ex: Maître Du Hibou"
                className="w-full px-4 py-2.5 bg-[#0b0f19] border border-[#1e293b] focus:border-amber-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition"
              />
            </div>

            {/* Méthodes 1 Clic */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Création &amp; Connexion en 1 Clic</span>
                </span>
                <span className="text-emerald-400 font-bold">Sans mot de passe</span>
              </div>

              {/* 1. Continuer avec Steam */}
              <button
                type="button"
                onClick={handleSteam1Click}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#171a21] hover:bg-[#1f2430] border border-[#2a475e] hover:border-cyan-400/60 text-white font-bold text-xs transition shadow-lg group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <SteamIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-slate-100 group-hover:text-cyan-300 transition flex items-center gap-2">
                      <span>Continuer avec Steam</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      Connexion 1 clic &amp; synchro bibliothèque Valve
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20 shrink-0">
                  Recommandé
                </span>
              </button>

              {/* 2. Continuer avec Google */}
              <button
                type="button"
                onClick={handleGoogle1Click}
                disabled={authLoading}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] hover:border-slate-600 text-white font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-200">
                      Continuer avec Google
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      Connexion &amp; compte cloud en 1 clic
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg shrink-0">
                  1 Clic
                </span>
              </button>

              {/* 3. Bouton Compte Joueur Local 1 Clic */}
              <button
                type="button"
                onClick={handleInstantGuest1Click}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-white font-bold text-xs transition shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-amber-300 group-hover:text-amber-200 transition">
                      Création Express 1 Clic (Profil Local)
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      Accès immédiat à l'arène avec sauvegarde locale de votre ELO
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 shrink-0">
                  Instantané
                </span>
              </button>
            </div>

            {/* Séparateur */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Ou par e-mail &amp; mot de passe
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Toggle Tabs */}
            <div className="flex p-1 bg-[#0b0f19] rounded-xl border border-[#1e293b]">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Créer un compte
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Se connecter
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Adresse Email</span>
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  required
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-[#1e293b] focus:border-amber-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mot de passe (6 caractères min)</span>
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-[#1e293b] focus:border-amber-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <span>Chargement...</span>
                ) : (
                  <>
                    <span>
                      {authMode === 'signup'
                        ? 'Créer mon compte et entrer dans l\'Arène'
                        : 'Connexion et Accès à l\'Arène'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {onOpenAuth && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-[11px] text-slate-400 hover:text-amber-400 underline transition cursor-pointer"
                >
                  Ouvrir le panneau complet d'authentification
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* LOBBY / CHOIX DU MODE */}
      {phase === 'lobby' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Swords className="w-4 h-4" />
              Arène Multijoueur 1v1 • P2P WebRTC
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Arène Face-à-Face
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
              Défiez un ami en direct via WebRTC sans latence ou entraînez vos réflexes solo contre le Grand-Duc. Première personne à 2 victoires l'emporte !
            </p>
          </div>

          {/* Profil Joueur ELO & Statut Compte */}
          <div className="max-w-md mx-auto p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
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
                <div className="text-lg font-black text-indigo-400 font-mono">
                  {profile.versusStats.eloRating}
                </div>
              </div>
            </div>

            {/* Barre de statut du compte joueur & bouton changer */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                {isSteamConnected ? (
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <SteamIcon className="w-3.5 h-3.5" />
                    <span>Steam ({profile.steam?.personaName || profile.username})</span>
                  </span>
                ) : profile.email ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cloud ({profile.email})</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <User className="w-3.5 h-3.5" />
                    <span>Compte Joueur Local</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSwitchAccount}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-semibold transition cursor-pointer"
                title="Changer de compte ou se déconnecter"
              >
                <LogOut className="w-3 h-3" />
                <span>Changer</span>
              </button>
            </div>
          </div>

          {/* SÉLECTEUR DE DISCIPLINE DE DUEL */}
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Dices className="w-4 h-4 text-amber-400" />
                <span>Discipline du Duel</span>
              </span>
              <span className="text-[11px] text-amber-400 font-bold">
                {selectedDiscipline === 'all'
                  ? 'Épreuves tournantes par manche'
                  : `Manches 100% ${getDisciplineMeta(selectedDiscipline).label}`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {VERSUS_DISCIPLINES.map((disc) => {
                const IconComponent = disc.icon;
                const isSelected = selectedDiscipline === disc.id;
                return (
                  <button
                    key={disc.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedDiscipline(disc.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-[#131a29] border-[#1e293b] hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {disc.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                      {disc.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cartes des Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Mode 1: Duel Réel entre Amis (WebRTC P2P) */}
            <div className="p-6 bg-gradient-to-b from-[#131a29] to-[#0e1422] border border-amber-500/30 hover:border-amber-500/60 rounded-3xl shadow-xl flex flex-col justify-between transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-white">
                    Duel 1v1 en Direct
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                    Vrai P2P
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Connexion WebRTC directe de navigateur à navigateur. Partagez un code ou le lien à un ami pour vous affronter sur les mêmes écrans en temps réel.
                </p>

                <button
                  onClick={handleCreateRoom}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 mb-3 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  Créer un Salon Privé (Hôte)
                </button>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="HOOT-..."
                    maxLength={10}
                    className="flex-1 px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs font-mono font-bold text-white uppercase placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!joinCodeInput.trim()}
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Rejoindre
                  </button>
                </div>
              </div>
            </div>

            {/* Mode 2: Entraînement Solo contre le Grand-Duc */}
            <div className="p-6 bg-gradient-to-b from-[#131a29] to-[#0e1422] border border-[#1e293b] hover:border-indigo-500/40 rounded-3xl shadow-xl flex flex-col justify-between transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-white">
                    Entraînement Solo
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                    Chrono IA
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Affrontez l'intelligence du Grand-Duc pour affûter vos réflexes de reconnaissance rapide sans attendre un adversaire humain.
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleStartSoloBot}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Défier le Grand-Duc en Solo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EN ATTENTE D'UN AMI (HÔTE) */}
      {phase === 'waiting_friend' && (
        <div className="max-w-md mx-auto text-center py-12 px-6 bg-[#131a29] border border-amber-500/30 rounded-3xl shadow-2xl space-y-6 animate-in fade-in">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-xl">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Salon Privé Ouvert</h3>
            <p className="text-xs text-slate-300 mt-1">
              Transmettez ce code à votre ami pour qu'il vous rejoigne en un clic.
            </p>
          </div>

          <div className="p-4 bg-[#0b0f19] border border-amber-500/40 rounded-2xl space-y-3">
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Code du Salon :
            </div>
            <div className="text-2xl font-black text-amber-400 tracking-widest font-mono">
              {roomCode}
            </div>
            <button
              onClick={handleCopyInvite}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Lien copié dans le presse-papier !' : 'Copier le lien d\'invitation direct'}
            </button>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                soundFx.playClick();
                cleanupP2P();
                setPhase('lobby');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Annuler et fermer le salon
            </button>
          </div>
        </div>
      )}

      {/* RECHERCHE DU BOT SOLO */}
      {phase === 'queueing' && (
        <div className="max-w-md mx-auto text-center py-16 px-4 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-2xl space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shadow-xl">
              <Bot className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Éveil du Grand-Duc...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Calibrage d'un défi chronométré adapté à vos {profile.versusStats.eloRating} ELO
            </p>
          </div>
        </div>
      )}

      {/* COMPTE À REBOURS */}
      {phase === 'countdown' && opponent && (
        <div className="max-w-md mx-auto text-center py-14 px-4 bg-[#131a29] border border-amber-500/30 rounded-3xl shadow-2xl space-y-6">
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

          <div className="text-6xl font-black text-amber-400 animate-pulse font-mono">
            {countdown}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Préparez vos claviers !
          </p>
        </div>
      )}

      {/* EN JEU / FIN DE MANCHE */}
      {(phase === 'playing' || phase === 'round_end') && opponent && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Alerte pénalité adversaire */}
          {opponentPenaltyNotice && (
            <div className="p-3 bg-indigo-950/60 border border-indigo-500/50 rounded-2xl text-center text-xs text-indigo-200 font-bold animate-in fade-in">
              {opponentPenaltyNotice}
            </div>
          )}

          {/* Tableau de score */}
          <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl flex items-center justify-between shadow-md">
            {/* Côté Joueur */}
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

            {/* Timer central */}
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Manche {currentRoundNumber}/3
              </div>
              <div className="flex items-center justify-center gap-1 text-xl font-black text-amber-400 font-mono">
                <Clock className="w-4 h-4" />
                {timerSeconds}s
              </div>
            </div>

            {/* Côté Adversaire */}
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

          {/* Badge Discipline Active */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#131a29] border border-[#1e293b] text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                {React.createElement(getDisciplineMeta(currentRoundDiscipline).icon, { className: 'w-3 h-3' })}
              </div>
              <span className="text-white font-bold">{getDisciplineMeta(currentRoundDiscipline).label}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {selectedDiscipline === 'all' ? 'Épreuve Tournante Mixte' : 'Duel Thématique'}
            </div>
          </div>

          {/* Zone du défi de la discipline */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-[#1e293b] shadow-2xl flex items-center justify-center">
            {renderDisciplineChallenge()}

            {/* Indices progressifs si discipline visuelle */}
            {currentRoundDiscipline !== 'review' && currentRoundDiscipline !== 'blindtest' && (
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
            )}

            {/* Bilan de fin de manche */}
            {phase === 'round_end' && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in z-20">
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

          {/* Les 4 Choix Buzzers Rapides (1-4) */}
          {phase === 'playing' && currentRoundChoices.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentRoundChoices.map((choice, idx) => (
                  <button
                    key={choice.id}
                    disabled={isLockedOut}
                    onClick={() => handlePlayerGuess(choice)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] hover:border-amber-500/50 text-left transition-all active:scale-98 disabled:opacity-40 cursor-pointer shadow-md group"
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 group-hover:border-amber-500">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0 truncate font-semibold text-xs sm:text-sm text-white group-hover:text-amber-300">
                      {choice.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Barre de devinette */}
          {phase === 'playing' && (
            <div className="relative" ref={searchContainerRef}>
              {isLockedOut ? (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-center text-xs text-rose-300 font-bold animate-pulse flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Mauvaise réponse ! Pénalité de blocage : {lockoutRemaining}s</span>
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
                      placeholder={`Ou tapez n'importe quel titre du catalogue (${INDIE_GAMES.length} pépites)...`}
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
                    />
                  </div>

                  {searchFocused && filteredGames.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-1.5 bg-[#0e1422] border border-[#1e293b] rounded-2xl shadow-2xl z-30 max-h-56 overflow-y-auto space-y-1">
                      {filteredGames.map((game) => (
                        <button
                          key={game.id}
                          onClick={() => handlePlayerGuess(game)}
                          className="w-full p-2 rounded-xl flex items-center gap-3 hover:bg-amber-500/10 hover:border-amber-500/30 border border-transparent text-left transition-all group cursor-pointer"
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

      {/* FIN DE MATCH */}
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
                if (opponent.isBot) {
                  startCountdownScreen();
                } else {
                  launchMatchP2P();
                }
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Revanche
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                cleanupP2P();
                setPhase('lobby');
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#0b0f19] border border-[#1e293b] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Retour au Salon
            </button>
          </div>
        </div>
      )}
      </>
    )}
    </div>
  );
};
