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
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { ARCADE_GAMES, type ArcadeGameId, type ArcadeGameMeta } from '../../data/arcadeGames';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { useGamepadStatus, useGamepadArcadeLoop } from '../../utils/gamepad';
import { useAchievements } from '../../context/useAchievements';
export type { ArcadeGameId, ArcadeGameMeta };
export type ArcadeDifficulty = 'detente' | 'normal' | 'expert';

// Static constant key arrays for zero-allocation key testing in 60fps loops
const KEY_CODES_UP = ['ArrowUp', 'KeyW', 'KeyZ'] as const;
const KEY_CODES_DOWN = ['ArrowDown', 'KeyS'] as const;
const KEY_CODES_LEFT = ['ArrowLeft', 'KeyA', 'KeyQ'] as const;
const KEY_CODES_RIGHT = ['ArrowRight', 'KeyD'] as const;
const KEY_CODES_JUMP = ['Space', 'ArrowUp', 'KeyW', 'KeyZ'] as const;
const KEY_CODES_SHOOT = ['Space'] as const;
const KEY_CODES_BREAKOUT_FIRE = ['Space', 'ArrowUp'] as const;
const KEY_CODES_START_ALL = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyS',
  'KeyA',
  'KeyD',
  'KeyZ',
  'KeyQ',
  'Space',
  'Enter',
] as const;

type BreakoutPowerUpType = 'multiball' | 'wide' | 'laser' | 'slow' | 'life' | 'fireball';

const BREAKOUT_CAPSULE_CONFIG: Record<BreakoutPowerUpType, { bg: string; text: string; label: string }> = {
  multiball: { bg: '#3b82f6', text: '#ffffff', label: 'M' },
  wide: { bg: '#10b981', text: '#ffffff', label: 'W' },
  laser: { bg: '#ef4444', text: '#ffffff', label: 'L' },
  slow: { bg: '#eab308', text: '#000000', label: 'S' },
  life: { bg: '#ec4899', text: '#ffffff', label: '♥' },
  fireball: { bg: '#f97316', text: '#ffffff', label: 'F' },
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
  const { unlockAchievement } = useAchievements();
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
  const [isVectrexPhosphor, setIsVectrexPhosphor] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hoot_vectrex_phosphor') === 'true';
    } catch {
      return false;
    }
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);

  // Persistent inputs state (supports holding keys & touch)
  // Isolation stricte entre clavier physique et manette pour éviter tout conflit d'écrasement
  const keysDownRef = useRef<Set<string>>(new Set());
  const keyboardKeysRef = useRef<Set<string>>(new Set());
  const gamepadKeysRef = useRef<Set<string>>(new Set());
  const touchPosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 200, y: 200, active: false });
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 200, y: 200 });
  const scoreRef = useRef<number>(0);
  const highScoreRef = useRef<number>(highScore);

  const selectGame = (gameId: ArcadeGameId) => {
    soundFx.playClick();
    stopAllLoops();
    const saved = localStorage.getItem(`hoot_arcade_hs_${gameId}`);
    const hs = saved ? parseInt(saved, 10) : 0;
    highScoreRef.current = hs;
    scoreRef.current = 0;
    setHighScore(hs);
    setScore(0);
    setIsGameOver(false);
    setSelectedGame(gameId);
  };

  // Sync initialGame if prop changed from outside
  useEffect(() => {
    selectGame(initialGame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGame]);

  const saveHighScore = useCallback((val: number) => {
    if (val > highScoreRef.current) {
      highScoreRef.current = val;
      setHighScore(val);
      localStorage.setItem(`hoot_arcade_hs_${selectedGame}`, String(val));
    }
  }, [selectedGame]);

  const stopAllLoops = () => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  const restartCurrentGame = () => {
    soundFx.playClick();
    stopAllLoops();
    setIsGameOver(false);
    setScore(0);
    scoreRef.current = 0;
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

  // MAIN GAME ENGINE EFFECT
  useEffect(() => {
    if (!isOpen) {
      stopAllLoops();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    stopAllLoops();

    const width = 400;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    const isKeyDown = (codes: readonly string[]) => {
      const kb = keyboardKeysRef.current;
      const gp = gamepadKeysRef.current;
      const kd = keysDownRef.current;
      for (let i = 0; i < codes.length; i++) {
        const c = codes[i];
        if (kb.has(c) || gp.has(c) || kd.has(c)) {
          return true;
        }
      }
      return false;
    };

    const scoreMultiplier = difficulty === 'expert' ? 1.5 : difficulty === 'detente' ? 0.8 : 1.0;
    const addScore = (pts: number) => {
      const scaled = Math.max(1, Math.round(pts * scoreMultiplier));
      scoreRef.current += scaled;
      setScore(scoreRef.current);
      saveHighScore(scoreRef.current);
    };

    const triggerGameOver = () => {
      setIsGameOver(true);
      soundFx.playError();
      stopAllLoops();
    };

    let customCleanup: (() => void) | null = null;

    // High-performance 60 FPS loop runner (immune to 120Hz/144Hz/240Hz screen over-speeding,
    // clamped against background tab lag spikes, and respects tab visibility)
    const startFixedLoop = (isActive: () => boolean, updateAndRender: () => void) => {
      let lastTime = performance.now();
      const targetInterval = 1000 / 60; // 16.666 ms
      let isPausedByVisibility = false;

      const handleVisibilityChange = () => {
        if (document.hidden) {
          isPausedByVisibility = true;
        } else {
          isPausedByVisibility = false;
          lastTime = performance.now();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      const runner = (now: number) => {
        if (!isActive()) return;
        if (isPausedByVisibility || document.hidden) {
          animFrameIdRef.current = requestAnimationFrame(runner);
          return;
        }

        let elapsed = now - lastTime;
        // Clamp huge lag spikes (e.g. background tab or CPU throttle)
        if (elapsed > 120) {
          elapsed = targetInterval;
          lastTime = now;
        }

        if (elapsed >= targetInterval - 1.5) {
          lastTime = now - (elapsed % targetInterval);
          updateAndRender();
        }

        if (isActive()) {
          animFrameIdRef.current = requestAnimationFrame(runner);
        }
      };

      animFrameIdRef.current = requestAnimationFrame(runner);

      const cleanupFn = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };

      if (!customCleanup) {
        customCleanup = cleanupFn;
      } else {
        const prevCleanup = customCleanup;
        customCleanup = () => {
          prevCleanup();
          cleanupFn();
        };
      }
    };

    // ==========================================
    // 1. SNAKE DORÉ
    // ==========================================
    if (selectedGame === 'snake') {
      const gridSize = 20;
      let snake = [
        { x: 10 * gridSize, y: 10 * gridSize },
        { x: 9 * gridSize, y: 10 * gridSize },
        { x: 8 * gridSize, y: 10 * gridSize },
      ];
      let dir = 'RIGHT';
      let nextDir = 'RIGHT';
      let food = { x: 14 * gridSize, y: 10 * gridSize };
      let gameActive = true;
      let started = false;

      const spawnFood = () => {
        const maxX = width / gridSize - 1;
        const maxY = height / gridSize - 1;
        food = {
          x: Math.floor(Math.random() * maxX) * gridSize,
          y: Math.floor(Math.random() * maxY) * gridSize,
        };
      };

      const step = () => {
        if (!gameActive) return;

        if (!started) {
          ctx.fillStyle = '#060f09';
          ctx.fillRect(0, 0, width, height);

          // Food
          ctx.fillStyle = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#f59e0b';
          ctx.beginPath();
          ctx.arc(food.x + 10, food.y + 10, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Snake
          snake.forEach((seg, i) => {
            if (i === 0) {
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(seg.x, seg.y, gridSize, gridSize);
              ctx.fillStyle = '#0b0f19';
              ctx.fillRect(seg.x + 4, seg.y + 4, 4, 4);
              ctx.fillRect(seg.x + 12, seg.y + 4, 4, 4);
            } else {
              ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#059669';
              ctx.fillRect(seg.x + 1, seg.y + 1, gridSize - 2, gridSize - 2);
            }
          });

          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Appuyez sur une direction ou cliquez pour jouer', width / 2, height / 2 + 55);

          if (isKeyDown(KEY_CODES_START_ALL)) {
            started = true;
            soundFx.playClick();
          }
          return;
        }

        // Direction mapping (Arrows + ZQSD / WASD) with zero-allocation keys
        if (isKeyDown(KEY_CODES_UP) && dir !== 'DOWN') nextDir = 'UP';
        if (isKeyDown(KEY_CODES_DOWN) && dir !== 'UP') nextDir = 'DOWN';
        if (isKeyDown(KEY_CODES_LEFT) && dir !== 'RIGHT') nextDir = 'LEFT';
        if (isKeyDown(KEY_CODES_RIGHT) && dir !== 'LEFT') nextDir = 'RIGHT';

        dir = nextDir;

        let headX = snake[0].x;
        let headY = snake[0].y;

        if (dir === 'LEFT') headX -= gridSize;
        if (dir === 'UP') headY -= gridSize;
        if (dir === 'RIGHT') headX += gridSize;
        if (dir === 'DOWN') headY += gridSize;

        // Zero-closure collision detection
        let selfCollision = false;
        for (let i = 0; i < snake.length; i++) {
          if (snake[i].x === headX && snake[i].y === headY) {
            selfCollision = true;
            break;
          }
        }

        if (headX < 0 || headX >= width || headY < 0 || headY >= height || selfCollision) {
          gameActive = false;
          triggerGameOver();
          return;
        }

        // Eat food
        if (headX === food.x && headY === food.y) {
          addScore(10);
          soundFx.playChime();
          spawnFood();
        } else {
          snake.pop();
        }

        snake.unshift({ x: headX, y: headY });

        // Draw
        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Food (Luciole dorée pulsante)
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        ctx.arc(food.x + 10, food.y + 10, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw snake
        snake.forEach((seg, i) => {
          if (i === 0) {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(seg.x, seg.y, gridSize, gridSize);
            // Owl eyes on snake head
            ctx.fillStyle = '#0b0f19';
            ctx.fillRect(seg.x + 4, seg.y + 4, 4, 4);
            ctx.fillRect(seg.x + 12, seg.y + 4, 4, 4);
          } else {
            ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#059669';
            ctx.fillRect(seg.x + 1, seg.y + 1, gridSize - 2, gridSize - 2);
          }
        });
      };

      canvas.onclick = () => {
        if (!started) {
          started = true;
          soundFx.playClick();
        }
      };

      const snakeSpeed = difficulty === 'expert' ? 85 : difficulty === 'detente' ? 145 : 115;
      intervalIdRef.current = window.setInterval(step, snakeSpeed);
    }

    // ==========================================
    // 2. PONG MAGIQUE
    // ==========================================
    else if (selectedGame === 'pong') {
      const padW = 10;
      const padH = 80;
      let leftY = 160;
      let rightY = 160;
      let leftScore = 0;
      let rightScore = 0;
      const baseVx = difficulty === 'expert' ? 5.6 : difficulty === 'detente' ? 3.2 : 4.4;
      const baseVy = difficulty === 'expert' ? 2.8 : difficulty === 'detente' ? 1.8 : 2.2;
      let ball = { x: 200, y: 200, r: 7, vx: baseVx, vy: baseVy };
      let gameActive = true;
      let started = false;

      canvas.onclick = () => {
        if (!started) {
          started = true;
          soundFx.playClick();
        }
      };

      const loop = () => {
        if (!gameActive) return;

        // Player controls (supports direct touch drag or virtual keys)
        if (touchPosRef.current.active) {
          leftY = Math.max(0, Math.min(height - padH, touchPosRef.current.y - padH / 2));
          if (!started) {
            started = true;
            soundFx.playClick();
          }
        } else {
          if (isKeyDown(KEY_CODES_UP) && leftY > 0) leftY -= 5.4;
          if (isKeyDown(KEY_CODES_DOWN) && leftY < height - padH) leftY += 5.4;
        }

        // Launch ball on space or arrow press
        if (!started && isKeyDown(KEY_CODES_START_ALL)) {
          started = true;
          soundFx.playClick();
        }

        if (started) {
          // Adaptive Fair AI: tracks ball with realistic reaction delay and speed
          if (ball.vx > 0) {
            // Ball moving towards AI paddle
            const targetY = ball.y;
            const aiCenter = rightY + padH / 2;
            const diff = targetY - aiCenter;
            const aiSpeedLimit = difficulty === 'expert' ? 4.8 : difficulty === 'detente' ? 3.0 : 3.8;
            const aiSpeedBase = difficulty === 'expert' ? 3.5 : difficulty === 'detente' ? 2.0 : 2.7;
            const aiDeadband = difficulty === 'expert' ? 8 : difficulty === 'detente' ? 18 : 14;
            const aiSpeed = Math.min(aiSpeedLimit, aiSpeedBase + leftScore * 0.12);

            // Deadband margin avoids robotic perfection and allows angled slices to pass
            if (Math.abs(diff) > aiDeadband) {
              if (diff > 0) rightY += aiSpeed;
              else rightY -= aiSpeed;
            }
          } else {
            // Ball moving towards player: drift gently towards center
            const courtCenter = height / 2 - padH / 2;
            if (rightY < courtCenter - 10) rightY += 1.0;
            else if (rightY > courtCenter + 10) rightY -= 1.0;
          }
          rightY = Math.max(0, Math.min(height - padH, rightY));

          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall bounce
          if (ball.y - ball.r <= 0 || ball.y + ball.r >= height) {
            ball.vy *= -1;
            soundFx.playClick();
          }

          // Left paddle bounce
          if (
            ball.x - ball.r <= 25 &&
            ball.x - ball.r >= 10 &&
            ball.y >= leftY &&
            ball.y <= leftY + padH &&
            ball.vx < 0
          ) {
            const delta = (ball.y - (leftY + padH / 2)) / (padH / 2);
            ball.vy = delta * 4.2;
            ball.vx = Math.min(7.2, Math.abs(ball.vx) + 0.18);
            ball.x = 25 + ball.r;
            addScore(10);
            soundFx.playChime();
          }

          // Right AI paddle bounce
          if (
            ball.x + ball.r >= width - 25 &&
            ball.x + ball.r <= width - 10 &&
            ball.y >= rightY &&
            ball.y <= rightY + padH &&
            ball.vx > 0
          ) {
            const delta = (ball.y - (rightY + padH / 2)) / (padH / 2);
            ball.vy = delta * 4.2;
            ball.vx = -Math.min(7.2, Math.abs(ball.vx) + 0.18);
            ball.x = width - 25 - ball.r;
            soundFx.playClick();
          }

          // Scoring
          if (ball.x < 0) {
            rightScore++;
            if (rightScore >= 5) {
              gameActive = false;
              triggerGameOver();
              return;
            }
            ball = { x: 200, y: 200, r: 7, vx: baseVx, vy: (Math.random() - 0.5) * 3.5 };
            started = false;
          } else if (ball.x > width) {
            leftScore++;
            soundFx.playVictory();
            ball = { x: 200, y: 200, r: 7, vx: -baseVx, vy: (Math.random() - 0.5) * 3.5 };
            started = false;
          }
        }

        // Draw
        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Center line
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Paddles
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(15, leftY, padW, padH);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(width - 25, rightY, padW, padH);

        // Ball
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Score
        ctx.font = "bold 24px 'Outfit', sans-serif";
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(String(leftScore), width / 2 - 45, 40);
        ctx.fillStyle = '#10b981';
        ctx.fillText(String(rightScore), width / 2 + 30, 40);

        if (!started) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Appuyez sur ESPACE ou Clic pour engager', width / 2, height / 2 + 50);
          ctx.textAlign = 'left';
        }
      };

      startFixedLoop(() => gameActive, loop);
    }

    // ==========================================
    // 3. CASSE-BRIQUES
    // ==========================================
    // ==========================================
    // 3. CASSE-BRIQUES (MULTI-STAGES & POWER-UPS)
    // ==========================================
    else if (selectedGame === 'breakout') {
      type PowerUpType = 'multiball' | 'wide' | 'laser' | 'slow' | 'life' | 'fireball';

      interface BreakoutBrick {
        x: number;
        y: number;
        w: number;
        h: number;
        color: string;
        hp: number;
        maxHp: number;
        powerup: PowerUpType | null;
        active: boolean;
      }

      interface BreakoutBall {
        x: number;
        y: number;
        r: number;
        vx: number;
        vy: number;
      }

      interface BreakoutPowerUp {
        x: number;
        y: number;
        w: number;
        h: number;
        type: PowerUpType;
        vy: number;
      }

      interface BreakoutLaser {
        x: number;
        y: number;
        vy: number;
      }

      interface BreakoutParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        color: string;
        life: number;
        maxLife: number;
      }

      const basePadW = difficulty === 'expert' ? 65 : difficulty === 'detente' ? 95 : 80;
      const padH = 10;
      let padX = width / 2 - basePadW / 2;
      const baseBallSpeedX = difficulty === 'expert' ? 3.8 : difficulty === 'detente' ? 2.8 : 3.2;
      const baseBallSpeedY = difficulty === 'expert' ? -4.8 : difficulty === 'detente' ? -3.4 : -4.0;

      let started = false;
      let gameActive = true;
      let lives = difficulty === 'expert' ? 2 : difficulty === 'detente' ? 4 : 3;
      let stageIndex = 0;
      let stageClearFrames = 0;

      let balls: BreakoutBall[] = [];
      let powerups: BreakoutPowerUp[] = [];
      let lasers: BreakoutLaser[] = [];
      let particles: BreakoutParticle[] = [];

      // Power-up active timers (in frames at 60fps)
      let wideTimer = 0;
      let laserTimer = 0;
      let laserCooldown = 0;
      let slowTimer = 0;
      let fireTimer = 0;

      const STAGE_NAMES = [
        'Le Bosquet Sylvestre',
        'Les Pyramides Jumelles',
        'Le Vol du Grand Duc',
        'Les Remparts Antiques',
        'Le Trône Astral',
      ];

      const STAGE_LAYOUTS: number[][][] = [
        // Stage 1: Classic wall (8 cols x 5 rows)
        [
          [1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 3, 1, 1, 3, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1],
          [1, 3, 1, 1, 1, 1, 3, 1],
          [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        // Stage 2: Twin Pyramids (8 cols x 5 rows)
        [
          [0, 1, 0, 0, 0, 0, 1, 0],
          [1, 2, 1, 0, 0, 1, 2, 1],
          [1, 3, 2, 1, 1, 2, 3, 1],
          [1, 1, 3, 2, 2, 3, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        // Stage 3: Owl Silhouette & Crest (8 cols x 5 rows)
        [
          [1, 0, 0, 2, 2, 0, 0, 1],
          [1, 1, 3, 2, 2, 3, 1, 1],
          [0, 1, 1, 2, 2, 1, 1, 0],
          [0, 0, 1, 3, 3, 1, 0, 0],
          [0, 0, 0, 1, 1, 0, 0, 0],
        ],
        // Stage 4: Fortress Battlements (8 cols x 6 rows)
        [
          [2, 0, 2, 0, 0, 2, 0, 2],
          [2, 1, 2, 1, 1, 2, 1, 2],
          [1, 3, 1, 2, 2, 1, 3, 1],
          [1, 1, 1, 3, 3, 1, 1, 1],
          [2, 1, 2, 1, 1, 2, 1, 2],
          [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        // Stage 5: Astral Citadel (8 cols x 6 rows)
        [
          [2, 2, 3, 2, 2, 3, 2, 2],
          [2, 1, 2, 1, 1, 2, 1, 2],
          [3, 2, 2, 2, 2, 2, 2, 3],
          [1, 3, 1, 2, 2, 1, 3, 1],
          [2, 1, 2, 3, 3, 2, 1, 2],
          [0, 2, 1, 1, 1, 1, 2, 0],
        ],
      ];

      const STAGE_PALETTES = [
        ['#10b981', '#059669', '#f59e0b', '#d97706'],
        ['#06b6d4', '#0284c7', '#8b5cf6', '#6d28d9'],
        ['#eab308', '#ca8a04', '#ef4444', '#dc2626'],
        ['#38bdf8', '#0284c7', '#10b981', '#059669'],
        ['#a855f7', '#9333ea', '#ec4899', '#db2777'],
      ];

      const POWER_UP_TYPES: PowerUpType[] = ['multiball', 'wide', 'laser', 'slow', 'life', 'fireball'];

      let bricks: BreakoutBrick[] = [];

      const spawnBall = (onPaddle = true): BreakoutBall => {
        const curPadW = wideTimer > 0 ? basePadW * 1.4 : basePadW;
        return {
          x: onPaddle ? padX + curPadW / 2 : width / 2,
          y: onPaddle ? height - 35 : height / 2,
          r: 5.5,
          vx: baseBallSpeedX * (Math.random() > 0.5 ? 1 : -1),
          vy: baseBallSpeedY,
        };
      };

      const loadStage = (index: number) => {
        const stageMod = index % STAGE_LAYOUTS.length;
        const layout = STAGE_LAYOUTS[stageMod];
        const palette = STAGE_PALETTES[stageMod];
        const cols = layout[0].length;
        const rows = layout.length;

        const bW = 42;
        const bH = 15;
        const padding = 6;
        const totalW = cols * bW + (cols - 1) * padding;
        const offLeft = Math.floor((width - totalW) / 2);
        const offTop = 38;

        bricks = [];
        powerups = [];
        lasers = [];
        particles = [];
        laserTimer = 0;
        wideTimer = 0;
        slowTimer = 0;
        fireTimer = 0;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const tile = layout[r][c];
            if (tile === 0) continue;

            const isReinforced = tile === 2;
            const isGuaranteedPowerup = tile === 3;
            let assignedPowerup: PowerUpType | null = null;

            if (isGuaranteedPowerup) {
              assignedPowerup = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
            } else if (Math.random() < 0.15) {
              assignedPowerup = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
            }

            const colorIndex = (r + c) % palette.length;
            const color = isReinforced ? '#cbd5e1' : palette[colorIndex];

            bricks.push({
              x: offLeft + c * (bW + padding),
              y: offTop + r * (bH + padding),
              w: bW,
              h: bH,
              color,
              hp: isReinforced ? 2 : 1,
              maxHp: isReinforced ? 2 : 1,
              powerup: assignedPowerup,
              active: true,
            });
          }
        }

        balls = [spawnBall(true)];
        started = false;
      };

      // Load initial stage
      loadStage(stageIndex);

      const spawnParticles = (x: number, y: number, color: string, count = 7) => {
        if (particles.length > 50) return;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.0 + Math.random() * 2.6;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color,
            life: 16,
            maxLife: 16,
          });
        }
      };

      const fireLaser = () => {
        if (laserCooldown > 0 || laserTimer <= 0) return;
        const curPadW = wideTimer > 0 ? basePadW * 1.4 : basePadW;
        lasers.push({ x: padX + 5, y: height - 28, vy: -7.2 });
        lasers.push({ x: padX + curPadW - 5, y: height - 28, vy: -7.2 });
        laserCooldown = 14;
        soundFx.playClick();
      };

      canvas.onclick = () => {
        if (!started) {
          started = true;
          soundFx.playClick();
        } else if (laserTimer > 0) {
          fireLaser();
        }
      };

      const loop = () => {
        if (!gameActive) return;

        // Timers
        if (wideTimer > 0) wideTimer--;
        if (laserTimer > 0) laserTimer--;
        if (laserCooldown > 0) laserCooldown--;
        if (slowTimer > 0) slowTimer--;
        if (fireTimer > 0) fireTimer--;
        if (stageClearFrames > 0) stageClearFrames--;

        const curPadW = wideTimer > 0 ? basePadW * 1.4 : basePadW;

        // Paddle Movement with zero-allocation keys
        if (touchPosRef.current.active) {
          padX = Math.max(0, Math.min(width - curPadW, touchPosRef.current.x - curPadW / 2));
        } else {
          if (isKeyDown(KEY_CODES_LEFT) && padX > 0) padX -= 5.6;
          if (isKeyDown(KEY_CODES_RIGHT) && padX < width - curPadW) padX += 5.6;
        }

        // Space / Up to launch or fire laser
        if (isKeyDown(KEY_CODES_BREAKOUT_FIRE)) {
          if (!started) {
            started = true;
            soundFx.playClick();
          } else if (laserTimer > 0) {
            fireLaser();
          }
        }

        if (!started) {
          if (balls.length > 0) {
            balls[0].x = padX + curPadW / 2;
            balls[0].y = height - 35;
          }
        } else {
          // Ball Physics & Bounces
          const speedFactor = slowTimer > 0 ? 0.65 : 1.0;

          for (let bIdx = balls.length - 1; bIdx >= 0; bIdx--) {
            const ball = balls[bIdx];
            ball.x += ball.vx * speedFactor;
            ball.y += ball.vy * speedFactor;

            // Wall bounce
            if (ball.x - ball.r <= 0) {
              ball.x = ball.r;
              ball.vx = Math.abs(ball.vx);
              soundFx.playClick();
            } else if (ball.x + ball.r >= width) {
              ball.x = width - ball.r;
              ball.vx = -Math.abs(ball.vx);
              soundFx.playClick();
            }

            if (ball.y - ball.r <= 24) {
              ball.y = 24 + ball.r;
              ball.vy = Math.abs(ball.vy);
              soundFx.playClick();
            } else if (ball.y - ball.r > height + 10) {
              // Ball lost
              balls.splice(bIdx, 1);
              continue;
            }

            // Paddle bounce
            if (
              ball.y + ball.r >= height - 25 &&
              ball.y - ball.r <= height - 15 &&
              ball.x >= padX - 4 &&
              ball.x <= padX + curPadW + 4 &&
              ball.vy > 0
            ) {
              ball.vy = -Math.abs(ball.vy);
              const hitRatio = (ball.x - (padX + curPadW / 2)) / (curPadW / 2);
              ball.vx = hitRatio * 4.6;
              soundFx.playClick();
            }

            // Brick collisions
            for (let i = 0; i < bricks.length; i++) {
              const b = bricks[i];
              if (!b.active) continue;

              if (
                ball.x + ball.r > b.x &&
                ball.x - ball.r < b.x + b.w &&
                ball.y + ball.r > b.y &&
                ball.y - ball.r < b.y + b.h
              ) {
                // Fireball pierces through bricks without bouncing
                if (fireTimer <= 0) {
                  // Standard bounce
                  const prevX = ball.x - ball.vx * speedFactor;
                  if (prevX <= b.x || prevX >= b.x + b.w) {
                    ball.vx *= -1;
                  } else {
                    ball.vy *= -1;
                  }
                }

                b.hp--;
                if (b.hp <= 0) {
                  b.active = false;
                  addScore(b.maxHp > 1 ? 25 : 10);
                  spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.color, 8);
                  soundFx.playChime();

                  // Spawn powerup if brick had one
                  if (b.powerup) {
                    powerups.push({
                      x: b.x + b.w / 2 - 11,
                      y: b.y + b.h / 2,
                      w: 22,
                      h: 12,
                      type: b.powerup,
                      vy: 1.8,
                    });
                  }
                } else {
                  // Reinforced brick cracked
                  b.color = '#94a3b8';
                  spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#f8fafc', 4);
                  soundFx.playClick();
                }
                break;
              }
            }
          }

          // Check if all balls were lost
          if (balls.length === 0) {
            lives--;
            if (lives <= 0) {
              gameActive = false;
              triggerGameOver();
              return;
            } else {
              soundFx.playError();
              wideTimer = 0;
              laserTimer = 0;
              slowTimer = 0;
              fireTimer = 0;
              powerups = [];
              balls = [spawnBall(true)];
              started = false;
            }
          }
        }

        // Lasers update
        for (let lIdx = lasers.length - 1; lIdx >= 0; lIdx--) {
          const l = lasers[lIdx];
          l.y += l.vy;

          let hitBrick = false;
          for (let i = 0; i < bricks.length; i++) {
            const b = bricks[i];
            if (!b.active) continue;

            if (l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
              b.hp--;
              hitBrick = true;
              if (b.hp <= 0) {
                b.active = false;
                addScore(b.maxHp > 1 ? 25 : 10);
                spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.color, 8);
                soundFx.playChime();
                if (b.powerup) {
                  powerups.push({
                    x: b.x + b.w / 2 - 11,
                    y: b.y + b.h / 2,
                    w: 22,
                    h: 12,
                    type: b.powerup,
                    vy: 1.8,
                  });
                }
              } else {
                b.color = '#94a3b8';
                spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#ffffff', 4);
              }
              break;
            }
          }

          if (hitBrick || l.y < 24) {
            lasers.splice(lIdx, 1);
          }
        }

        // Power-ups update
        for (let pIdx = powerups.length - 1; pIdx >= 0; pIdx--) {
          const p = powerups[pIdx];
          p.y += p.vy;

          // Check paddle collision
          if (
            p.y + p.h >= height - 25 &&
            p.y <= height - 15 &&
            p.x + p.w >= padX &&
            p.x <= padX + curPadW
          ) {
            // Apply powerup
            addScore(20);
            soundFx.playVictory();

            if (p.type === 'multiball') {
              const currentLen = balls.length;
              for (let i = 0; i < currentLen && balls.length < 5; i++) {
                const b = balls[i];
                balls.push({ x: b.x, y: b.y, r: b.r, vx: b.vx * 0.8 + 1.8, vy: b.vy });
                balls.push({ x: b.x, y: b.y, r: b.r, vx: b.vx * 0.8 - 1.8, vy: b.vy });
              }
            } else if (p.type === 'wide') {
              wideTimer = 60 * 12; // 12 seconds
            } else if (p.type === 'laser') {
              laserTimer = 60 * 10; // 10 seconds
            } else if (p.type === 'slow') {
              slowTimer = 60 * 8; // 8 seconds
            } else if (p.type === 'life') {
              lives = Math.min(5, lives + 1);
            } else if (p.type === 'fireball') {
              fireTimer = 60 * 6; // 6 seconds
            }

            powerups.splice(pIdx, 1);
            continue;
          }

          if (p.y > height + 10) {
            powerups.splice(pIdx, 1);
          }
        }

        // Particles update
        for (let ptIdx = particles.length - 1; ptIdx >= 0; ptIdx--) {
          const pt = particles[ptIdx];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
          if (pt.life <= 0) {
            particles.splice(ptIdx, 1);
          }
        }

        // Check Stage Clear (Zero-allocation loop)
        let activeBricksCount = 0;
        for (let i = 0; i < bricks.length; i++) {
          if (bricks[i].active) activeBricksCount++;
        }
        if (activeBricksCount === 0) {
          soundFx.playVictory();
          addScore(150 + stageIndex * 50);
          stageIndex++;
          stageClearFrames = 90;
          loadStage(stageIndex);
        }

        // ==========================================
        // RENDERING
        // ==========================================

        // Deep Night Forest Canvas Background
        ctx.fillStyle = '#04100c';
        ctx.fillRect(0, 0, width, height);

        // Header Banner / Status Bar
        ctx.fillStyle = '#061d15';
        ctx.fillRect(0, 0, width, 26);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 26);
        ctx.lineTo(width, 26);
        ctx.stroke();

        // Stage & Name in Header
        ctx.fillStyle = '#6ee7b7';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `STAGE ${stageIndex + 1} • ${STAGE_NAMES[stageIndex % STAGE_NAMES.length]}`,
          10,
          17
        );

        // Lives in Header (Hearts)
        ctx.textAlign = 'right';
        ctx.fillStyle = '#f43f5e';
        let heartsStr = '';
        for (let h = 0; h < lives; h++) heartsStr += '♥ ';
        ctx.fillText(heartsStr.trim(), width - 10, 17);

        // Active Power-up Badges in Header
        const activeBadges: { label: string; color: string }[] = [];
        if (laserTimer > 0) activeBadges.push({ label: `LASER ${Math.ceil(laserTimer / 60)}s`, color: '#ef4444' });
        if (wideTimer > 0) activeBadges.push({ label: `LARGE ${Math.ceil(wideTimer / 60)}s`, color: '#10b981' });
        if (fireTimer > 0) activeBadges.push({ label: `FEU ${Math.ceil(fireTimer / 60)}s`, color: '#f97316' });
        if (slowTimer > 0) activeBadges.push({ label: `LENT ${Math.ceil(slowTimer / 60)}s`, color: '#eab308' });

        if (activeBadges.length > 0) {
          ctx.textAlign = 'center';
          let badgeX = width / 2;
          ctx.font = 'bold 9px sans-serif';
          activeBadges.forEach((b) => {
            ctx.fillStyle = b.color;
            ctx.fillText(b.label, badgeX, 17);
            badgeX += 50;
          });
        }

        // Render Bricks
        for (let i = 0; i < bricks.length; i++) {
          const b = bricks[i];
          if (!b.active) continue;

          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, b.y, b.w, b.h);

          // Top/Left bevel highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(b.x, b.y, b.w, 2);
          ctx.fillRect(b.x, b.y, 2, b.h);

          // Bottom/Right bevel shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(b.x, b.y + b.h - 2, b.w, 2);
          ctx.fillRect(b.x + b.w - 2, b.y, 2, b.h);

          // Reinforced Brick metallic rivets or cracked outline
          if (b.maxHp > 1) {
            ctx.strokeStyle = b.hp === 2 ? '#f8fafc' : '#ef4444';
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
          }

          // Guaranteed Power-up Star Indicator
          if (b.powerup) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('★', b.x + b.w / 2, b.y + b.h - 4);
          }
        }

        // Render Power-Up Capsules (using static BREAKOUT_CAPSULE_CONFIG)
        for (let i = 0; i < powerups.length; i++) {
          const p = powerups[i];
          const conf = BREAKOUT_CAPSULE_CONFIG[p.type];

          // Capsule pill
          ctx.fillStyle = conf.bg;
          ctx.shadowBlur = 6;
          ctx.shadowColor = conf.bg;
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.w, p.h, 6);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Capsule text
          ctx.fillStyle = conf.text;
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(conf.label, p.x + p.w / 2, p.y + p.h - 3);
        }

        // Render Lasers
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ef4444';
        for (let i = 0; i < lasers.length; i++) {
          const l = lasers[i];
          ctx.fillRect(l.x - 1.5, l.y, 3, 10);
        }
        ctx.shadowBlur = 0;

        // Render Paddle
        ctx.fillStyle = wideTimer > 0 ? '#10b981' : '#f59e0b';
        ctx.fillRect(padX, height - 25, curPadW, padH);

        // Paddle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(padX, height - 25, curPadW, 2);

        // Laser cannons on paddle when active
        if (laserTimer > 0) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(padX + 2, height - 29, 4, 4);
          ctx.fillRect(padX + curPadW - 6, height - 29, 4, 4);
        }

        // Render Balls
        for (let i = 0; i < balls.length; i++) {
          const b = balls[i];
          if (fireTimer > 0) {
            ctx.fillStyle = '#f97316';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f97316';
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#f59e0b';
          }
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Render Particles
        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i];
          const alpha = pt.life / pt.maxLife;
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Stage Cleared Celebration Overlay
        if (stageClearFrames > 0) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('STAGE FRANCHI ! +BONUS', width / 2, height / 2 - 10);
        }

        // Start Prompt
        if (!started) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ESPACE ou Clic pour lancer la bille', width / 2, height / 2 + 50);
        }
      };

      startFixedLoop(() => gameActive, loop);
    }

    // ==========================================
    // 4. FLAPPY HIBOU
    // ==========================================
    else if (selectedGame === 'flappy') {
      let bird = { y: 200, vy: 0, gravity: 0.26, jump: -5.0 };
      interface Pipe {
        x: number;
        w: number;
        top: number;
        gap: number;
        passed: boolean;
      }
      let pipes: Pipe[] = [];
      let frame = 0;
      let gameActive = true;
      let started = false;

      const loop = () => {
        if (!gameActive) return;

        if (isKeyDown(KEY_CODES_JUMP)) {
          started = true;
          bird.vy = bird.jump;
          soundFx.playClick();
          // Clear jump key so player must release and re-press
          for (let i = 0; i < KEY_CODES_JUMP.length; i++) {
            const k = KEY_CODES_JUMP[i];
            keyboardKeysRef.current.delete(k);
            gamepadKeysRef.current.delete(k);
            keysDownRef.current.delete(k);
          }
        }

        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        if (started) {
          frame++;
          bird.vy += bird.gravity;
          bird.y += bird.vy;

          // Spawn pipes
          const flappySpawnInterval = difficulty === 'expert' ? 100 : difficulty === 'detente' ? 125 : 115;
          const flappyGap = difficulty === 'expert' ? 118 : difficulty === 'detente' ? 145 : 132;
          const flappyPipeSpeed = difficulty === 'expert' ? 2.3 : difficulty === 'detente' ? 1.5 : 1.85;

          if (frame % flappySpawnInterval === 0) {
            const gap = flappyGap;
            const top = Math.random() * (height - gap - 80) + 40;
            pipes.push({ x: width, w: 45, top, gap, passed: false });
          }

          // Move pipes & test collision
          for (let i = pipes.length - 1; i >= 0; i--) {
            const p = pipes[i];
            p.x -= flappyPipeSpeed;

            // Score point
            if (p.x + p.w < 60 && !p.passed) {
              p.passed = true;
              addScore(1);
              soundFx.playChime();
            }

            // Hit test
            if (60 + 10 > p.x && 60 - 10 < p.x + p.w) {
              if (bird.y - 10 < p.top || bird.y + 10 > p.top + p.gap) {
                gameActive = false;
                triggerGameOver();
                return;
              }
            }

            if (p.x + p.w < 0) pipes.splice(i, 1);
          }

          // Ground / sky collision
          if (bird.y > height - 15 || bird.y < 5) {
            gameActive = false;
            triggerGameOver();
            return;
          }
        } else {
          bird.y = 190 + Math.sin(Date.now() / 250) * 6;
        }

        // Draw Pipes
        ctx.fillStyle = '#1e3a29';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        for (const p of pipes) {
          ctx.fillRect(p.x, 0, p.w, p.top);
          ctx.strokeRect(p.x, 0, p.w, p.top);
          ctx.fillRect(p.x, p.top + p.gap, p.w, height - (p.top + p.gap));
          ctx.strokeRect(p.x, p.top + p.gap, p.w, height - (p.top + p.gap));
        }

        // Draw Owl
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦉', 60, bird.y + 10);

        if (!started) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Appuyez sur ESPACE ou cliquez pour voler', width / 2, height / 2 + 50);
          ctx.textAlign = 'left';
        }
      };

      canvas.onclick = () => {
        started = true;
        bird.vy = bird.jump;
        soundFx.playClick();
      };

      startFixedLoop(() => gameActive, loop);
    }

    // ==========================================
    // 5. HIBOU INVADERS
    // ==========================================
    else if (selectedGame === 'invaders') {
      let playerX = 200;
      interface Bullet {
        x: number;
        y: number;
      }
      interface AlienBomb {
        x: number;
        y: number;
      }
      interface Invader {
        x: number;
        y: number;
        type: 'squid' | 'crab' | 'octopus';
        points: number;
        alive: boolean;
      }
      interface BunkerBlock {
        x: number;
        y: number;
        w: number;
        h: number;
        alive: boolean;
      }

      let bullets: Bullet[] = [];
      let alienBombs: AlienBomb[] = [];
      let invaders: Invader[] = [];
      let bunkers: BunkerBlock[] = [];
      let shootTimer = 0;
      let bombTimer = 0;
      let direction = 1;
      let gameActive = true;
      let started = false;
      let marchTimer = 0;
      let invaderFrame: 0 | 1 = 0;
      let lives = difficulty === 'expert' ? 2 : difficulty === 'detente' ? 5 : 3;
      let hitFlicker = 0;

      // 3 Bunkers with 6 destructible blocks each
      const initBunkers = () => {
        bunkers = [];
        const bunkerXs = [65, 190, 315];
        for (const bx of bunkerXs) {
          for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 3; c++) {
              bunkers.push({
                x: bx + c * 10,
                y: 318 + r * 9,
                w: 9,
                h: 8,
                alive: true,
              });
            }
          }
        }
      };

      const initInvaders = (startY = 45) => {
        invaders = [];
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 7; c++) {
            const type: 'squid' | 'crab' | 'octopus' =
              r === 0 ? 'squid' : r < 3 ? 'crab' : 'octopus';
            const points = r === 0 ? 30 : r < 3 ? 20 : 10;
            invaders.push({
              x: 40 + c * 46,
              y: startY + r * 30,
              type,
              points,
              alive: true,
            });
          }
        }
      };

      initBunkers();
      initInvaders(45);

      canvas.onclick = () => {
        started = true;
        if (shootTimer <= 0 && bullets.length < 2) {
          bullets.push({ x: playerX, y: height - 36 });
          shootTimer = 16;
          soundFx.playClick();
        }
      };

      // Draw pixel-matrix alien
      const drawInvaderSprite = (inv: Invader, f: 0 | 1) => {
        const ix = inv.x;
        const iy = inv.y;

        if (inv.type === 'squid') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(ix - 4, iy - 6, 8, 4);
          ctx.fillRect(ix - 6, iy - 2, 12, 4);
          ctx.fillRect(ix - 2, iy - 8, 4, 2);
          if (f === 0) {
            ctx.fillRect(ix - 6, iy + 2, 3, 4);
            ctx.fillRect(ix + 3, iy + 2, 3, 4);
          } else {
            ctx.fillRect(ix - 4, iy + 2, 2, 5);
            ctx.fillRect(ix + 2, iy + 2, 2, 5);
          }
          ctx.fillStyle = '#060f09';
          ctx.fillRect(ix - 3, iy - 3, 2, 2);
          ctx.fillRect(ix + 1, iy - 3, 2, 2);
        } else if (inv.type === 'crab') {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(ix - 7, iy - 4, 14, 6);
          ctx.fillRect(ix - 5, iy - 7, 10, 3);
          if (f === 0) {
            ctx.fillRect(ix - 9, iy - 2, 3, 6);
            ctx.fillRect(ix + 6, iy - 2, 3, 6);
            ctx.fillRect(ix - 7, iy + 2, 3, 4);
            ctx.fillRect(ix + 4, iy + 2, 3, 4);
          } else {
            ctx.fillRect(ix - 9, iy - 6, 3, 6);
            ctx.fillRect(ix + 6, iy - 6, 3, 6);
            ctx.fillRect(ix - 5, iy + 2, 2, 4);
            ctx.fillRect(ix + 3, iy + 2, 2, 4);
          }
          ctx.fillStyle = '#060f09';
          ctx.fillRect(ix - 4, iy - 3, 2, 2);
          ctx.fillRect(ix + 2, iy - 3, 2, 2);
        } else {
          ctx.fillStyle = '#a855f7';
          ctx.fillRect(ix - 7, iy - 6, 14, 6);
          ctx.fillRect(ix - 9, iy - 3, 18, 5);
          if (f === 0) {
            ctx.fillRect(ix - 8, iy + 2, 3, 4);
            ctx.fillRect(ix - 2, iy + 2, 4, 3);
            ctx.fillRect(ix + 5, iy + 2, 3, 4);
          } else {
            ctx.fillRect(ix - 6, iy + 2, 3, 4);
            ctx.fillRect(ix - 1, iy + 2, 2, 5);
            ctx.fillRect(ix + 3, iy + 2, 3, 4);
          }
          ctx.fillStyle = '#060f09';
          ctx.fillRect(ix - 4, iy - 3, 2, 2);
          ctx.fillRect(ix + 2, iy - 3, 2, 2);
        }
      };

      const loop = () => {
        if (!gameActive) return;
        shootTimer--;
        bombTimer--;
        if (hitFlicker > 0) hitFlicker--;

        if (!started) {
          ctx.fillStyle = '#060f09';
          ctx.fillRect(0, 0, width, height);

          // Player Cannon
          ctx.fillStyle = '#10b981';
          ctx.fillRect(playerX - 13, height - 22, 26, 8);
          ctx.fillRect(playerX - 8, height - 27, 16, 5);
          ctx.fillRect(playerX - 2, height - 32, 4, 5);

          // Draw Bunkers
          ctx.fillStyle = '#10b981';
          for (const b of bunkers) {
            if (b.alive) ctx.fillRect(b.x, b.y, b.w, b.h);
          }

          // Invaders
          for (const inv of invaders) {
            drawInvaderSprite(inv, 0);
          }

          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Appuyez sur ESPACE ou Clic pour engager le combat', width / 2, height / 2 + 55);
          ctx.textAlign = 'left';

          if (isKeyDown(['Space', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyQ'])) {
            started = true;
          }
          return;
        }

        // Cannon Movement
        if (touchPosRef.current.active) {
          const tx = touchPosRef.current.x;
          if (Math.abs(playerX - tx) > 5) {
            playerX += Math.sign(tx - playerX) * 4.8;
            playerX = Math.max(20, Math.min(width - 20, playerX));
          }
        } else {
          if (isKeyDown(KEY_CODES_LEFT) && playerX > 20) playerX -= 4.4;
          if (isKeyDown(KEY_CODES_RIGHT) && playerX < width - 20) playerX += 4.4;
        }

        // Shooting
        if (isKeyDown(KEY_CODES_SHOOT) && shootTimer <= 0 && bullets.length < 2) {
          bullets.push({ x: playerX, y: height - 36 });
          shootTimer = 16;
          soundFx.playClick();
        }

        // Calculate alive count without allocating an array
        let aliveCount = 0;
        for (let i = 0; i < invaders.length; i++) {
          if (invaders[i].alive) aliveCount++;
        }

        // Alien bombs dropping (Zero-allocation picking)
        if (bombTimer <= 0 && aliveCount > 0) {
          const targetIndex = Math.floor(Math.random() * aliveCount);
          let currentAliveIdx = 0;
          let randomAlien: Invader | null = null;
          for (let i = 0; i < invaders.length; i++) {
            if (invaders[i].alive) {
              if (currentAliveIdx === targetIndex) {
                randomAlien = invaders[i];
                break;
              }
              currentAliveIdx++;
            }
          }
          if (randomAlien) {
            alienBombs.push({ x: randomAlien.x, y: randomAlien.y + 10 });
            const bombFactor = difficulty === 'expert' ? 1.6 : difficulty === 'detente' ? 2.8 : 2.2;
            const minBombCooldown = difficulty === 'expert' ? 25 : difficulty === 'detente' ? 45 : 35;
            bombTimer = Math.max(minBombCooldown, Math.floor(aliveCount * bombFactor));
          }
        }

        // Stepped Invader March (Authentic hardware rhythm, zero array allocation)
        marchTimer++;
        const marchFactor = difficulty === 'expert' ? 0.85 : difficulty === 'detente' ? 1.3 : 1.05;
        const minMarch = difficulty === 'expert' ? 3 : difficulty === 'detente' ? 5 : 4;
        const marchInterval = Math.max(minMarch, Math.floor(aliveCount * marchFactor));
        if (marchTimer >= marchInterval && aliveCount > 0) {
          marchTimer = 0;
          invaderFrame = invaderFrame === 0 ? 1 : 0;

          let hitWall = false;
          for (let i = 0; i < invaders.length; i++) {
            const inv = invaders[i];
            if (!inv.alive) continue;
            if ((direction > 0 && inv.x >= width - 25) || (direction < 0 && inv.x <= 25)) {
              hitWall = true;
              break;
            }
          }

          if (hitWall) {
            direction *= -1;
            for (let i = 0; i < invaders.length; i++) {
              const inv = invaders[i];
              if (!inv.alive) continue;
              inv.y += 12;
              if (inv.y >= height - 45) {
                gameActive = false;
                triggerGameOver();
                return;
              }
            }
          } else {
            for (let i = 0; i < invaders.length; i++) {
              const inv = invaders[i];
              if (!inv.alive) continue;
              inv.x += direction * 9;
            }
          }
        }

        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Player Cannon
        if (hitFlicker === 0 || Math.floor(hitFlicker / 4) % 2 === 0) {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(playerX - 13, height - 22, 26, 8);
          ctx.fillRect(playerX - 8, height - 27, 16, 5);
          ctx.fillRect(playerX - 2, height - 32, 4, 5);
        }

        // Draw Bunkers
        ctx.fillStyle = '#10b981';
        for (const b of bunkers) {
          if (b.alive) ctx.fillRect(b.x, b.y, b.w, b.h);
        }

        // Player Bullets
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#f59e0b';
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.y -= 7.0;
          ctx.fillRect(b.x - 1.5, b.y, 3, 10);

          // Bunker hit test
          let bulletDestroyed = false;
          for (const bk of bunkers) {
            if (bk.alive && b.x >= bk.x && b.x <= bk.x + bk.w && b.y >= bk.y && b.y <= bk.y + bk.h) {
              bk.alive = false;
              bullets.splice(i, 1);
              bulletDestroyed = true;
              break;
            }
          }
          if (bulletDestroyed) continue;

          // Invader hit test
          for (let k = 0; k < invaders.length; k++) {
            const inv = invaders[k];
            if (!inv.alive) continue;
            if (Math.abs(b.x - inv.x) < 14 && Math.abs(b.y - inv.y) < 12) {
              inv.alive = false;
              bullets.splice(i, 1);
              addScore(inv.points);
              soundFx.playChime();
              bulletDestroyed = true;
              break;
            }
          }
          if (bulletDestroyed) continue;

          if (b.y < 0) bullets.splice(i, 1);
        }
        ctx.shadowBlur = 0;

        // Alien Bombs
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ef4444';
        for (let i = alienBombs.length - 1; i >= 0; i--) {
          const bomb = alienBombs[i];
          bomb.y += 3.6;
          // Zig-zag missile shape
          ctx.fillRect(bomb.x - 1.5, bomb.y, 3, 8);

          // Bunker hit
          let bombDestroyed = false;
          for (const bk of bunkers) {
            if (bk.alive && bomb.x >= bk.x && bomb.x <= bk.x + bk.w && bomb.y >= bk.y && bomb.y <= bk.y + bk.h) {
              bk.alive = false;
              alienBombs.splice(i, 1);
              bombDestroyed = true;
              break;
            }
          }
          if (bombDestroyed) continue;

          // Player cannon hit
          if (Math.abs(bomb.x - playerX) < 14 && bomb.y >= height - 32 && bomb.y <= height - 12) {
            alienBombs.splice(i, 1);
            lives--;
            hitFlicker = 30;
            soundFx.playError();
            if (lives <= 0) {
              gameActive = false;
              triggerGameOver();
              return;
            }
            continue;
          }

          if (bomb.y > height) alienBombs.splice(i, 1);
        }
        ctx.shadowBlur = 0;

        // Draw Invaders
        for (let k = 0; k < invaders.length; k++) {
          const inv = invaders[k];
          if (inv.alive) {
            drawInvaderSprite(inv, invaderFrame);
          }
        }

        // Lives and HUD
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`VIES: ${'▲ '.repeat(lives)}`, 15, height - 8);

        // Wave Cleared -> Respawn with speed increase
        if (aliveCount === 0) {
          soundFx.playVictory();
          addScore(150);
          initInvaders(Math.min(100, 45 + 15));
          initBunkers();
        }
      };

      startFixedLoop(() => gameActive, loop);
    }

    // ==========================================
    // 6. FOREST RUN
    // ==========================================
    // ==========================================
    // 6. FOREST RUN (COURSE SYLVESTRE)
    // ==========================================
    else if (selectedGame === 'run') {
      let player = {
        y: 340,
        vy: 0,
        gravity: 0.44,
        jump: -8.8,
        onGround: true,
        isDucking: false,
      };

      type ObstacleType = 'ground' | 'overhead';
      interface Obstacle {
        x: number;
        w: number;
        h: number;
        type: ObstacleType;
      }
      interface DustParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        maxLife: number;
        color: string;
      }

      let obstacles: Obstacle[] = [];
      let particles: DustParticle[] = [];
      let frame = 0;
      let gameActive = true;
      let started = false;
      let distanceToNextSpawn = 170;
      let lastObstacleType: ObstacleType = 'ground';
      let sameTypeStreak = 0;

      canvas.onclick = (e: MouseEvent) => {
        if (!started) {
          started = true;
          player.vy = player.jump;
          player.onGround = false;
          soundFx.playClick();
          return;
        }

        const rect = canvas.getBoundingClientRect();
        const clickY = ((e.clientY - rect.top) / rect.height) * 400;

        if (clickY > 270) {
          // Slide / duck on bottom tap
          if (player.onGround) {
            keyboardKeysRef.current.add('ArrowDown');
            keysDownRef.current.add('ArrowDown');
            setTimeout(() => {
              keyboardKeysRef.current.delete('ArrowDown');
              keysDownRef.current.delete('ArrowDown');
            }, 320);
          }
        } else if (player.onGround) {
          // Jump on upper tap
          player.vy = player.jump;
          player.onGround = false;
          soundFx.playClick();
        }
      };

      const loop = () => {
        if (!gameActive) return;

        // Speed calculation based on difficulty and progression
        const runBaseSpeed = difficulty === 'expert' ? 4.3 : difficulty === 'detente' ? 2.8 : 3.5;
        const runSpeedDivisor = difficulty === 'expert' ? 2000 : difficulty === 'detente' ? 3000 : 2500;
        const currentSpeed = Math.min(7.2, runBaseSpeed + scoreRef.current / runSpeedDivisor);

        // Rich Forest Night Sky
        ctx.fillStyle = '#04120e';
        ctx.fillRect(0, 0, width, height);

        // Distant forest canopy & tree silhouettes
        ctx.fillStyle = '#062018';
        for (let i = 0; i < 6; i++) {
          const treeX = ((i * 85 - frame * 0.45) % (width + 90)) - 45;
          ctx.beginPath();
          ctx.moveTo(treeX, 355);
          ctx.lineTo(treeX + 25, 230);
          ctx.lineTo(treeX + 50, 355);
          ctx.fill();
        }

        // Forest Floor / Ground
        ctx.fillStyle = '#072418';
        ctx.fillRect(0, 355, width, 45);

        // Ground Moss Line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 355);
        ctx.lineTo(width, 355);
        ctx.stroke();

        // Little ground pebbles/moss spots scrolling
        ctx.fillStyle = '#0d543e';
        for (let i = 0; i < 7; i++) {
          const dotX = ((i * 65 - frame * 2.5) % (width + 40)) - 20;
          ctx.fillRect(dotX, 365 + (i % 3) * 6, 8, 3);
        }

        // Runner Owl Rendering
        if (player.onGround && player.isDucking) {
          // Squashed / sliding owl pose
          ctx.save();
          ctx.translate(60, player.y + 6);
          ctx.scale(1.28, 0.62);
          ctx.font = '28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🦉', 0, 0);
          ctx.restore();

          // Spawn sliding dust / leaf particles under feet (capped for 60fps)
          if (frame % 2 === 0 && particles.length < 35) {
            particles.push({
              x: 52,
              y: 353 + (Math.random() * 2 - 1),
              vx: -(currentSpeed * 0.8 + Math.random() * 1.5),
              vy: -Math.random() * 0.7,
              life: 14,
              maxLife: 14,
              color: Math.random() > 0.4 ? '#10b981' : '#fbbf24',
            });
          }
        } else if (!player.onGround) {
          // In the air (jumping or fast falling)
          ctx.save();
          ctx.translate(60, player.y);
          ctx.rotate(-0.14);
          ctx.font = '30px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🦉', 0, 0);
          ctx.restore();
        } else {
          // Running on ground with subtle bounce
          const bob = Math.sin(frame * 0.3) * 1.8;
          ctx.font = '30px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🦉', 60, player.y + bob);
        }

        // Draw and update sliding particles with hardware globalAlpha (zero string allocation)
        for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
          const p = particles[pIdx];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          if (p.life <= 0 || p.x < 0) {
            particles.splice(pIdx, 1);
            continue;
          }
          ctx.globalAlpha = (p.life / p.maxLife) * 0.7;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        if (!started) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ESPACE / HAUT pour sauter • BAS / S pour glisser', width / 2, height / 2 - 10);
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#6ee7b7';
          ctx.fillText('Appuyez sur une touche ou cliquez pour commencer', width / 2, height / 2 + 15);
          ctx.textAlign = 'left';

          if (isKeyDown(KEY_CODES_JUMP)) {
            started = true;
            player.vy = player.jump;
            player.onGround = false;
            soundFx.playClick();
          } else if (isKeyDown(KEY_CODES_DOWN)) {
            started = true;
            soundFx.playClick();
          }
          return;
        }

        frame++;

        if (frame % 10 === 0) {
          addScore(1);
        }

        // Input Handling with static key arrays
        const isDuckDown = isKeyDown(KEY_CODES_DOWN);
        const isJumpDown = isKeyDown(KEY_CODES_JUMP);

        if (isJumpDown && player.onGround) {
          player.vy = player.jump;
          player.onGround = false;
          player.isDucking = false;
          soundFx.playClick();
        } else if (player.onGround) {
          player.isDucking = isDuckDown;
        } else {
          // Fast-fall when pressing Down in mid-air
          player.isDucking = false;
          if (isDuckDown) {
            player.vy += 0.52;
          }
        }

        // Physics
        player.vy += player.gravity;
        player.y += player.vy;
        if (player.y >= 340) {
          player.y = 340;
          player.vy = 0;
          player.onGround = true;
        }

        // Procedural Feasible Spawner
        // Guarantees mathematically clearable courses with ample reaction time
        distanceToNextSpawn -= currentSpeed;
        if (distanceToNextSpawn <= 0) {
          let nextType: ObstacleType = 'ground';
          const overheadChance = difficulty === 'detente' ? 0.35 : 0.5;
          if (Math.random() < overheadChance) {
            nextType = 'overhead';
          }
          // Prevent frustrating streaks (> 2 identical in a row)
          if (nextType === lastObstacleType) {
            sameTypeStreak++;
            if (sameTypeStreak >= 2) {
              nextType = nextType === 'ground' ? 'overhead' : 'ground';
              sameTypeStreak = 1;
            }
          } else {
            lastObstacleType = nextType;
            sameTypeStreak = 1;
          }

          if (nextType === 'ground') {
            obstacles.push({ x: width + 10, w: 24, h: 32, type: 'ground' });
            // Reaction buffer after ground obstacle (jump takes 40 frames + safety clearance)
            const jumpBufferFrames = difficulty === 'expert' ? 62 : difficulty === 'detente' ? 88 : 74;
            const variance = Math.floor(Math.random() * 16);
            distanceToNextSpawn = currentSpeed * (jumpBufferFrames + variance);
          } else {
            obstacles.push({ x: width + 10, w: 28, h: 140, type: 'overhead' });
            // Reaction buffer after slide (slide clear takes ~12 frames + safety clearance)
            const slideBufferFrames = difficulty === 'expert' ? 48 : difficulty === 'detente' ? 76 : 60;
            const variance = Math.floor(Math.random() * 14);
            distanceToNextSpawn = currentSpeed * (slideBufferFrames + variance);
          }
        }

        // Update and Render Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= currentSpeed;

          if (obs.type === 'ground') {
            // Souche Sylvestre (Tree stump with moss)
            const stumpY = 355 - obs.h;
            // Trunk body
            ctx.fillStyle = '#5c2d16';
            ctx.fillRect(obs.x + 2, stumpY, obs.w - 4, obs.h);
            // Bark streaks
            ctx.fillStyle = '#78350f';
            ctx.fillRect(obs.x + 4, stumpY + 4, 3, obs.h - 8);
            ctx.fillRect(obs.x + obs.w - 8, stumpY + 6, 3, obs.h - 10);
            // Moss top
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.ellipse(obs.x + obs.w / 2, stumpY, obs.w / 2 - 1, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Tiny mushroom cap
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(obs.x + 6, stumpY - 2, 2.5, 0, Math.PI, true);
            ctx.fill();

            // Collision check: player must jump high enough to clear
            // Owl horizontal span [52, 68]
            if (obs.x < 68 && obs.x + obs.w > 52) {
              if (player.y > 355 - obs.h + 4) {
                gameActive = false;
                triggerGameOver();
                return;
              }
            }
          } else {
            // Overhead obstacle: low hanging branch with bat
            const bottomY = 326;
            // Vine / branch from canopy down to bat
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.w / 2, 0);
            ctx.lineTo(obs.x + obs.w / 2 - 2, bottomY - 26);
            ctx.lineTo(obs.x + obs.w / 2, bottomY - 14);
            ctx.stroke();

            // Foliage tuft
            ctx.fillStyle = '#065f46';
            ctx.beginPath();
            ctx.arc(obs.x + obs.w / 2, bottomY - 18, 8, 0, Math.PI * 2);
            ctx.fill();

            // Hanging Bat
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🦇', obs.x + obs.w / 2, bottomY);

            // Collision check: must be ducking on ground to clear underneath
            if (obs.x < 68 && obs.x + obs.w > 52) {
              const safelyDucking = player.onGround && player.isDucking;
              if (!safelyDucking) {
                gameActive = false;
                triggerGameOver();
                return;
              }
            }
          }

          if (obs.x + obs.w < -20) {
            obstacles.splice(i, 1);
          }
        }
      };

      startFixedLoop(() => gameActive, loop);
    }

    // ==========================================
    // 7. TETRIS MYSTIQUE
    // ==========================================
    else if (selectedGame === 'tetris') {
      const cols = 10;
      const rows = 20;
      const bSize = 20;
      const colors = [null, '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#eab308', '#ec4899'];
      const pieces = [
        [],
        [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
        [[2,0,0],[2,2,2],[0,0,0]],                   // J
        [[0,0,3],[3,3,3],[0,0,0]],                   // L
        [[4,4],[4,4]],                               // O
        [[0,5,5],[5,5,0],[0,0,0]],                   // S
        [[0,6,0],[6,6,6],[0,0,0]],                   // T
        [[7,7,0],[0,7,7],[0,0,0]],                   // Z
      ];

      const board: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
      let curPiece = pieces[Math.floor(Math.random() * 7) + 1];
      let curColor = Math.floor(Math.random() * 7) + 1;
      let pX = 3;
      let pY = 0;
      let gameActive = true;
      let dropInterval = difficulty === 'expert' ? 450 : difficulty === 'detente' ? 850 : 650;

      const collides = (piece: number[][], ox: number, oy: number) => {
        for (let r = 0; r < piece.length; r++) {
          for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c] !== 0) {
              const nx = ox + c;
              const ny = oy + r;
              if (nx < 0 || nx >= cols || ny >= rows) return true;
              if (ny >= 0 && board[ny][nx] !== 0) return true;
            }
          }
        }
        return false;
      };

      const rotate = (piece: number[][]) => {
        const rotated = piece[0].map((_, index) => piece.map((row) => row[index]).reverse());
        if (!collides(rotated, pX, pY)) {
          curPiece = rotated;
          soundFx.playClick();
        }
      };

      const merge = () => {
        for (let r = 0; r < curPiece.length; r++) {
          for (let c = 0; c < curPiece[r].length; c++) {
            if (curPiece[r][c] !== 0 && pY + r >= 0) {
              board[pY + r][pX + c] = curColor;
            }
          }
        }

        let linesCleared = 0;
        for (let r = rows - 1; r >= 0; r--) {
          let rowFilled = true;
          for (let c = 0; c < cols; c++) {
            if (board[r][c] === 0) {
              rowFilled = false;
              break;
            }
          }
          if (rowFilled) {
            board.splice(r, 1);
            board.unshift(new Array(cols).fill(0));
            linesCleared++;
            r++;
          }
        }

        if (linesCleared > 0) {
          addScore(linesCleared * 100);
          soundFx.playVictory();
        }

        // Spawn next
        curPiece = pieces[Math.floor(Math.random() * 7) + 1];
        curColor = Math.floor(Math.random() * 7) + 1;
        pX = 3;
        pY = 0;

        if (collides(curPiece, pX, pY)) {
          gameActive = false;
          triggerGameOver();
        }
      };

      const drop = () => {
        if (!gameActive) return;
        if (!collides(curPiece, pX, pY + 1)) {
          pY++;
        } else {
          merge();
        }
        draw();
      };

      const drawBlock = (x: number, y: number, color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, bSize - 1, bSize - 1);
        // Bevel top-left light
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, bSize - 1, 2);
        ctx.fillRect(x, y, 2, bSize - 1);
        // Bevel bottom-right shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(x, y + bSize - 3, bSize - 1, 2);
        ctx.fillRect(x + bSize - 3, y, 2, bSize - 1);
      };

      const draw = () => {
        // Base canvas
        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Sidebar backgrounds
        ctx.fillStyle = '#040b06';
        ctx.fillRect(0, 0, 100, height);
        ctx.fillRect(300, 0, 100, height);

        // Matrix background (playfield)
        ctx.fillStyle = '#010503';
        ctx.fillRect(100, 0, 200, height);

        // Subtle matrix grid
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let c = 1; c < cols; c++) {
          ctx.moveTo(100 + c * bSize, 0);
          ctx.lineTo(100 + c * bSize, height);
        }
        for (let r = 1; r < rows; r++) {
          ctx.moveTo(100, r * bSize);
          ctx.lineTo(300, r * bSize);
        }
        ctx.stroke();

        // Delimitation borders around the 10x20 playfield (Left, Right, Bottom)
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(99, 0);
        ctx.lineTo(99, 399);
        ctx.lineTo(301, 399);
        ctx.lineTo(301, 0);
        ctx.stroke();
        ctx.restore();

        // Corner accents on borders
        ctx.fillStyle = '#34d399';
        ctx.fillRect(96, 396, 6, 4);
        ctx.fillRect(298, 396, 6, 4);

        // Sidebar decorative HUD & Controls
        ctx.save();
        ctx.textAlign = 'center';

        // Left sidebar: Controls
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('COMMANDES', 50, 120);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText('← / →', 50, 148);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Déplacer', 50, 160);

        ctx.fillStyle = '#94a3b8';
        ctx.fillText('↑ / Clic', 50, 188);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Pivoter', 50, 200);

        ctx.fillStyle = '#94a3b8';
        ctx.fillText('↓', 50, 228);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Accélérer', 50, 240);

        ctx.fillStyle = '#94a3b8';
        ctx.fillText('ESPACE', 50, 268);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Chute directe', 50, 280);

        // Right sidebar: Mode & Status
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('TETRIS', 350, 60);
        ctx.fillStyle = '#059669';
        ctx.font = '9px monospace';
        ctx.fillText('MYSTIQUE', 350, 75);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fillRect(320, 90, 60, 1);

        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText('ZONE 10×20', 350, 120);
        ctx.fillStyle = '#10b981';
        ctx.fillText('ACTIF', 350, 140);
        ctx.restore();

        // Board placed blocks
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (board[r][c] !== 0) {
              const color = colors[board[r][c]] || '#f59e0b';
              drawBlock(c * bSize + 100, r * bSize, color);
            }
          }
        }

        // Current active falling piece
        for (let r = 0; r < curPiece.length; r++) {
          for (let c = 0; c < curPiece[r].length; c++) {
            if (curPiece[r][c] !== 0) {
              const color = colors[curColor] || '#f59e0b';
              drawBlock((pX + c) * bSize + 100, (pY + r) * bSize, color);
            }
          }
        }
      };

      // Initial render immediately
      draw();

      intervalIdRef.current = window.setInterval(drop, dropInterval);

      // Tetris discrete key listener
      const onKeyDownTetris = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'KeyA', 'KeyQ'].includes(e.code)) {
          if (!collides(curPiece, pX - 1, pY)) pX--;
        }
        if (['ArrowRight', 'KeyD'].includes(e.code)) {
          if (!collides(curPiece, pX + 1, pY)) pX++;
        }
        if (['ArrowDown', 'KeyS'].includes(e.code)) {
          if (!collides(curPiece, pX, pY + 1)) pY++;
        }
        if (['ArrowUp', 'KeyW', 'KeyZ'].includes(e.code)) {
          rotate(curPiece);
        }
        if (['Space'].includes(e.code)) {
          while (!collides(curPiece, pX, pY + 1)) {
            pY++;
          }
          merge();
        }
        draw();
      };

      canvas.onclick = () => {
        rotate(curPiece);
        draw();
      };

      window.addEventListener('keydown', onKeyDownTetris);
      customCleanup = () => {
        window.removeEventListener('keydown', onKeyDownTetris);
      };
    }

    // ==========================================
    // 8. MINE STORM VECTREX REVIVAL (1982 AUTHENTIQUE)
    // ==========================================
    else if (selectedGame === 'vectrex') {
      interface Mine {
        id: number;
        type: 'floating_large' | 'floating_small' | 'magnetic_large' | 'magnetic_small' | 'fireball_mine';
        x: number;
        y: number;
        vx: number;
        vy: number;
        r: number;
        angle: number;
        rotSpeed: number;
      }
      interface Laser {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
      }
      interface Fireball {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
      }
      interface VectorDebris {
        x: number;
        y: number;
        vx: number;
        vy: number;
        len: number;
        angle: number;
        life: number;
        maxLife: number;
        color: string;
      }

      let nextMineId = 1;
      let field = 1;
      let lives = difficulty === 'expert' ? 2 : difficulty === 'detente' ? 5 : 3;
      let escapesLeft = difficulty === 'expert' ? 2 : difficulty === 'detente' ? 5 : 3;
      const mineSpeedMult = difficulty === 'expert' ? 1.3 : difficulty === 'detente' ? 0.75 : 1.0;
      let fieldClearTimer = 0;
      let escapeCooldown = 0;

      let ship = {
        x: 200,
        y: 200,
        vx: 0,
        vy: 0,
        angle: -Math.PI / 2,
        isThrusting: false,
      };

      let lasers: Laser[] = [];
      let fireballs: Fireball[] = [];
      let debris: VectorDebris[] = [];
      let mines: Mine[] = [];
      let shootTimer = 0;
      let shieldTimer = 90; // 1.5s safe shield on spawn
      let gameActive = true;

      let isPhosphorMode = false;
      try {
        isPhosphorMode = localStorage.getItem('hoot_vectrex_phosphor') === 'true';
      } catch {
        // Ignore
      }
      let phosphorHoldFrames = 0;
      let secretUnlockedJustNow = false;
      let started = false;

      const getPrimaryColor = () => (isPhosphorMode ? '#39ff14' : '#00ffcc');
      const getGlowColor = () => (isPhosphorMode ? '#39ff14' : '#00ffcc');

      // Spawn authentic vector line burst debris (capped for 60fps stability)
      const addVectorExplosion = (x: number, y: number, count: number, color = getPrimaryColor()) => {
        if (debris.length > 50) return;
        for (let i = 0; i < count; i++) {
          const a = (i * Math.PI * 2) / count + (Math.random() - 0.5) * 0.4;
          const spd = 1.2 + Math.random() * 2.8;
          debris.push({
            x,
            y,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            len: 5 + Math.random() * 8,
            angle: a,
            life: 28,
            maxLife: 28,
            color,
          });
        }
      };

      // Spawn mines for current field wave
      const spawnFieldMines = (currentField: number) => {
        mines = [];
        fireballs = [];

        // Count depends on wave
        const floatingCount = Math.max(3, 4 + Math.floor((currentField - 1) * 0.8));
        const magneticCount = currentField >= 2 ? Math.min(4, 1 + currentField) : 0;
        const fireballCount = currentField >= 3 ? Math.min(3, currentField - 2) : 0;

        const createMine = (type: Mine['type'], r: number, baseSpeed: number) => {
          let mx = 0;
          let my = 0;
          do {
            mx = Math.random() * width;
            my = Math.random() * height;
          } while (Math.hypot(mx - ship.x, my - ship.y) < 100);

          const a = Math.random() * Math.PI * 2;
          mines.push({
            id: nextMineId++,
            type,
            x: mx,
            y: my,
            vx: Math.cos(a) * baseSpeed,
            vy: Math.sin(a) * baseSpeed,
            r,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.03,
          });
        };

        for (let i = 0; i < floatingCount; i++) createMine('floating_large', 16, 0.75 * mineSpeedMult);
        for (let i = 0; i < magneticCount; i++) createMine('magnetic_large', 16, 0.65 * mineSpeedMult);
        for (let i = 0; i < fireballCount; i++) createMine('fireball_mine', 16, 0.7 * mineSpeedMult);
      };

      spawnFieldMines(field);

      // Escape / Hyperdrive (Button 4 / Key E)
      const triggerHyperdrive = () => {
        if (escapesLeft > 0 && escapeCooldown <= 0) {
          escapesLeft--;
          escapeCooldown = 35;
          addVectorExplosion(ship.x, ship.y, 10, '#38bdf8');

          // Find safe location
          let nx = 0;
          let ny = 0;
          let attempts = 0;
          do {
            nx = 40 + Math.random() * (width - 80);
            ny = 40 + Math.random() * (height - 80);
            attempts++;
          } while (attempts < 20 && mines.some((m) => Math.hypot(m.x - nx, m.y - ny) < 85));

          ship.x = nx;
          ship.y = ny;
          ship.vx = 0;
          ship.vy = 0;
          shieldTimer = 60; // 1s safe shield after warp
          addVectorExplosion(ship.x, ship.y, 8, getPrimaryColor());
          soundFx.playVictory();
        }
      };

      // Firing laser bolt
      const fireLaser = () => {
        if (shootTimer <= 0) {
          const cos = Math.cos(ship.angle);
          const sin = Math.sin(ship.angle);
          lasers.push({
            x: ship.x + cos * 16,
            y: ship.y + sin * 16,
            vx: cos * 8.2 + ship.vx * 0.4,
            vy: sin * 8.2 + ship.vy * 0.4,
            life: 38,
          });
          shootTimer = 14;
          soundFx.playClick();
        }
      };

      canvas.onclick = () => {
        if (!started) {
          started = true;
          soundFx.playClick();
          return;
        }
        fireLaser();
      };

      const loop = () => {
        if (!gameActive) return;

        const primaryColor = getPrimaryColor();
        const glowColor = getGlowColor();

        // 1. Attract / Title Screen Mode
        if (!started) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);

          // Vector CRT bezel frame lines
          ctx.strokeStyle = isPhosphorMode ? 'rgba(57, 255, 20, 0.4)' : 'rgba(0, 255, 204, 0.25)';
          ctx.lineWidth = 1;
          ctx.strokeRect(8, 8, width - 16, height - 16);

          // Vector Title
          ctx.fillStyle = primaryColor;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 10;
          ctx.textAlign = 'center';
          ctx.font = 'bold 24px monospace';
          ctx.fillText('MINE STORM', width / 2, 70);

          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = isPhosphorMode ? '#86efac' : '#7dd3fc';
          ctx.fillText('VECTREX SYSTEM 1982', width / 2, 92);

          // Score / Secret display
          ctx.font = 'bold 13px monospace';
          if (isPhosphorMode) {
            ctx.fillStyle = '#39ff14';
            ctx.fillText('RECORD LÉGENDAIRE : HIB - 999 990 PTS', width / 2, 126);
            ctx.font = '10px monospace';
            ctx.fillText('⚡ TUBE PHOSPHORE VERT ACTIF (PLUME D\'OR DÉBLOQUÉE) ⚡', width / 2, 145);
          } else {
            ctx.fillStyle = '#f59e0b';
            const displayHs = highScoreRef.current > 0 ? highScoreRef.current : 10000;
            ctx.fillText(`HIGH SCORE : ${displayHs} PTS`, width / 2, 130);
          }

          // Rotating attract demo ship in center
          ctx.save();
          ctx.translate(width / 2, height / 2 - 10);
          ctx.rotate((performance.now() / 1000) * 0.9);
          ctx.strokeStyle = primaryColor;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 10;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(22, 0);
          ctx.lineTo(-14, -12);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-14, 12);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(22, 0);
          ctx.lineTo(-6, 0);
          ctx.stroke();
          ctx.restore();

          // Instructions
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 12px monospace';
          ctx.fillText('APPUYEZ SUR UNE TOUCHE OU CLIQUEZ', width / 2, height - 75);
          ctx.font = '10px monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillText('TIR : ESPACE / (A) • HYPERDRIVE : E / (X)', width / 2, height - 55);

          // Secret Trigger: Holding Shoot Button (Space or Gamepad A) for 5 seconds (300 frames)
          const holdingShoot = isKeyDown(['Space']);
          if (holdingShoot) {
            phosphorHoldFrames++;

            const progress = Math.min(100, Math.floor((phosphorHoldFrames / 300) * 100));
            ctx.strokeStyle = '#39ff14';
            ctx.fillStyle = '#39ff14';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`CALIBRATION TUBE PHOSPHORE... ${progress}%`, width / 2, height / 2 + 58);

            // Circular charging arc around demo ship
            ctx.beginPath();
            ctx.arc(width / 2, height / 2 - 10, 36, -Math.PI / 2, -Math.PI / 2 + (progress / 100) * Math.PI * 2);
            ctx.stroke();

            if (phosphorHoldFrames >= 300 && !secretUnlockedJustNow) {
              secretUnlockedJustNow = true;
              isPhosphorMode = true;
              setIsVectrexPhosphor(true);
              try {
                localStorage.setItem('hoot_vectrex_phosphor', 'true');
              } catch {
                // Ignore
              }
              soundFx.playVectrexUnlock();
              unlockAchievement('vectrex_phosphor');
              addVectorExplosion(width / 2, height / 2 - 10, 32, '#39ff14');
            }
          } else {
            // Space was released
            if (phosphorHoldFrames > 0 && phosphorHoldFrames < 300) {
              started = true;
              soundFx.playClick();
            } else if (secretUnlockedJustNow) {
              started = true;
              soundFx.playClick();
            }
            phosphorHoldFrames = 0;
          }

          // Movement keys start the game immediately
          if (isKeyDown(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyZ', 'KeyQ'])) {
            started = true;
            soundFx.playClick();
          }

          return;
        }

        shootTimer--;
        if (escapeCooldown > 0) escapeCooldown--;
        if (shieldTimer > 0) shieldTimer--;

        // Escape Key trigger
        if (isKeyDown(['KeyE'])) {
          triggerHyperdrive();
          keyboardKeysRef.current.delete('KeyE');
          gamepadKeysRef.current.delete('KeyE');
          keysDownRef.current.delete('KeyE');
        }

        // Steering
        if (isKeyDown(['ArrowLeft', 'KeyA', 'KeyQ'])) ship.angle -= 0.052;
        if (isKeyDown(['ArrowRight', 'KeyD'])) ship.angle += 0.052;

        // Thrust
        ship.isThrusting = isKeyDown(['ArrowUp', 'KeyW', 'KeyZ']);
        if (ship.isThrusting) {
          ship.vx += Math.cos(ship.angle) * 0.12;
          ship.vy += Math.sin(ship.angle) * 0.12;
        }

        // Damping and clamp
        ship.vx *= 0.982;
        ship.vy *= 0.982;
        const currentSpeed = Math.hypot(ship.vx, ship.vy);
        if (currentSpeed > 5.8) {
          ship.vx = (ship.vx / currentSpeed) * 5.8;
          ship.vy = (ship.vy / currentSpeed) * 5.8;
        }

        ship.x += ship.vx;
        ship.y += ship.vy;

        // Screen wrap
        if (ship.x < 0) ship.x = width;
        if (ship.x > width) ship.x = 0;
        if (ship.y < 0) ship.y = height;
        if (ship.y > height) ship.y = 0;

        // Shoot on space
        if (isKeyDown(['Space'])) {
          fireLaser();
        }

        // Clear Screen with deep cathode black
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Vector CRT bezel frame lines
        ctx.strokeStyle = isPhosphorMode ? 'rgba(57, 255, 20, 0.35)' : 'rgba(0, 255, 204, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, width - 16, height - 16);

        // Setup Phosphor Vector Glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = glowColor;
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1.8;

        // Draw Player Ship (Authentic Vectrex needle arrowhead)
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        ctx.beginPath();
        ctx.moveTo(16, 0);       // Needle nose
        ctx.lineTo(-11, -9);     // Left wingtip
        ctx.lineTo(-4, 0);       // Rear center notch
        ctx.lineTo(-11, 9);      // Right wingtip
        ctx.closePath();
        ctx.stroke();

        // Center spine vector line
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-4, 0);
        ctx.stroke();

        // Thrust Jet Flame (Flickering vector line)
        if (ship.isThrusting) {
          ctx.strokeStyle = '#f59e0b';
          ctx.shadowColor = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(-4, -3);
          ctx.lineTo(-14 - Math.random() * 7, 0);
          ctx.lineTo(-4, 3);
          ctx.stroke();
          ctx.strokeStyle = primaryColor;
          ctx.shadowColor = glowColor;
        }

        // Draw Spawn / Warp Shield
        if (shieldTimer > 0 && Math.floor(shieldTimer / 5) % 2 === 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = primaryColor;
        }
        ctx.restore();

        // Lasers
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        for (let i = lasers.length - 1; i >= 0; i--) {
          const l = lasers[i];
          l.x += l.vx;
          l.y += l.vy;
          l.life--;

          // Screen wrap
          if (l.x < 0) l.x = width;
          if (l.x > width) l.x = 0;
          if (l.y < 0) l.y = height;
          if (l.y > height) l.y = 0;

          // Authentic vector line bolt
          const boltAngle = Math.atan2(l.vy, l.vx);
          ctx.beginPath();
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x - Math.cos(boltAngle) * 9, l.y - Math.sin(boltAngle) * 9);
          ctx.stroke();

          if (l.life <= 0) lasers.splice(i, 1);
        }

        // Fireballs (launched by Fireball Mines)
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        for (let i = fireballs.length - 1; i >= 0; i--) {
          const fb = fireballs[i];
          fb.x += fb.vx;
          fb.y += fb.vy;
          fb.life--;

          ctx.beginPath();
          ctx.arc(fb.x, fb.y, 4, 0, Math.PI * 2);
          ctx.stroke();

          // Hit ship
          if (shieldTimer <= 0 && Math.hypot(ship.x - fb.x, ship.y - fb.y) < 14) {
            addVectorExplosion(ship.x, ship.y, 14, '#ef4444');
            soundFx.playError();
            lives--;
            if (lives <= 0) {
              gameActive = false;
              triggerGameOver();
              return;
            }
            ship.x = 200;
            ship.y = 200;
            ship.vx = 0;
            ship.vy = 0;
            shieldTimer = 90;
            fireballs.splice(i, 1);
            continue;
          }

          if (fb.life <= 0 || fb.x < 0 || fb.x > width || fb.y < 0 || fb.y > height) {
            fireballs.splice(i, 1);
          }
        }

        // Mines Loop & Render
        const newMines: Mine[] = [];
        for (let i = mines.length - 1; i >= 0; i--) {
          const m = mines[i];
          m.angle += m.rotSpeed;

          // Homing behavior for magnetic mines
          if (m.type === 'magnetic_large' || m.type === 'magnetic_small') {
            const dx = ship.x - m.x;
            const dy = ship.y - m.y;
            const angleToShip = Math.atan2(dy, dx);
            const homingAcc = m.type === 'magnetic_small' ? 0.05 : 0.035;
            m.vx += Math.cos(angleToShip) * homingAcc;
            m.vy += Math.sin(angleToShip) * homingAcc;

            const maxSpd = m.type === 'magnetic_small' ? 1.45 : 0.95;
            const spd = Math.hypot(m.vx, m.vy);
            if (spd > maxSpd) {
              m.vx = (m.vx / spd) * maxSpd;
              m.vy = (m.vy / spd) * maxSpd;
            }
          }

          m.x += m.vx;
          m.y += m.vy;

          // Screen wrap
          if (m.x < 0) m.x = width;
          if (m.x > width) m.x = 0;
          if (m.y < 0) m.y = height;
          if (m.y > height) m.y = 0;

          // Draw authentic Mine Storm vector shapes
          ctx.save();
          ctx.translate(m.x, m.y);
          ctx.rotate(m.angle);

          if (m.type === 'floating_large' || m.type === 'floating_small') {
            // Floating Mine: 4-pointed vector diamond with crosshairs
            ctx.strokeStyle = primaryColor;
            ctx.shadowColor = glowColor;
            ctx.beginPath();
            ctx.moveTo(0, -m.r);
            ctx.lineTo(m.r, 0);
            ctx.lineTo(0, m.r);
            ctx.lineTo(-m.r, 0);
            ctx.closePath();
            ctx.stroke();

            // Internal Cross
            ctx.beginPath();
            ctx.moveTo(-m.r * 0.65, 0);
            ctx.lineTo(m.r * 0.65, 0);
            ctx.moveTo(0, -m.r * 0.65);
            ctx.lineTo(0, m.r * 0.65);
            ctx.stroke();
          } else if (m.type === 'magnetic_large' || m.type === 'magnetic_small') {
            // Magnetic Mine: Vector diamond with indented hooks
            ctx.strokeStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(0, -m.r);
            ctx.lineTo(m.r * 0.5, -m.r * 0.5);
            ctx.lineTo(m.r, 0);
            ctx.lineTo(m.r * 0.5, m.r * 0.5);
            ctx.lineTo(0, m.r);
            ctx.lineTo(-m.r * 0.5, m.r * 0.5);
            ctx.lineTo(-m.r, 0);
            ctx.lineTo(-m.r * 0.5, -m.r * 0.5);
            ctx.closePath();
            ctx.stroke();

            // Inner core
            ctx.beginPath();
            ctx.arc(0, 0, m.r * 0.35, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // Fireball Mine: Pulsating star-diamond
            ctx.strokeStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(0, -m.r);
            ctx.lineTo(m.r * 0.4, -m.r * 0.4);
            ctx.lineTo(m.r, 0);
            ctx.lineTo(m.r * 0.4, m.r * 0.4);
            ctx.lineTo(0, m.r);
            ctx.lineTo(-m.r * 0.4, m.r * 0.4);
            ctx.lineTo(-m.r, 0);
            ctx.lineTo(-m.r * 0.4, -m.r * 0.4);
            ctx.closePath();
            ctx.stroke();
          }
          ctx.restore();

          // Check hit with lasers
          let mineHit = false;
          for (let li = lasers.length - 1; li >= 0; li--) {
            const l = lasers[li];
            if (Math.hypot(l.x - m.x, l.y - m.y) < m.r + 3) {
              lasers.splice(li, 1);
              mineHit = true;
              break;
            }
          }

          if (mineHit) {
            soundFx.playChime();
            addVectorExplosion(m.x, m.y, 8, m.type.includes('magnetic') ? '#f59e0b' : m.type === 'fireball_mine' ? '#ef4444' : '#00ffcc');

            // Splitting logic (Authentic Mine Storm)
            if (m.type === 'floating_large') {
              addScore(25);
              // Split into 2 small floating mines
              newMines.push({
                id: nextMineId++,
                type: 'floating_small',
                x: m.x + 8,
                y: m.y + 8,
                vx: m.vx * 1.3 + (Math.random() - 0.5) * 0.6,
                vy: m.vy * 1.3 + (Math.random() - 0.5) * 0.6,
                r: 9,
                angle: m.angle,
                rotSpeed: 0.05,
              });
              newMines.push({
                id: nextMineId++,
                type: 'floating_small',
                x: m.x - 8,
                y: m.y - 8,
                vx: -m.vx * 1.3 + (Math.random() - 0.5) * 0.6,
                vy: -m.vy * 1.3 + (Math.random() - 0.5) * 0.6,
                r: 9,
                angle: m.angle + Math.PI,
                rotSpeed: -0.05,
              });
            } else if (m.type === 'floating_small') {
              addScore(50);
            } else if (m.type === 'magnetic_large') {
              addScore(40);
              // Split into 2 small magnetic mines
              newMines.push({
                id: nextMineId++,
                type: 'magnetic_small',
                x: m.x + 8,
                y: m.y + 8,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                r: 9,
                angle: m.angle,
                rotSpeed: 0.06,
              });
              newMines.push({
                id: nextMineId++,
                type: 'magnetic_small',
                x: m.x - 8,
                y: m.y - 8,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                r: 9,
                angle: m.angle + Math.PI,
                rotSpeed: -0.06,
              });
            } else if (m.type === 'magnetic_small') {
              addScore(80);
            } else if (m.type === 'fireball_mine') {
              addScore(75);
              // Fireball project launched at ship!
              const angleToShip = Math.atan2(ship.y - m.y, ship.x - m.x);
              fireballs.push({
                x: m.x,
                y: m.y,
                vx: Math.cos(angleToShip) * 3.8,
                vy: Math.sin(angleToShip) * 3.8,
                life: 90,
              });
            }

            mines.splice(i, 1);
            continue;
          }

          // Check hit with ship
          if (shieldTimer <= 0 && Math.hypot(ship.x - m.x, ship.y - m.y) < m.r + 9) {
            addVectorExplosion(ship.x, ship.y, 16, '#00ffcc');
            soundFx.playError();
            lives--;
            if (lives <= 0) {
              gameActive = false;
              triggerGameOver();
              return;
            }
            ship.x = 200;
            ship.y = 200;
            ship.vx = 0;
            ship.vy = 0;
            shieldTimer = 90;
            break;
          }
        }

        mines.push(...newMines);

        // Vector line explosions (Debris) - zero shadowBlur during debris pass for 60fps performance
        ctx.shadowBlur = 0;
        for (let i = debris.length - 1; i >= 0; i--) {
          const d = debris[i];
          d.x += d.vx;
          d.y += d.vy;
          d.life--;

          const alpha = d.life / d.maxLife;
          ctx.strokeStyle = d.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + Math.cos(d.angle) * (d.len * alpha), d.y + Math.sin(d.angle) * (d.len * alpha));
          ctx.stroke();

          if (d.life <= 0) debris.splice(i, 1);
        }
        ctx.globalAlpha = 1.0;

        // Vector CRT HUD (Score, Field, Escapes, Lives)
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = glowColor;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`FIELD ${field}`, 20, 26);
        ctx.fillText(`FUITE: ${escapesLeft}`, width - 85, 26);

        // Mini vector ship icons for remaining lives
        for (let li = 0; li < lives; li++) {
          ctx.save();
          ctx.translate(25 + li * 16, height - 20);
          ctx.rotate(-Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(-6, -5);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-6, 5);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }

        // Wave cleared check
        if (mines.length === 0 && fireballs.length === 0) {
          fieldClearTimer++;
          ctx.fillStyle = primaryColor;
          ctx.shadowColor = glowColor;
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`FIELD ${field} CLEARED!`, width / 2, height / 2);
          ctx.textAlign = 'left';

          if (fieldClearTimer === 1) {
            soundFx.playVictory();
            addScore(150 + field * 50);
          }

          if (fieldClearTimer > 75) {
            fieldClearTimer = 0;
            field++;
            escapesLeft = 3; // Replenish escapes
            shieldTimer = 90;
            ship.x = 200;
            ship.y = 200;
            ship.vx = 0;
            ship.vy = 0;
            spawnFieldMines(field);
          }
        }
      };

      startFixedLoop(() => gameActive, loop);
    }

    return () => {
      stopAllLoops();
      if (customCleanup) customCleanup();
    };
  }, [isOpen, selectedGame, gameKey, saveHighScore, difficulty]);

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
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentGameMeta =
    ARCADE_GAMES.find((g) => g.id === selectedGame) || ARCADE_GAMES[0];

  // Continuous touch / mouse press handlers for virtual controls
  const handleVirtualPress = (code: string) => {
    keyboardKeysRef.current.add(code);
    keysDownRef.current.add(code);
    window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }));
  };
  const handleVirtualRelease = (code: string) => {
    keyboardKeysRef.current.delete(code);
    keysDownRef.current.delete(code);
    window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true }));
  };

  const bindVirtualTouch = (code: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      handleVirtualPress(code);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      handleVirtualRelease(code);
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault();
      handleVirtualRelease(code);
    },
    onMouseDown: () => handleVirtualPress(code),
    onMouseUp: () => handleVirtualRelease(code),
    onMouseLeave: () => handleVirtualRelease(code),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
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

        {/* Game Tabs Selector */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin scrollbar-thumb-amber-500/30">
          {isGamepadConnected && (
            <span
              className="shrink-0 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold"
              title={`Gâchette ${labels.lb} : Borne précédente`}
            >
              {labels.lb}
            </span>
          )}
          {ARCADE_GAMES.map((game) => {
            const active = selectedGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => selectGame(game.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-[#0b0f19] text-slate-300 border border-[#1e293b] hover:border-amber-500/40 hover:text-white'
                }`}
              >
                <span>{game.icon}</span>
                <span>{game.name}</span>
              </button>
            );
          })}
          {isGamepadConnected && (
            <span
              className="shrink-0 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold"
              title={`Gâchette ${labels.rb} : Borne suivante`}
            >
              {labels.rb}
            </span>
          )}
        </div>

        {/* Score & Controls Bar */}
        <div className="w-full max-w-[380px] flex items-center justify-between px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl mb-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <span>Score :</span>
            <span className="font-mono text-amber-400 text-sm font-black">{score}</span>
          </div>

          <button
            onClick={() => onOpenLeaderboard?.(selectedGame)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition cursor-pointer"
            title="Voir le classement mondial de ce jeu"
          >
            <Trophy className={`w-3.5 h-3.5 ${selectedGame === 'vectrex' && isVectrexPhosphor ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>Record :</span>
            <span className={`font-mono font-bold ${selectedGame === 'vectrex' && isVectrexPhosphor ? 'text-emerald-400' : 'text-white'}`}>
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

        {/* Canvas Game Area with Direct Touch / Swipe Support */}
        <div className="relative w-full max-w-[320px] sm:max-w-[380px] aspect-square rounded-2xl overflow-hidden border-2 border-[#1e293b] bg-[#060f09] shadow-2xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
            onTouchCancel={handleCanvasTouchEnd}
            className="block w-full h-full cursor-pointer touch-none select-none"
          />

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
