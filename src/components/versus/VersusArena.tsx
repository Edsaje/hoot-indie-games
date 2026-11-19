import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Search,
  AlertCircle,
  Play,
  Pause,
  ThumbsUp,
  Sliders,
  Disc,
  Calendar,
  Target,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  createVersusRoom,
  joinVersusRoom,
  sendVersusMessage,
  pollVersusEvents,
  leaveVersusRoom,
} from '../../services/versusRelayService';
import { INDIE_GAMES } from '../../data/games';
import type { Game } from '../../types/game';
import type { VersusDiscipline } from '../../types/versus';
import { useUserAccount } from '../../context/useUserAccount';
import { useAchievements } from '../../context/useAchievements';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import { INDIE_AVATARS } from '../../data/avatars';
import { soundFx } from '../../utils/audio';
import { telemetry } from '../../services/telemetry';
import { getRandomReviewPuzzle, type ReviewPuzzle } from '../../data/reviewPuzzles';
import { getBilingualText } from '../../utils/localization';
import { getRandomBlindTestPuzzle, noteToFrequency, type BlindTestPuzzle } from '../../data/blindtestPuzzles';
import { obfuscateGameId, deobfuscateGameId, drawProtectedImageToCanvas } from '../../utils/securityAntiCheat';
import {
  type VersusPhase,
  type OpponentData,
  type PeerMessage,
  generateRoomCode,
  generatePeerId,
  getRandomBot,
  pickRandomGame,
  getBotDecision,
  getDisciplineMeta,
} from './versusConstants';
import { VersusAuthGate } from './VersusAuthGate';
import { VersusLobbyView } from './VersusLobbyView';
import { VersusPostMatchView } from './VersusPostMatchView';

interface VersusArenaProps {
  onOpenAuth?: () => void;
}

export const VersusArena: React.FC<VersusArenaProps> = ({ onOpenAuth }) => {
  const { i18n } = useTranslation();
  const {
    profile,
    isAuthenticated,
    isSteamConnected,
    loginWithGoogle,
    connectSteamWithOpenId,
    updateProfile,
    setUsername,
    recordVersusResult,
    logout,
  } = useUserAccount();
  const { unlockAchievement } = useAchievements();
  const { allPlayableGames } = useSteamCatalog();

  const [authUsername, setAuthUsername] = useState<string>(profile.username || '');
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

  // Pixel & Screenle Canvas Refs
  const pixelCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const versusScreenleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Web Audio synth for Versus Blind Test
  const versusAudioCtxRef = useRef<AudioContext | null>(null);
  const versusActiveNodesRef = useRef<{ stop: () => void }[]>([]);
  const versusAudioTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versusAnimFrameRef = useRef<number | null>(null);
  const versusAnalyserRef = useRef<AnalyserNode | null>(null);
  const [isVersusAudioPlaying, setIsVersusAudioPlaying] = useState<boolean>(false);
  const [versusFrequencies, setVersusFrequencies] = useState<number[]>(new Array(12).fill(0));

  // 1v1 Duel Quick Chat & Emotes
  const [duelChatMessage, setDuelChatMessage] = useState<{
    sender: string;
    text: string;
    emote?: string;
  } | null>(null);
  const duelChatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Envoi d'un message rapide / émote de duel
  const sendDuelChat = (text: string, emote?: string) => {
    soundFx.playClick();
    setDuelChatMessage({
      sender: profile.username,
      text,
      emote: emote || '',
    });
    if (duelChatTimerRef.current) clearTimeout(duelChatTimerRef.current);
    duelChatTimerRef.current = setTimeout(() => {
      setDuelChatMessage(null);
    }, 4500);

    if (opponent?.isBot) {
      const BOT_RESPONSES = [
        { text: 'Bien joué ! 🦉', emote: '🦉' },
        { text: 'Trop rapide pour moi ! 🔥', emote: '🔥' },
        { text: 'Joli réflexe ! 👏', emote: '👏' },
        { text: 'Attends la prochaine manche... 😈', emote: '😈' },
        { text: 'Impressionnant ! ✨', emote: '✨' },
      ];
      setTimeout(() => {
        const pick = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
        soundFx.playChime();
        setDuelChatMessage({
          sender: opponent.name,
          text: pick.text,
          emote: pick.emote,
        });
        if (duelChatTimerRef.current) clearTimeout(duelChatTimerRef.current);
        duelChatTimerRef.current = setTimeout(() => {
          setDuelChatMessage(null);
        }, 4500);
      }, 1200);
    } else {
      sendP2P({
        type: 'duel_chat',
        chatText: text,
        chatEmote: emote,
        senderName: profile.username,
      });
    }
  };

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

    let lastUpdate = 0;
    const updateFreqs = (timestamp: number) => {
      if (!versusAnalyserRef.current) return;
      if (timestamp - lastUpdate >= 66) {
        lastUpdate = timestamp;
        const dataArray = new Uint8Array(versusAnalyserRef.current.frequencyBinCount);
        versusAnalyserRef.current.getByteFrequencyData(dataArray);

        const sampled: number[] = [];
        const step = Math.max(1, Math.floor(dataArray.length / 12));
        for (let i = 0; i < 12; i++) {
          sampled.push(dataArray[i * step] || 0);
        }
        setVersusFrequencies(sampled);
      }
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

  // Dessin protégé Canvas pour le mode Screenle en Versus (Anti-F12 / Anti-DOM AppID leak)
  useEffect(() => {
    if (currentRoundDiscipline !== 'screenle' || !versusScreenleCanvasRef.current || !currentRoundGame) return;
    const canvas = versusScreenleCanvasRef.current;
    const isEnd = phase === 'round_end' || phase === 'match_end';
    const scale = isEnd ? 1 : (timerSeconds > 15 ? 2.2 : (timerSeconds > 10 ? 1.6 : (timerSeconds > 5 ? 1.2 : 1)));
    const blurPx = isEnd ? 0 : (timerSeconds > 15 ? 16 : (timerSeconds > 10 ? 9 : (timerSeconds > 5 ? 4 : 0)));
    const imgUrl = currentRoundGame.screenshots[0] || currentRoundGame.screenshots[5];
    if (imgUrl) {
      drawProtectedImageToCanvas(canvas, imgUrl, {
        scale,
        originX: 50,
        originY: 50,
        blurPx,
      });
    }
  }, [currentRoundDiscipline, currentRoundGame, phase, timerSeconds]);

  // Références Relais Souverain Multijoueur
  const relayPlayerIdRef = useRef<string>('');
  const relayRoomCodeRef = useRef<string>('');
  const relayLastMsgIdRef = useRef<number>(0);
  const relayPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHostRef = useRef<boolean>(false);
  const opponentRef = useRef<OpponentData | null>(null);
  const currentRoundGameRef = useRef<Game>(INDIE_GAMES[0]);
  const playerScoreRef = useRef<number>(0);
  const opponentScoreRef = useRef<number>(0);
  const roundNumRef = useRef<number>(1);

  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundResolvedRef = useRef<boolean>(false);
  const consecutiveClosedCountRef = useRef<number>(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const playerAvatar = INDIE_AVATARS.find((a) => a.id === profile.avatarId) || INDIE_AVATARS[0];
  const opponentAvatar = opponent
    ? INDIE_AVATARS.find((a) => a.id === opponent.avatarId) || INDIE_AVATARS[1]
    : INDIE_AVATARS[1];

  // Synchroniser les refs pour les événements en temps réel
  useEffect(() => {
    currentRoundGameRef.current = currentRoundGame;
    playerScoreRef.current = playerScore;
    opponentScoreRef.current = opponentScore;
    roundNumRef.current = currentRoundNumber;
    opponentRef.current = opponent;
  }, [currentRoundGame, playerScore, opponentScore, currentRoundNumber, opponent]);

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
    if (roundTimerRef.current) {
      clearInterval(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (botTimerRef.current) {
      clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
    if (lockoutTimerRef.current) {
      clearInterval(lockoutTimerRef.current);
      lockoutTimerRef.current = null;
    }
    if (roundTransitionTimerRef.current) {
      clearTimeout(roundTransitionTimerRef.current);
      roundTransitionTimerRef.current = null;
    }
    stopVersusAudio();
  };

  const cleanupP2P = () => {
    stopVersusAudio();
    if (relayPollTimerRef.current) {
      clearInterval(relayPollTimerRef.current);
      relayPollTimerRef.current = null;
    }
    if (relayRoomCodeRef.current && relayPlayerIdRef.current) {
      leaveVersusRoom(relayRoomCodeRef.current, relayPlayerIdRef.current);
    }
    relayRoomCodeRef.current = '';
    relayPlayerIdRef.current = '';
    relayLastMsgIdRef.current = 0;
    isHostRef.current = false;
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
      cleanupP2P();
      try {
        versusAudioCtxRef.current?.close();
      } catch {}
    };
  }, []);

  // Envoi d'un message via le relais souverain OVHcloud (0 popup)
  const sendP2P = (msg: PeerMessage) => {
    if (relayRoomCodeRef.current && relayPlayerIdRef.current) {
      sendVersusMessage(relayRoomCodeRef.current, relayPlayerIdRef.current, msg);
    }
  };

  // Polling réactif en direct pour recevoir les coups de l'adversaire
  const startRelayPolling = (code: string, pId: string) => {
    if (relayPollTimerRef.current) {
      clearInterval(relayPollTimerRef.current);
      relayPollTimerRef.current = null;
    }

    relayPollTimerRef.current = setInterval(async () => {
      if (!relayRoomCodeRef.current || !relayPlayerIdRef.current) return;
      try {
        const res = await pollVersusEvents(code, pId, relayLastMsgIdRef.current);
        if (!res.success) {
          if (res.roomClosed) {
            consecutiveClosedCountRef.current += 1;
            // Ne déconnecter qu'après 3 échecs consécutifs confirmés pour absorber les micro-latences serveur
            if (consecutiveClosedCountRef.current >= 3) {
              setConnectionNotice('Le salon a été fermé par l\'hôte.');
              cleanupP2P();
            }
          }
          return;
        }

        consecutiveClosedCountRef.current = 0;
        relayLastMsgIdRef.current = res.lastMessageId;

        // Traitement de chaque message reçu de l'adversaire
        if (res.events && res.events.length > 0) {
          for (const ev of res.events) {
            handleP2PMessage(ev as PeerMessage);
          }
        }
      } catch {
        // Ignorer les micro-coupures réseau
      }
    }, 350);
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
        const resolvedGameId =
          (msg.secretToken && msg.puzzleSeed ? deobfuscateGameId(msg.secretToken, msg.puzzleSeed) : null) ||
          msg.gameId;

        if (resolvedGameId) {
          const matched = gamePool.find((g) => g.id === resolvedGameId) || gamePool[0];
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
        // Si la manche a déjà été résolue localement pour ce round
        if (roundResolvedRef.current) {
          // L'hôte fait autorité et conserve son arbitrage
          if (isHostRef.current) {
            return;
          }
        }

        roundResolvedRef.current = true;
        clearAllTimers();
        soundFx.playError();
        const newScore = (msg.score !== undefined ? msg.score : opponentScoreRef.current + 1);
        setOpponentScore(newScore);
        setRoundWinner('opponent');
        setPhase('round_end');

        roundTransitionTimerRef.current = setTimeout(() => {
          advanceRoundP2P(playerScoreRef.current, newScore, roundNumRef.current);
        }, 2800);
        break;
      }

      case 'round_timeout': {
        // Temps écoulé reçu de l'hôte
        if (roundResolvedRef.current) return;
        roundResolvedRef.current = true;
        clearAllTimers();
        soundFx.playError();
        setRoundWinner('draw');
        setPhase('round_end');

        roundTransitionTimerRef.current = setTimeout(() => {
          advanceRoundP2P(playerScoreRef.current, opponentScoreRef.current, roundNumRef.current);
        }, 2800);
        break;
      }

      case 'player_left': {
        setConnectionNotice('L\'adversaire a quitté la partie.');
        break;
      }

      case 'duel_chat': {
        if (msg.chatText || msg.chatEmote) {
          soundFx.playChime();
          setDuelChatMessage({
            sender: msg.senderName || opponent?.name || 'Adversaire',
            text: msg.chatText || '',
            emote: msg.chatEmote || '',
          });
          if (duelChatTimerRef.current) clearTimeout(duelChatTimerRef.current);
          duelChatTimerRef.current = setTimeout(() => {
            setDuelChatMessage(null);
          }, 4500);
        }
        break;
      }
    }
  };

  // Création d'un salon multijoueur souverain (Hôte)
  const handleCreateRoom = async () => {
    soundFx.playClick();
    cleanupP2P();
    const code = generateRoomCode();
    setRoomCode(code);
    setPhase('waiting_friend');
    setConnectionNotice('Création du salon sur le relais souverain...');
    try {
      window.history.replaceState(null, '', `#versus=${code}`);
    } catch {
      // Ignorer
    }

    isHostRef.current = true;
    relayRoomCodeRef.current = code;

    try {
      const res = await createVersusRoom(code, {
        name: profile.username,
        avatarId: profile.avatarId,
        elo: profile.versusStats.eloRating,
      });

      relayPlayerIdRef.current = res.playerId;
      setConnectionNotice(null);
      startRelayPolling(code, res.playerId);
    } catch (err: any) {
      setConnectionNotice(err.message || 'Impossible de créer le salon souverain.');
    }
  };

  // Rejoindre un salon multijoueur souverain (Invité)
  const handleJoinRoom = async () => {
    if (!joinCodeInput.trim()) return;
    soundFx.playClick();
    cleanupP2P();

    const cleanCode = joinCodeInput.trim().toUpperCase();
    setRoomCode(cleanCode);
    setConnectionNotice('Connexion au salon de votre ami...');
    isHostRef.current = false;
    relayRoomCodeRef.current = cleanCode;

    try {
      const res = await joinVersusRoom(cleanCode, {
        name: profile.username,
        avatarId: profile.avatarId,
        elo: profile.versusStats.eloRating,
      });

      relayPlayerIdRef.current = res.playerId;

      if (res.opponent) {
        setOpponent({
          id: res.opponent.id || 'host_player',
          name: res.opponent.name || 'Hôte du Salon',
          avatarId: res.opponent.avatarId || 'knight',
          elo: res.opponent.elo || 1000,
          score: 0,
          isBot: false,
        });
        setConnectionNotice('Connecté ! En attente du lancement par l\'hôte...');
      }

      startRelayPolling(cleanCode, res.playerId);
    } catch (err: any) {
      setConnectionNotice(err.message || 'Salon introuvable. Vérifiez que votre ami a bien créé le salon et que le code est exact.');
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
    isHostRef.current = true; // Mode solo contre bot : le joueur local est l'hôte arbitre

    setTimeout(() => {
      const bot = getRandomBot(profile.versusStats.eloRating);
      setOpponent(bot);
      opponentRef.current = bot;
      startCountdownScreen(bot);
    }, 1500);
  };

  // Compte à rebours 3-2-1
  const startCountdownScreen = (activeOpponent?: OpponentData) => {
    const opp = activeOpponent || opponentRef.current || opponent;
    if (activeOpponent) {
      setOpponent(activeOpponent);
      opponentRef.current = activeOpponent;
    }

    setPhase('countdown');
    setCountdown(3);
    setPlayerScore(0);
    setOpponentScore(0);
    setCurrentRoundNumber(1);

    telemetry.track('versus', 'versus_play', opp?.name || 'Duel 1v1', undefined, {
      opponentElo: opp?.elo || 1000,
      isBot: Boolean(opp?.isBot),
    });

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const isBot = Boolean(opp?.isBot || opponentRef.current?.isBot);
          if (isHostRef.current || isBot) {
            // L'hôte choisit le jeu initial, la discipline et les 4 choix
            const disc = pickRoundDiscipline(1);
            const seed = `${Date.now()}_${Math.random()}`;
            let game = pickRandomGame(gamePool);

            if (disc === 'review') {
              const pz = getRandomReviewPuzzle(seed);
              if (pz?.targetGame) {
                game = gamePool.find((g) => g.id === pz.targetGame.id) || pz.targetGame;
              }
              setCurrentReviewPuzzle(pz);
            } else if (disc === 'blindtest') {
              const btp = getRandomBlindTestPuzzle(seed);
              if (btp?.targetGame) {
                game = gamePool.find((g) => g.id === btp.targetGame.id) || btp.targetGame;
              }
              setCurrentBlindTestPuzzle(btp);
              playVersusAudio(btp);
            }

            const choices = generateRoundChoices(game, gamePool);
            setCurrentRoundGame(game);
            setCurrentRoundDiscipline(disc);
            setCurrentRoundChoices(choices);

            if (!isBot) {
              sendP2P({
                type: 'round_start',
                secretToken: obfuscateGameId(game.id, seed),
                roundNum: 1,
                discipline: disc,
                choiceIds: choices.map((c) => c.id),
                puzzleSeed: seed,
              });
            }
            beginRoundExecution(1, 0, 0, isBot);
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
    currentOScore: number,
    isBotMatchParam?: boolean
  ) => {
    clearAllTimers();
    roundResolvedRef.current = false;
    setPhase('playing');
    setCurrentRoundNumber(roundNum);
    setTimerSeconds(20);
    setRoundWinner(null);
    setGuessQuery('');
    setIsLockedOut(false);
    setOpponentPenaltyNotice(null);

    const isBotMatch = isBotMatchParam ?? Boolean(opponentRef.current?.isBot || opponent?.isBot);

    // Timer du round
    roundTimerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(roundTimerRef.current!);
          if (isHostRef.current || isBotMatch) {
            if (!isBotMatch) {
              sendP2P({ type: 'round_timeout' });
            }
            handleRoundTimeout(currentPScore, currentOScore, roundNum);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Si on joue contre le bot IA, déclencher sa décision simulée
    if (isBotMatch) {
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
    if (roundResolvedRef.current) return;
    roundResolvedRef.current = true;
    clearAllTimers();
    soundFx.playError();
    setRoundWinner('draw');
    setPhase('round_end');

    roundTransitionTimerRef.current = setTimeout(() => {
      advanceRoundP2P(pScore, oScore, roundNum);
    }, 2800);
  };

  // Victoire de manche par le bot IA
  const handleOpponentCorrectGuess = (pScore: number, oScore: number, roundNum: number) => {
    if (roundResolvedRef.current) return;
    roundResolvedRef.current = true;
    clearAllTimers();
    soundFx.playError();
    const newOScore = oScore + 1;
    setOpponentScore(newOScore);
    setRoundWinner('opponent');
    setPhase('round_end');

    roundTransitionTimerRef.current = setTimeout(() => {
      advanceRoundP2P(pScore, newOScore, roundNum);
    }, 2800);
  };

  // Proposition du joueur
  const handlePlayerGuess = (game: Game) => {
    if (isLockedOut || phase !== 'playing' || roundResolvedRef.current) return;

    setSearchFocused(false);
    setGuessQuery('');

    if (game.id === currentRoundGame.id) {
      // Victoire de manche par le joueur !
      roundResolvedRef.current = true;
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

      roundTransitionTimerRef.current = setTimeout(() => {
        advanceRoundP2P(newPScore, opponentScoreRef.current, currentRoundNumber);
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
      const isBotMatch = Boolean(opponentRef.current?.isBot || opponent?.isBot);
      if (isHostRef.current || isBotMatch) {
        const nextDisc = pickRoundDiscipline(roundNum + 1);
        const seed = `${Date.now()}_${Math.random()}`;
        let nextGame = pickRandomGame(gamePool);

        if (nextDisc === 'review') {
          const pz = getRandomReviewPuzzle(seed);
          if (pz?.targetGame) {
            nextGame = gamePool.find((g) => g.id === pz.targetGame.id) || pz.targetGame;
          }
          setCurrentReviewPuzzle(pz);
        } else if (nextDisc === 'blindtest') {
          const btp = getRandomBlindTestPuzzle(seed);
          if (btp?.targetGame) {
            nextGame = gamePool.find((g) => g.id === btp.targetGame.id) || btp.targetGame;
          }
          setCurrentBlindTestPuzzle(btp);
          playVersusAudio(btp);
        }

        const choices = generateRoundChoices(nextGame, gamePool);
        setCurrentRoundGame(nextGame);
        setCurrentRoundDiscipline(nextDisc);
        setCurrentRoundChoices(choices);

        if (!isBotMatch) {
          sendP2P({
            type: 'round_start',
            secretToken: obfuscateGameId(nextGame.id, seed),
            roundNum: roundNum + 1,
            discipline: nextDisc,
            choiceIds: choices.map((c) => c.id),
            puzzleSeed: seed,
          });
        }
        beginRoundExecution(roundNum + 1, pScore, oScore, isBotMatch);
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



  const handlePlayerGuessRef = useRef(handlePlayerGuess);
  useEffect(() => {
    handlePlayerGuessRef.current = handlePlayerGuess;
  });

  // Raccourcis clavier (1, 2, 3, 4) pour buzzer instantanément sur les 4 choix
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      
      const target = e.target as HTMLElement;
      if (target && (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable)) {
        return;
      }
if (phase !== 'playing' || isLockedOut || searchFocused) return;

      if (['1', '&'].includes(e.key) && currentRoundChoices[0]) {
        e.preventDefault();
        handlePlayerGuessRef.current(currentRoundChoices[0]);
      } else if (['2', 'é'].includes(e.key) && currentRoundChoices[1]) {
        e.preventDefault();
        handlePlayerGuessRef.current(currentRoundChoices[1]);
      } else if (['3', '"'].includes(e.key) && currentRoundChoices[2]) {
        e.preventDefault();
        handlePlayerGuessRef.current(currentRoundChoices[2]);
      } else if (['4', "'"].includes(e.key) && currentRoundChoices[3]) {
        e.preventDefault();
        handlePlayerGuessRef.current(currentRoundChoices[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isLockedOut, searchFocused, currentRoundChoices]);

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
                ? (getBilingualText(currentReviewPuzzle?.fullText || currentReviewPuzzle?.fullReviewFr, currentReviewPuzzle?.fullReviewEn, i18n.language) || currentRoundGame.title)
                : (getBilingualText(currentReviewPuzzle?.redactedText || currentReviewPuzzle?.redactedReviewFr, currentReviewPuzzle?.redactedReviewEn, i18n.language) || 'Critique Steam en cours de décodage...')}"
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
                <div className="text-[10px] text-slate-400 font-bold uppercase">Genre</div>
                <div className="text-xs font-bold text-white truncate">{currentRoundGame.genre.join(', ')}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Année</div>
                <div className="text-xs font-bold text-amber-400">
                  {timerSeconds <= 10 ? currentRoundGame.releaseYear : 'Débloqué à 10s'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Développeur</div>
                <div className="text-xs font-bold text-sky-400 truncate">
                  {timerSeconds <= 14 ? currentRoundGame.developer : 'Débloqué à 14s'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Direction Artistique</div>
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
          <canvas
            ref={versusScreenleCanvasRef}
            width={640}
            height={360}
            className="w-full h-full object-cover transition-all duration-700 select-none pointer-events-none rounded-xl"
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
        <VersusAuthGate
          authUsername={authUsername}
          setAuthUsername={setAuthUsername}
          authLoading={authLoading}
          authError={authError}
          handleSteam1Click={handleSteam1Click}
          handleGoogle1Click={handleGoogle1Click}
          handleInstantGuest1Click={handleInstantGuest1Click}
          onOpenAuth={onOpenAuth}
          currentUsername={profile.username}
          onApplyUsername={(name) => setUsername(name)}
        />
      ) : (
        <>
          {/* LOBBY / EN ATTENTE / QUEUEING */}
          {(phase === 'lobby' || phase === 'waiting_friend' || phase === 'queueing') && (
            <VersusLobbyView
              phase={phase}
              profile={profile}
              playerAvatar={playerAvatar}
              isSteamConnected={isSteamConnected}
              handleSwitchAccount={handleSwitchAccount}
              selectedDiscipline={selectedDiscipline}
              setSelectedDiscipline={setSelectedDiscipline}
              handleCreateRoom={handleCreateRoom}
              joinCodeInput={joinCodeInput}
              setJoinCodeInput={setJoinCodeInput}
              handleJoinRoom={handleJoinRoom}
              handleStartSoloBot={handleStartSoloBot}
              roomCode={roomCode}
              handleCopyInvite={handleCopyInvite}
              copiedLink={copiedLink}
              onCancelWaiting={() => {
                cleanupP2P();
                setPhase('lobby');
              }}
            />
          )}

      {/* COMPTE À REBOURS */}
      {phase === 'countdown' && opponent && (
        <div className="max-w-md mx-auto text-center py-14 px-4 bg-[#131a29] border border-amber-500/30 rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${playerAvatar.bgGradient} flex items-center justify-center text-3xl shadow-lg mx-auto mb-2 overflow-hidden p-1.5`}
              >
                {playerAvatar.imageUrl ? (
                  <img src={playerAvatar.imageUrl} alt={playerAvatar.name} className="w-full h-full object-contain" />
                ) : (
                  playerAvatar.emoji
                )}
              </div>
              <div className="text-xs font-black text-white">{profile.username}</div>
            </div>

            <div className="text-2xl font-black text-amber-400">VS</div>

            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${opponentAvatar.bgGradient} flex items-center justify-center text-3xl shadow-lg mx-auto mb-2 overflow-hidden p-1.5`}
              >
                {opponentAvatar.imageUrl ? (
                  <img src={opponentAvatar.imageUrl} alt={opponentAvatar.name} className="w-full h-full object-contain" />
                ) : (
                  opponentAvatar.emoji
                )}
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
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${playerAvatar.bgGradient} flex items-center justify-center text-xl shrink-0 overflow-hidden p-1`}
              >
                {playerAvatar.imageUrl ? (
                  <img src={playerAvatar.imageUrl} alt={playerAvatar.name} className="w-full h-full object-contain" />
                ) : (
                  playerAvatar.emoji
                )}
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
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opponentAvatar.bgGradient} flex items-center justify-center text-xl shrink-0 overflow-hidden p-1`}
              >
                {opponentAvatar.imageUrl ? (
                  <img src={opponentAvatar.imageUrl} alt={opponentAvatar.name} className="w-full h-full object-contain" />
                ) : (
                  opponentAvatar.emoji
                )}
              </div>
            </div>
          </div>

          {/* Bulle / Toast Tchat de Duel */}
          {duelChatMessage && (
            <div className="p-2.5 bg-[#06241b] border-2 border-amber-400 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-200 animate-in fade-in slide-in-from-top-2">
              {duelChatMessage.emote && <span className="text-lg">{duelChatMessage.emote}</span>}
              <span className="font-bold text-white">{duelChatMessage.sender} :</span>
              <span className="italic">{duelChatMessage.text}</span>
            </div>
          )}

          {/* Barre de Réactions Rapides Duel */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {[
              { text: 'GG ! 🦉', emote: '🦉' },
              { text: 'Trop vif ! 🔥', emote: '🔥' },
              { text: 'Oups... 😱', emote: '😱' },
              { text: 'Bien joué ! 👏', emote: '👏' },
              { text: 'Prépare-toi ! 😈', emote: '😈' },
            ].map((q) => (
              <button
                key={q.text}
                type="button"
                onClick={() => sendDuelChat(q.text, q.emote)}
                className="px-2.5 py-1 rounded-full bg-[#131a29] hover:bg-amber-500/20 border border-[#1e293b] hover:border-amber-400/50 text-[11px] font-semibold text-slate-300 hover:text-amber-200 transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                title={`Envoyer "${q.text}"`}
              >
                <span>{q.emote}</span>
                <span>{q.text}</span>
              </button>
            ))}
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
                    <span className="text-slate-400 italic">Indice genre à 12s...</span>
                  )}
                </div>

                <div className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-slate-300">
                  {timerSeconds <= 6 ? (
                    <span>Année : <strong className="text-amber-400">{currentRoundGame.releaseYear}</strong></span>
                  ) : (
                    <span className="text-slate-400 italic">Indice année à 6s...</span>
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
        <VersusPostMatchView
          playerScore={playerScore}
          opponentScore={opponentScore}
          opponent={opponent}
          onRematch={() => {
            if (opponent.isBot) {
              isHostRef.current = true;
              startCountdownScreen(opponent);
            } else {
              launchMatchP2P();
            }
          }}
          onReturnToLobby={() => {
            cleanupP2P();
            setPhase('lobby');
          }}
        />
      )}
      </>
    )}
    </div>
  );
};
