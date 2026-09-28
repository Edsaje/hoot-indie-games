import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  Gamepad2,
  Skull,
  Crosshair,
  MousePointer,
  Zap,
  Tv,
  Menu,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { ARCADE_GAMES, type ArcadeGameId, type ArcadeGameMeta } from '../../data/arcadeGames';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { useGamepadStatus, useGamepadArcadeLoop } from '../../utils/gamepad';
import { useAchievements } from '../../context/useAchievements';
import { ArcadeSnake } from './games/ArcadeSnake';
import { ArcadePong } from './games/ArcadePong';
import { ArcadeBreakout } from './games/ArcadeBreakout';
import { ArcadeFlappy } from './games/ArcadeFlappy';
import { ArcadeInvaders } from './games/ArcadeInvaders';
import { ArcadeRun } from './games/ArcadeRun';
import { ArcadeTetris } from './games/ArcadeTetris';
import { ArcadeVectrex } from './games/ArcadeVectrex';
export type { ArcadeGameId, ArcadeGameMeta };
export type ArcadeDifficulty = 'detente' | 'normal' | 'expert';

const ARCADE_SUBTITLES: Record<ArcadeGameId, string> = {
  snake: 'Classique 1976 • Réflexes',
  pong: 'Pionnier 1972 • 2 Joueurs / IA',
  breakout: 'Casse-Briques 1976 • Bonus',
  flappy: 'Flappy Hibou 2013 • Vol Précis',
  invaders: 'Space Invaders 1978 • Shoot',
  run: 'Course Sylvestre 2014 • Runner',
  tetris: 'Tetris 1984 • Puzzle Blocs',
  vectrex: 'Mine Storm 1982 • Cathodique CRT',
};



interface ArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGame?: ArcadeGameId;
  onOpenLeaderboard?: (gameId?: string) => void;
}

export const ArcadeModal: React.FC<ArcadeModalProps> = ({
  isOpen,
  onClose,
  initialGame = 'snake',
  onOpenLeaderboard,
}) => {
  const { unlockAchievement, isUnlocked } = useAchievements();
  const [selectedGame, setSelectedGame] = useState<ArcadeGameId>(initialGame);
  const [gameKey, setGameKey] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<ArcadeDifficulty>(() => {
    try {
      const saved = localStorage.getItem('hoot_arcade_difficulty') as ArcadeDifficulty;
      if (saved === 'detente' || saved === 'normal' || saved === 'expert') {
        return saved;
      }
      return 'normal';
    } catch {
      return 'normal';
    }
  });
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(`hoot_arcade_hs_${initialGame}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [soundMuted, setSoundMuted] = useState<boolean>(!soundFx.isEnabled());
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState<boolean>(false);
  const [isVectrexUnlocked, setIsVectrexUnlocked] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('hoot_vectrex_unlocked') === 'true' ||
        localStorage.getItem('hoot_vectrex_phosphor') === 'true'
      );
    } catch {
      return false;
    }
  });
  const [isVectrexPhosphor, setIsVectrexPhosphor] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hoot_vectrex_phosphor') === 'true';
    } catch {
      return false;
    }
  });
  const isVectrexPhosphorRef = useRef(isVectrexPhosphor);
  isVectrexPhosphorRef.current = isVectrexPhosphor;
  const hasVectrexUnlocked = isVectrexUnlocked || isUnlocked('vectrex_phosphor');

      
  // Persistent inputs state (supports holding keys & touch)
  // Isolation stricte entre clavier physique et manette pour éviter tout conflit d'écrasement
  const keysDownRef = useRef<Set<string>>(new Set());
  const keyboardKeysRef = useRef<Set<string>>(new Set());
  const gamepadKeysRef = useRef<Set<string>>(new Set());
  const virtualPressTimestampsRef = useRef<Map<string, number>>(new Map());
  const virtualReleaseTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const virtualRepeatTimersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const touchPosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 200, y: 200, active: false });
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 200, y: 200 });
  const scoreRef = useRef<number>(0);
  const highScoreRef = useRef<number>(highScore);
  const scoreSpanRef = useRef<HTMLSpanElement | null>(null);
  const highScoreSpanRef = useRef<HTMLSpanElement | null>(null);

  const selectGame = (gameId: ArcadeGameId) => {
    soundFx.playClick();
    stopAllLoops();
    const saved = localStorage.getItem(`hoot_arcade_hs_${gameId}`);
    const hs = saved ? parseInt(saved, 10) : 0;
    highScoreRef.current = hs;
    scoreRef.current = 0;
    setHighScore(hs);
    setScore(0);
    if (scoreSpanRef.current) scoreSpanRef.current.textContent = '0';
    if (highScoreSpanRef.current) {
      highScoreSpanRef.current.textContent = (gameId === 'vectrex' && isVectrexPhosphor) ? 'HIB - 999 990' : String(hs);
    }
    setIsGameOver(false);
    setSelectedGame(gameId);
    setIsGameMenuOpen(false);
  };

  // Sync initialGame if prop changed from outside
  useEffect(() => {
    selectGame(initialGame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGame]);

  const saveHighScore = useCallback((val: number) => {
    if (val > highScoreRef.current) {
      highScoreRef.current = val;
      if (highScoreSpanRef.current) {
        highScoreSpanRef.current.textContent = (selectedGame === 'vectrex' && isVectrexPhosphor) ? 'HIB - 999 990' : String(val);
      }
      try {
        localStorage.setItem(`hoot_arcade_hs_${selectedGame}`, String(val));
      } catch {}
    }
  }, [selectedGame, isVectrexPhosphor]);

  const stopAllLoops = () => {};

  const restartCurrentGame = () => {
    soundFx.playClick();
    stopAllLoops();
    setIsGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    if (scoreSpanRef.current) scoreSpanRef.current.textContent = '0';
    setGameKey((k) => k + 1);
  };

  const handleDifficultyChange = (newDiff: ArcadeDifficulty) => {
    soundFx.playClick();
    setDifficulty(newDiff);
    try {
      localStorage.setItem('hoot_arcade_difficulty', newDiff);
    } catch {
      // ignore
    }
    stopAllLoops();
    setIsGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    if (scoreSpanRef.current) scoreSpanRef.current.textContent = '0';
    setGameKey((k) => k + 1);
  };

  const selectNextGame = useCallback(() => {
    const currentIndex = ARCADE_GAMES.findIndex((g) => g.id === selectedGame);
    const nextIdx = (currentIndex + 1) % ARCADE_GAMES.length;
    selectGame(ARCADE_GAMES[nextIdx].id);
  }, [selectedGame]);

  const selectPrevGame = useCallback(() => {
    const currentIndex = ARCADE_GAMES.findIndex((g) => g.id === selectedGame);
    const prevIdx = (currentIndex - 1 + ARCADE_GAMES.length) % ARCADE_GAMES.length;
    selectGame(ARCADE_GAMES[prevIdx].id);
  }, [selectedGame]);

  const toggleGameMenu = () => {
    soundFx.playClick();
    if (!isGameMenuOpen) {
      stopAllLoops();
    }
    setIsGameMenuOpen((prev) => !prev);
  };

  const getGameHighScore = useCallback((gameId: ArcadeGameId): number => {
    try {
      const val = localStorage.getItem(`hoot_arcade_hs_${gameId}`);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    if (!isGameMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsGameMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameMenuOpen]);

  const { isConnected: isGamepadConnected, gamepadName, labels } = useGamepadStatus();

  useGamepadArcadeLoop({
    enabled: isOpen,
    gameId: selectedGame,
    keysDownRef,
    gamepadKeysRef,
    onActionJustPressed: () => {
      if (isGameOver) {
        restartCurrentGame();
      }
    },
    onRestartJustPressed: () => {
      restartCurrentGame();
    },
    onNextGameJustPressed: () => {
      selectNextGame();
    },
    onPrevGameJustPressed: () => {
      selectPrevGame();
    },
    onCloseJustPressed: () => {
      soundFx.playClick();
      stopAllLoops();
      onClose();
    },
  });

  
  // Global Key Listener for modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer les événements synthétiques du gamepad pour éviter toute pollution
      if (!e.isTrusted) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyE'].includes(e.code)) {
        e.preventDefault();
      }
      keyboardKeysRef.current.add(e.code);
      keysDownRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.isTrusted) return;
      keyboardKeysRef.current.delete(e.code);
      keysDownRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keyboardKeysRef.current.clear();
      gamepadKeysRef.current.clear();
      keysDownRef.current.clear();
      virtualReleaseTimersRef.current.forEach((t) => clearTimeout(t));
      virtualReleaseTimersRef.current.clear();
      virtualRepeatTimersRef.current.forEach((i) => clearInterval(i));
      virtualRepeatTimersRef.current.clear();
      virtualPressTimestampsRef.current.clear();
    };
  }, [isOpen]);

  // Continuous touch / mouse press handlers for virtual controls
  const handleVirtualPress = useCallback((code: string) => {
    // Annuler tout timer de relâchement en attente pour cette touche
    const pendingRelease = virtualReleaseTimersRef.current.get(code);
    if (pendingRelease) {
      clearTimeout(pendingRelease);
      virtualReleaseTimersRef.current.delete(code);
    }
    virtualPressTimestampsRef.current.set(code, Date.now());

    keyboardKeysRef.current.add(code);
    keysDownRef.current.add(code);
    window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }));

    // Auto-repeat pour les jeux discrets (Tetris, etc.)
    const pendingRepeat = virtualRepeatTimersRef.current.get(code);
    if (pendingRepeat) clearInterval(pendingRepeat);
    const startRepeat = setTimeout(() => {
      const interval = setInterval(() => {
        if (keysDownRef.current.has(code)) {
          window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }));
        } else {
          clearInterval(interval);
        }
      }, 75);
      virtualRepeatTimersRef.current.set(code, interval);
    }, 220);
    virtualReleaseTimersRef.current.set(`repeat_start_${code}`, startRepeat);
  }, []);

  const handleVirtualRelease = useCallback((code: string) => {
    const repeatStart = virtualReleaseTimersRef.current.get(`repeat_start_${code}`);
    if (repeatStart) {
      clearTimeout(repeatStart);
      virtualReleaseTimersRef.current.delete(`repeat_start_${code}`);
    }
    const repeatInterval = virtualRepeatTimersRef.current.get(code);
    if (repeatInterval) {
      clearInterval(repeatInterval);
      virtualRepeatTimersRef.current.delete(code);
    }

    const pressTime = virtualPressTimestampsRef.current.get(code) || 0;
    const elapsed = Date.now() - pressTime;
    // Maintenir la touche active au minimum 140ms pour garantir la prise en compte dans les boucles à intervalle (Snake 85-145ms)
    const minHoldDuration = 140;

    const doRelease = () => {
      keyboardKeysRef.current.delete(code);
      keysDownRef.current.delete(code);
      window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true }));
      virtualReleaseTimersRef.current.delete(code);
    };

    if (elapsed < minHoldDuration) {
      const timer = setTimeout(doRelease, minHoldDuration - elapsed);
      virtualReleaseTimersRef.current.set(code, timer);
    } else {
      doRelease();
    }
  }, []);

  const virtualHandlersMapRef = useRef<Map<string, {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
  }>>(new Map());

  const bindVirtualTouch = useCallback((code: string) => {
    let handlers = virtualHandlersMapRef.current.get(code);
    if (!handlers) {
      handlers = {
        onPointerDown: (e: React.PointerEvent) => {
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {}
          handleVirtualPress(code);
        },
        onPointerUp: (e: React.PointerEvent) => {
          try {
            if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
              (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            }
          } catch {}
          handleVirtualRelease(code);
        },
        onPointerCancel: (e: React.PointerEvent) => {
          try {
            if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
              (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            }
          } catch {}
          handleVirtualRelease(code);
        },
        onTouchStart: (e: React.TouchEvent) => {
          e.preventDefault();
        },
        onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
      };
      virtualHandlersMapRef.current.set(code, handlers);
    }
    return handlers;
  }, [handleVirtualPress, handleVirtualRelease]);

  if (!isOpen) return null;

  const currentGameMeta =
    ARCADE_GAMES.find((g) => g.id === selectedGame) || ARCADE_GAMES[0];

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { x: 200, y: 200 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 400 / rect.height;
    return {
      x: Math.max(0, Math.min(400, (clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(400, (clientY - rect.top) * scaleY)),
    };
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const coords = getCanvasCoords(touch.clientX, touch.clientY);
    touchStartPosRef.current = coords;
    touchPosRef.current = { x: coords.x, y: coords.y, active: true };

    if (selectedGame === 'run') {
      if (coords.y > 270) {
        handleVirtualPress('ArrowDown');
        setTimeout(() => handleVirtualRelease('ArrowDown'), 320);
      } else {
        handleVirtualPress('Space');
        setTimeout(() => handleVirtualRelease('Space'), 60);
      }
    } else if (['flappy', 'breakout', 'pong', 'invaders', 'vectrex'].includes(selectedGame)) {
      handleVirtualPress('Space');
      setTimeout(() => handleVirtualRelease('Space'), 60);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const coords = getCanvasCoords(touch.clientX, touch.clientY);
    touchPosRef.current = { x: coords.x, y: coords.y, active: true };
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    touchPosRef.current.active = false;
    if (e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const endCoords = getCanvasCoords(touch.clientX, touch.clientY);
    const dx = endCoords.x - touchStartPosRef.current.x;
    const dy = endCoords.y - touchStartPosRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 25) {
      if (Math.abs(dx) > Math.abs(dy)) {
        const code = dx > 0 ? 'ArrowRight' : 'ArrowLeft';
        handleVirtualPress(code);
        setTimeout(() => handleVirtualRelease(code), 60);
      } else {
        const code = dy > 0 ? 'ArrowDown' : 'ArrowUp';
        handleVirtualPress(code);
        setTimeout(() => handleVirtualRelease(code), 60);
      }
    } else if (selectedGame === 'tetris') {
      handleVirtualPress('ArrowUp');
      setTimeout(() => handleVirtualRelease('ArrowUp'), 60);
    }
  };

  
  const scoreMultiplier = difficulty === 'expert' ? 1.5 : difficulty === 'detente' ? 0.8 : 1.0;
  const handleScoreAdd = (pts: number) => {
    const scaled = Math.max(1, Math.round(pts * scoreMultiplier));
    scoreRef.current += scaled;
    if (scoreSpanRef.current) {
      scoreSpanRef.current.textContent = String(scoreRef.current);
    }
    saveHighScore(scoreRef.current);
  };

  const handleGameOver = () => {
    setScore(scoreRef.current);
    setHighScore(highScoreRef.current);
    setIsGameOver(true);
    soundFx.playError();
  };

  
  
  const clearKey = (code: string) => {
    keyboardKeysRef.current.delete(code);
    gamepadKeysRef.current.delete(code);
    keysDownRef.current.delete(code);
  };

  const isKeyDown = (codes: readonly string[]) => {
    const kb = keyboardKeysRef.current;
    const gp = gamepadKeysRef.current;
    const kd = keysDownRef.current;
    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (kb.has(c) || gp.has(c) || kd.has(c) || virtualRepeatTimersRef.current.has(c)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative overflow-visible w-full max-w-xl">
        <SylvestreIvyFrame density="medium" />
        <div className="relative w-full max-h-[94vh] overflow-y-auto bg-[#06241b] border-2 border-[#78350f] rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col items-center">
          {/* Modal Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#1e293b] mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                La Salle d'Arcade
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-bold uppercase tracking-wider">
                  Hibouxe
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                8 mini-jeux rétro jouables directement dans le navigateur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGamepadConnected && (
              <div
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold animate-in fade-in"
                title={`Manette connectée : ${gamepadName}`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="max-w-[130px] truncate">{gamepadName}</span>
              </div>
            )}

            <button
              onClick={() => {
                const next = soundFx.toggleSound();
                setSoundMuted(!next);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title={soundMuted ? 'Activer le son' : 'Couper le son'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                stopAllLoops();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Compact Game Selector with Burger Menu */}
        <div className="w-full max-w-[380px] flex items-center justify-between gap-1.5 mb-2.5">
          {/* Bouton Précédent */}
          <button
            type="button"
            onClick={selectPrevGame}
            className="flex items-center justify-center p-2 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition active:scale-95 cursor-pointer shrink-0"
            title={isGamepadConnected ? `Borne précédente (${labels.lb})` : 'Borne précédente'}
          >
            {isGamepadConnected ? (
              <span className="text-[10px] font-mono font-bold px-1">{labels.lb}</span>
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Bouton Burger Central : Borne Actuelle & Dérouleur */}
          <button
            type="button"
            onClick={toggleGameMenu}
            className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-[0.99] ${
              isGameMenuOpen
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-[#0b0f19] border-[#1e293b] text-slate-200 hover:border-amber-500/40 hover:text-white'
            }`}
            title="Changer de borne d'arcade (Menu des 8 jeux)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                <Menu className="w-3.5 h-3.5" />
              </span>
              <span className="text-base shrink-0">{currentGameMeta.icon}</span>
              <span className="font-black text-sm text-white truncate">{currentGameMeta.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold shrink-0 ml-1">
              <span className="hidden xs:inline sm:inline">Changer</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGameMenuOpen ? 'rotate-180 text-amber-300' : ''}`} />
            </div>
          </button>

          {/* Bouton Suivant */}
          <button
            type="button"
            onClick={selectNextGame}
            className="flex items-center justify-center p-2 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition active:scale-95 cursor-pointer shrink-0"
            title={isGamepadConnected ? `Borne suivante (${labels.rb})` : 'Borne suivante'}
          >
            {isGamepadConnected ? (
              <span className="text-[10px] font-mono font-bold px-1">{labels.rb}</span>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Burger Drawer Modal Overlay */}
        {isGameMenuOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setIsGameMenuOpen(false)}
          >
            <div
              className="relative w-full max-w-md bg-[#06241b] border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <SylvestreIvyFrame density="delicate" />

              {/* Menu Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#0d543e] mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Menu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      Bornes d'Arcade
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold uppercase">
                        8 Jeux
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Sélectionnez une borne pour lancer la partie
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGameMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Fermer le menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cabinets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-500/30">
                {ARCADE_GAMES.map((game) => {
                  const active = selectedGame === game.id;
                  const bestScore = getGameHighScore(game.id);
                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => selectGame(game.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                        active
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.01]'
                          : 'bg-[#031711] border-[#0d543e] text-slate-200 hover:border-amber-500/50 hover:bg-[#093a2b]'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                          active
                            ? 'bg-slate-950/20'
                            : 'bg-[#06241b] border border-[#0d543e] group-hover:border-amber-500/40'
                        }`}
                      >
                        {game.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-black text-xs truncate ${
                              active ? 'text-slate-950' : 'text-white group-hover:text-amber-300'
                            }`}
                          >
                            {game.name}
                          </span>
                          {active && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-950 text-amber-400 shrink-0">
                              En cours
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            active ? 'text-slate-900/80 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {ARCADE_SUBTITLES[game.id]}
                        </div>
                        <div
                          className={`text-[10px] font-mono mt-0.5 flex items-center gap-1 ${
                            active ? 'text-slate-950 font-bold' : 'text-amber-400'
                          }`}
                        >
                          <Trophy className="w-2.5 h-2.5" />
                          <span>Record : {bestScore > 0 ? bestScore.toLocaleString() : '—'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Score & Controls Bar */}
        <div className="w-full max-w-[380px] flex items-center justify-between px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl mb-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <span>Score :</span>
            <span ref={scoreSpanRef} className="font-mono text-amber-400 text-sm font-black">{score}</span>
          </div>

          <button
            onClick={() => onOpenLeaderboard?.(selectedGame)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition cursor-pointer"
            title="Voir le classement mondial de ce jeu"
          >
            <Trophy className={`w-3.5 h-3.5 ${selectedGame === 'vectrex' && isVectrexPhosphor ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>Record :</span>
            <span ref={highScoreSpanRef} className={`font-mono font-bold ${selectedGame === 'vectrex' && isVectrexPhosphor ? 'text-emerald-400' : 'text-white'}`}>
              {selectedGame === 'vectrex' && isVectrexPhosphor ? 'HIB - 999 990' : highScore}
            </span>
          </button>

          <button
            onClick={restartCurrentGame}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition cursor-pointer"
            title="Recommencer la partie"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Rejouer</span>
          </button>
        </div>

        {/* Difficulté Arcade (Détente / Normal / Expert) */}
        <div className="w-full max-w-[380px] flex items-center justify-between px-1 mb-2.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <span>Difficulté :</span>
          </div>
          <div className="inline-flex p-0.5 rounded-xl bg-[#0b0f19] border border-[#1e293b]">
            <button
              type="button"
              onClick={() => handleDifficultyChange('detente')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                difficulty === 'detente'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              title="Mode Détente (vitesse réduite, vies supplémentaires, score x0.8)"
            >
              <span>🌿</span>
              <span>Détente</span>
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange('normal')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                difficulty === 'normal'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              title="Mode Normal (arcade rétro classique, score x1.0)"
            >
              <span>⚡</span>
              <span>Normal</span>
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange('expert')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                difficulty === 'expert'
                  ? 'bg-red-500/25 text-red-300 border border-red-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              title="Mode Expert (vitesse effrénée, vies réduites, score x1.5)"
            >
              <span>💀</span>
              <span>Expert</span>
            </button>
          </div>
        </div>

        {/* Toggle Tube Vert Phosphore (Vectrex 1982) - Uniquement si débloqué */}
        {selectedGame === 'vectrex' && hasVectrexUnlocked && (
          <div className="w-full max-w-[320px] sm:max-w-[380px] flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] mb-2 text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tube Cathodique 1982 :</span>
            </span>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsVectrexPhosphor((prev) => {
                  const next = !prev;
                  try {
                    localStorage.setItem('hoot_vectrex_phosphor', String(next));
                  } catch {
                    // Ignore
                  }
                  return next;
                });
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isVectrexPhosphor
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Activer ou désactiver l'effet Tube Vert Phosphore du Vectrex"
            >
              <span className={`w-2 h-2 rounded-full ${isVectrexPhosphor ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isVectrexPhosphor ? 'Tube Vert : Actif' : 'Vecteur Blanc'}</span>
            </button>
          </div>
        )}

        {/* Canvas Game Area with Direct Touch / Swipe Support */}
        <div className="relative w-full max-w-[320px] sm:max-w-[380px] aspect-square rounded-2xl overflow-hidden border-2 border-[#1e293b] bg-[#060f09] shadow-2xl flex items-center justify-center">
          
          {selectedGame === 'snake' && <ArcadeSnake key={gameKey} difficulty={difficulty} onScoreAdd={handleScoreAdd} onGameOver={handleGameOver} isKeyDown={isKeyDown} touchPosRef={touchPosRef} soundMuted={soundMuted} onCanvasTouchStart={handleCanvasTouchStart} onCanvasTouchMove={handleCanvasTouchMove} onCanvasTouchEnd={handleCanvasTouchEnd} />}
          {selectedGame === 'pong' && <ArcadePong key={gameKey} difficulty={difficulty} onScoreAdd={handleScoreAdd} onGameOver={handleGameOver} isKeyDown={isKeyDown} touchPosRef={touchPosRef} soundMuted={soundMuted} onCanvasTouchStart={handleCanvasTouchStart} onCanvasTouchMove={handleCanvasTouchMove} onCanvasTouchEnd={handleCanvasTouchEnd} />}
          {selectedGame === 'breakout' && <ArcadeBreakout key={gameKey} difficulty={difficulty} onScoreAdd={handleScoreAdd} onGameOver={handleGameOver} isKeyDown={isKeyDown} touchPosRef={touchPosRef} soundMuted={soundMuted} onCanvasTouchStart={handleCanvasTouchStart} onCanvasTouchMove={handleCanvasTouchMove} onCanvasTouchEnd={handleCanvasTouchEnd} />}
          {selectedGame === 'flappy' && <ArcadeFlappy key={gameKey} difficulty={difficulty} onScoreAdd={handleScoreAdd} onGameOver={handleGameOver} isKeyDown={isKeyDown} touchPosRef={touchPosRef} soundMuted={soundMuted} onCanvasTouchStart={handleCanvasTouchStart} onCanvasTouchMove={handleCanvasTouchMove} onCanvasTouchEnd={handleCanvasTouchEnd} />}
          {selectedGame === 'invaders' && <ArcadeInvaders key={gameKey} difficulty={difficulty} onScoreAdd={handleScoreAdd} onGameOver={handleGameOver} isKeyDown={isKeyDown} touchPosRef={touchPosRef} soundMuted={soundMuted} onCanvasTouchStart={handleCanvasTouchStart} onCanvasTouchMove={handleCanvasTouchMove} onCanvasTouchEnd={handleCanvasTouchEnd} />}
          {selectedGame === 'run' && <ArcadeRun key={gameKey} clearKey={clearKey} difficulty={difficulty} onScoreAdd={handleScoreAdd} onGameOver={handleGameOver} isKeyDown={isKeyDown} touchPosRef={touchPosRef} soundMuted={soundMuted} onCanvasTouchStart={handleCanvasTouchStart} onCanvasTouchMove={handleCanvasTouchMove} onCanvasTouchEnd={handleCanvasTouchEnd} />}
          {selectedGame === 'tetris' && <ArcadeTetris key={gameKey} difficulty={difficulty} onScoreAdd={handleScoreAdd} onGameOver={handleGameOver} isKeyDown={isKeyDown} touchPosRef={touchPosRef} soundMuted={soundMuted} onCanvasTouchStart={handleCanvasTouchStart} onCanvasTouchMove={handleCanvasTouchMove} onCanvasTouchEnd={handleCanvasTouchEnd} />}
          {selectedGame === 'vectrex' && <ArcadeVectrex key={gameKey} difficulty={difficulty} isVectrexPhosphor={isVectrexPhosphor} isVectrexPhosphorRef={isVectrexPhosphorRef} setIsVectrexPhosphor={setIsVectrexPhosphor} setIsVectrexUnlocked={setIsVectrexUnlocked} unlockAchievement={unlockAchievement} highScore={highScoreRef.current} clearKey={clearKey} onScoreAdd={handleScoreAdd} onGameOver={handleGameOver} isKeyDown={isKeyDown} touchPosRef={touchPosRef} soundMuted={soundMuted} onCanvasTouchStart={handleCanvasTouchStart} onCanvasTouchMove={handleCanvasTouchMove} onCanvasTouchEnd={handleCanvasTouchEnd} />}


          {isGameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mb-2">
                <Skull className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white mb-1 tracking-wider uppercase">
                Partie Terminée
              </h3>
              <p className="text-sm text-slate-300 mb-2">
                Score final : <span className="font-black text-amber-400 font-mono text-base">{score}</span>
              </p>

              <div className="flex items-center justify-center gap-1 my-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mr-1">Difficulté :</span>
                <div className="inline-flex p-0.5 rounded-lg bg-black/60 border border-slate-700">
                  <button
                    onClick={() => handleDifficultyChange('detente')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${difficulty === 'detente' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    🌿 Détente
                  </button>
                  <button
                    onClick={() => handleDifficultyChange('normal')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${difficulty === 'normal' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    ⚡ Normal
                  </button>
                  <button
                    onClick={() => handleDifficultyChange('expert')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${difficulty === 'expert' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    💀 Expert
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-[220px] mt-1">
                <button
                  onClick={restartCurrentGame}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Rejouer Immédiatement
                </button>
                {onOpenLeaderboard && (
                  <button
                    onClick={() => onOpenLeaderboard(selectedGame)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition shadow cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Classement en Ligne
                  </button>
                )}
                {isGamepadConnected && (
                  <p className="text-[11px] text-amber-300/90 font-bold mt-1">
                    Touche <span className="underline">{labels.actionA}</span> ou <span className="underline">{labels.start}</span> pour rejouer
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-[11px] text-slate-400 text-center mt-2.5 max-w-[420px] leading-relaxed">
          <Sparkles className="w-3 h-3 text-amber-400 inline mr-1" />
          {currentGameMeta.instructions}
        </p>

        {/* Adaptive Controls: Gamepad HUD when connected, Touch/Mouse otherwise */}
        <div className="w-full max-w-[420px] select-none">
          {isGamepadConnected ? (
            <div className="mt-3 pt-3 border-t border-[#1e293b] flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-emerald-500/30 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Gamepad2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{gamepadName}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Prête pour jouer
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="p-2 rounded-lg bg-[#06241b] border border-[#0d543e] flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold text-[10px]">
                    D-Pad / Stick
                  </span>
                  <span className="text-slate-300 truncate">
                    {selectedGame === 'pong'
                      ? 'Haut / Bas'
                      : selectedGame === 'breakout' || selectedGame === 'invaders'
                      ? 'Gauche / Droite'
                      : selectedGame === 'vectrex'
                      ? 'Pivoter / Propulser'
                      : selectedGame === 'run'
                      ? 'Haut (Saut) / Bas (Glisse)'
                      : 'Déplacement'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#06241b] border border-[#0d543e] flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-bold text-[10px]">
                    {labels.actionA}
                  </span>
                  <span className="text-slate-300 truncate">
                    {selectedGame === 'flappy'
                      ? 'Battre des ailes'
                      : selectedGame === 'run'
                      ? 'Sauter'
                      : selectedGame === 'breakout'
                      ? 'Lancer bille'
                      : selectedGame === 'invaders' || selectedGame === 'vectrex'
                      ? 'Tirer'
                      : selectedGame === 'tetris'
                      ? 'Tourner'
                      : 'Action'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#06241b] border border-[#0d543e] flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-bold text-[10px]">
                    {labels.actionB} / {labels.actionX}
                  </span>
                  <span className="text-slate-300 truncate">
                    {selectedGame === 'vectrex'
                      ? 'Hyperdrive'
                      : selectedGame === 'tetris'
                      ? 'Tourner la pièce'
                      : selectedGame === 'run'
                      ? 'Glisser'
                      : 'Action 2'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#06241b] border border-[#0d543e] flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold text-[10px]">
                    {labels.lb} / {labels.rb}
                  </span>
                  <span className="text-slate-300 truncate">Changer de jeu</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* FLAPPY: Single Large Action Bar */}
              {selectedGame === 'flappy' && (
                <div className="flex flex-col items-center gap-2 mt-3 pt-3 border-t border-[#1e293b] w-full">
                  <button
                    {...bindVirtualTouch('Space')}
                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-2 transition-transform"
                  >
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>BATTRE DES AILES</span>
                    <span className="opacity-80 text-[10px] sm:text-xs">(ou toucher l'écran)</span>
                  </button>
                </div>
              )}

              {/* RUN (COURSE SYLVESTRE): Dual Large Action Buttons (SAUTER & GLISSER) */}
              {selectedGame === 'run' && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 pt-3 border-t border-[#1e293b] w-full">
                  <button
                    {...bindVirtualTouch('Space')}
                    className="py-4 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-2 transition-transform"
                  >
                    <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>SAUTER</span>
                  </button>
                  <button
                    {...bindVirtualTouch('ArrowDown')}
                    className="py-4 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-2 transition-transform"
                  >
                    <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>GLISSER</span>
                  </button>
                </div>
              )}

              {/* PONG: Vertical Controls + Touch Hint */}
              {selectedGame === 'pong' && (
                <div className="flex items-center justify-between gap-3 sm:gap-4 mt-3 pt-3 border-t border-[#1e293b] w-full">
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    <button
                      {...bindVirtualTouch('ArrowUp')}
                      className="w-16 h-13 sm:w-20 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Monter"
                    >
                      <ArrowUp className="w-6 h-6" />
                    </button>
                    <button
                      {...bindVirtualTouch('ArrowDown')}
                      className="w-16 h-13 sm:w-20 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Descendre"
                    >
                      <ArrowDown className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex-1 text-center p-3 rounded-2xl bg-[#0b0f19] border border-slate-800 text-[11px] sm:text-xs text-slate-300 leading-snug">
                    <MousePointer className="w-4 h-4 text-amber-400 inline mr-1" />
                    <strong>Contrôle tactile direct :</strong> glissez votre doigt verticalement sur l'écran pour bouger la raquette !
                  </div>
                </div>
              )}

              {/* BREAKOUT: Left / Right + Launch Ball */}
              {selectedGame === 'breakout' && (
                <div className="flex items-center justify-between gap-3 sm:gap-4 mt-3 pt-3 border-t border-[#1e293b] w-full">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                      {...bindVirtualTouch('ArrowLeft')}
                      className="w-15 h-13 sm:w-18 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Gauche"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button
                      {...bindVirtualTouch('ArrowRight')}
                      className="w-15 h-13 sm:w-18 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Droite"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                  <button
                    {...bindVirtualTouch('Space')}
                    className="flex-1 h-13 sm:h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-2 transition-transform"
                  >
                    Lancer la balle
                  </button>
                </div>
              )}

              {/* INVADERS: Left / Right + Shoot */}
              {selectedGame === 'invaders' && (
                <div className="flex items-center justify-between gap-3 sm:gap-4 mt-3 pt-3 border-t border-[#1e293b] w-full">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                      {...bindVirtualTouch('ArrowLeft')}
                      className="w-15 h-13 sm:w-18 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Gauche"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button
                      {...bindVirtualTouch('ArrowRight')}
                      className="w-15 h-13 sm:w-18 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Droite"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                  <button
                    {...bindVirtualTouch('Space')}
                    className="flex-1 h-13 sm:h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-2 transition-transform"
                  >
                    <Crosshair className="w-4 h-4 fill-current" />
                    Tirer
                  </button>
                </div>
              )}

              {/* SNAKE, TETRIS: 4-Way D-Pad + Action */}
              {['snake', 'tetris'].includes(selectedGame) && (
                <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 pt-3 border-t border-[#1e293b] w-full">
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    <div />
                    <button
                      {...bindVirtualTouch('ArrowUp')}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Haut / Rotation"
                    >
                      <ArrowUp className="w-6 h-6" />
                    </button>
                    <div />
                    <button
                      {...bindVirtualTouch('ArrowLeft')}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Gauche"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button
                      {...bindVirtualTouch('ArrowDown')}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Bas"
                    >
                      <ArrowDown className="w-6 h-6" />
                    </button>
                    <button
                      {...bindVirtualTouch('ArrowRight')}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center active:scale-95 active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-100 shadow-md transition-transform"
                      title="Droite"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>

                  <button
                    {...bindVirtualTouch('Space')}
                    className="px-5 sm:px-7 min-w-[96px] sm:min-w-[120px] h-[112px] sm:h-[122px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase shadow-lg shadow-amber-500/20 active:scale-95 touch-none select-none cursor-pointer flex flex-col items-center justify-center gap-1.5 leading-tight transition-transform"
                  >
                    <span>ACTION</span>
                    <span className="text-[10px] sm:text-xs font-semibold opacity-75">(Espace)</span>
                  </button>
                </div>
              )}

              {/* VECTREX MINE STORM: Steering D-Pad + Thrust + Fire + Hyperdrive */}
              {selectedGame === 'vectrex' && (
                <div className="flex items-center justify-between gap-3 sm:gap-4 mt-3 pt-3 border-t border-[#1e293b] w-full">
                  {/* Steering D-Pad */}
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <button
                      {...bindVirtualTouch('ArrowLeft')}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-cyan-400 flex items-center justify-center active:scale-95 active:bg-cyan-500 active:text-slate-950 touch-none select-none text-cyan-300 shadow-md transition-transform"
                      title="Pivoter à Gauche"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button
                      {...bindVirtualTouch('ArrowUp')}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/90 border border-cyan-500/50 hover:border-cyan-400 flex items-center justify-center active:scale-95 active:bg-cyan-500 active:text-slate-950 touch-none select-none text-cyan-300 shadow-md transition-transform"
                      title="Propulsion (Gaz)"
                    >
                      <ArrowUp className="w-6 h-6" />
                    </button>
                    <button
                      {...bindVirtualTouch('ArrowRight')}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-cyan-400 flex items-center justify-center active:scale-95 active:bg-cyan-500 active:text-slate-950 touch-none select-none text-cyan-300 shadow-md transition-transform"
                      title="Pivoter à Droite"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Action Buttons: Fire & Escape / Hyperdrive */}
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-1">
                    <button
                      {...bindVirtualTouch('KeyE')}
                      className="flex-1 h-13 sm:h-14 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-cyan-500/50 text-cyan-300 font-black text-[11px] sm:text-xs uppercase tracking-wider shadow active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-1.5 transition-transform"
                      title="Fuite / Hyperdrive (Touche E)"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Fuite (E)</span>
                    </button>
                    <button
                      {...bindVirtualTouch('Space')}
                      className="flex-1 h-13 sm:h-14 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-1.5 transition-transform"
                      title="Tirer (Espace)"
                    >
                      <Crosshair className="w-4 h-4 fill-current" />
                      <span>Tirer</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
