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
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export type ArcadeGameId =
  | 'snake'
  | 'pong'
  | 'breakout'
  | 'flappy'
  | 'invaders'
  | 'run'
  | 'tetris'
  | 'vectrex';

interface ArcadeGameMeta {
  id: ArcadeGameId;
  name: string;
  icon: string;
  instructions: string;
}

const ARCADE_GAMES: ArcadeGameMeta[] = [
  {
    id: 'snake',
    name: 'Snake Doré',
    icon: '🐍',
    instructions: 'Flèches directionnelles (ou ZQSD). Mange les lucioles sans heurter les murs ni ta queue !',
  },
  {
    id: 'pong',
    name: 'Pong Magique',
    icon: '🏓',
    instructions: 'Flèches HAUT / BAS pour bouger. ESPACE pour lancer la balle magique.',
  },
  {
    id: 'breakout',
    name: 'Casse-Briques',
    icon: '🧱',
    instructions: 'Flèches GAUCHE / DROITE pour déplacer la barre. ESPACE pour lancer la bille.',
  },
  {
    id: 'flappy',
    name: 'Flappy Hibou',
    icon: '🦉',
    instructions: 'ESPACE, HAUT ou Clic pour faire battre les ailes du hibou et franchir les colonnes.',
  },
  {
    id: 'invaders',
    name: 'Hibou Invaders',
    icon: '🚀',
    instructions: 'Flèches GAUCHE / DROITE pour bouger. ESPACE pour tirer des salves laser dorées.',
  },
  {
    id: 'run',
    name: 'Forest Run',
    icon: '🦘',
    instructions: 'ESPACE, HAUT ou Clic pour sauter par-dessus les ronces et obstacles de la sylve.',
  },
  {
    id: 'tetris',
    name: 'Tetris Mystique',
    icon: '🧩',
    instructions: 'Flèches GAUCHE/DROITE pour bouger, HAUT pour faire pivoter, BAS pour accélérer.',
  },
  {
    id: 'vectrex',
    name: 'Mine Storm Vectrex',
    icon: '⚡',
    instructions: 'Flèches GAUCHE/DROITE pour pivoter, HAUT pour propulser le vaisseau, ESPACE pour tirer.',
  },
];

interface ArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGame?: ArcadeGameId;
}

export const ArcadeModal: React.FC<ArcadeModalProps> = ({
  isOpen,
  onClose,
  initialGame = 'snake',
}) => {
  const [selectedGame, setSelectedGame] = useState<ArcadeGameId>(initialGame);
  const [gameKey, setGameKey] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(`hoot_arcade_hs_${initialGame}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [soundMuted, setSoundMuted] = useState<boolean>(!soundFx.isEnabled());
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);

  // Persistent inputs state (supports holding keys & touch)
  const keysDownRef = useRef<Set<string>>(new Set());
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

    const isKeyDown = (codes: string[]) => {
      for (const c of codes) {
        if (keysDownRef.current.has(c)) return true;
      }
      return false;
    };

    const addScore = (pts: number) => {
      scoreRef.current += pts;
      setScore(scoreRef.current);
      saveHighScore(scoreRef.current);
    };

    const triggerGameOver = () => {
      setIsGameOver(true);
      soundFx.playError();
      stopAllLoops();
    };

    let customCleanup: (() => void) | null = null;

    // Fixed 60 FPS loop runner (immune to 120Hz/144Hz/240Hz screen over-speeding)
    const startFixedLoop = (isActive: () => boolean, updateAndRender: () => void) => {
      let lastTime = performance.now();
      const targetInterval = 1000 / 60; // 16.666 ms
      const runner = (now: number) => {
        if (!isActive()) return;
        const elapsed = now - lastTime;
        if (elapsed >= targetInterval - 1.5) {
          lastTime = now - (elapsed % targetInterval);
          updateAndRender();
        }
        if (isActive()) {
          animFrameIdRef.current = requestAnimationFrame(runner);
        }
      };
      animFrameIdRef.current = requestAnimationFrame(runner);
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

          if (isKeyDown(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyZ', 'KeyQ', 'Space'])) {
            started = true;
            soundFx.playClick();
          }
          return;
        }

        // Direction mapping (Arrows + ZQSD / WASD)
        if ((isKeyDown(['ArrowUp', 'KeyW', 'KeyZ'])) && dir !== 'DOWN') nextDir = 'UP';
        if ((isKeyDown(['ArrowDown', 'KeyS'])) && dir !== 'UP') nextDir = 'DOWN';
        if ((isKeyDown(['ArrowLeft', 'KeyA', 'KeyQ'])) && dir !== 'RIGHT') nextDir = 'LEFT';
        if ((isKeyDown(['ArrowRight', 'KeyD'])) && dir !== 'LEFT') nextDir = 'RIGHT';

        dir = nextDir;

        let headX = snake[0].x;
        let headY = snake[0].y;

        if (dir === 'LEFT') headX -= gridSize;
        if (dir === 'UP') headY -= gridSize;
        if (dir === 'RIGHT') headX += gridSize;
        if (dir === 'DOWN') headY += gridSize;

        // Collision detection
        if (
          headX < 0 ||
          headX >= width ||
          headY < 0 ||
          headY >= height ||
          snake.some((seg) => seg.x === headX && seg.y === headY)
        ) {
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

      intervalIdRef.current = window.setInterval(step, 145);
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
      let ball = { x: 200, y: 200, r: 7, vx: 2.8, vy: 1.6 };
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

        // Player controls
        if (isKeyDown(['ArrowUp', 'KeyW', 'KeyZ']) && leftY > 0) leftY -= 4.8;
        if (isKeyDown(['ArrowDown', 'KeyS']) && leftY < height - padH) leftY += 4.8;

        // Launch ball on space or arrow press
        if (!started && (isKeyDown(['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS']))) {
          started = true;
          soundFx.playClick();
        }

        if (started) {
          // Adaptive AI
          const aiSpeed = 2.2 + leftScore * 0.12;
          if (ball.y < rightY + padH / 2 - 5) rightY -= aiSpeed;
          else if (ball.y > rightY + padH / 2 + 5) rightY += aiSpeed;
          rightY = Math.max(0, Math.min(height - padH, rightY));

          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall bounce
          if (ball.y - ball.r <= 0 || ball.y + ball.r >= height) {
            ball.vy *= -1;
            soundFx.playClick();
          }

          // Left paddle hit
          if (
            ball.x - ball.r <= 25 &&
            ball.x - ball.r >= 10 &&
            ball.y >= leftY &&
            ball.y <= leftY + padH &&
            ball.vx < 0
          ) {
            ball.vx = Math.abs(ball.vx) * 1.02;
            const delta = (ball.y - (leftY + padH / 2)) / (padH / 2);
            ball.vy = delta * 3.2;
            ball.x = 25 + ball.r;
            addScore(1);
            soundFx.playChime();
          }

          // Right paddle hit
          if (
            ball.x + ball.r >= width - 25 &&
            ball.x + ball.r <= width - 10 &&
            ball.y >= rightY &&
            ball.y <= rightY + padH &&
            ball.vx > 0
          ) {
            ball.vx = -Math.abs(ball.vx) * 1.02;
            const delta = (ball.y - (rightY + padH / 2)) / (padH / 2);
            ball.vy = delta * 3.2;
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
            ball = { x: 200, y: 200, r: 7, vx: 2.8, vy: (Math.random() - 0.5) * 3 };
            started = false;
          } else if (ball.x > width) {
            leftScore++;
            soundFx.playVictory();
            ball = { x: 200, y: 200, r: 7, vx: -2.8, vy: (Math.random() - 0.5) * 3 };
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
    else if (selectedGame === 'breakout') {
      const padW = 80;
      const padH = 10;
      let padX = width / 2 - padW / 2;
      let ball = { x: 200, y: 350, r: 6, vx: 2.4, vy: -2.6 };
      let started = false;
      let gameActive = true;

      const rows = 5;
      const cols = 6;
      const bW = 52;
      const bH = 18;
      const padding = 8;
      const offLeft = 22;
      const offTop = 30;

      const bricks: Array<Array<{ x: number; y: number; active: boolean }>> = [];
      for (let c = 0; c < cols; c++) {
        bricks[c] = [];
        for (let r = 0; r < rows; r++) {
          bricks[c][r] = {
            x: c * (bW + padding) + offLeft,
            y: r * (bH + padding) + offTop,
            active: true,
          };
        }
      }

      const loop = () => {
        if (!gameActive) return;

        if (isKeyDown(['ArrowLeft', 'KeyA', 'KeyQ']) && padX > 0) padX -= 4.8;
        if (isKeyDown(['ArrowRight', 'KeyD']) && padX < width - padW) padX += 4.8;

        if (!started) {
          ball.x = padX + padW / 2;
          ball.y = height - 35;
          if (isKeyDown(['Space', 'ArrowUp'])) {
            started = true;
            soundFx.playClick();
          }
        } else {
          ball.x += ball.vx;
          ball.y += ball.vy;

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
          if (ball.y - ball.r <= 0) {
            ball.y = ball.r;
            ball.vy = Math.abs(ball.vy);
            soundFx.playClick();
          } else if (ball.y - ball.r > height) {
            gameActive = false;
            triggerGameOver();
            return;
          }

          // Paddle collision
          if (
            ball.y + ball.r >= height - 25 &&
            ball.y - ball.r <= height - 15 &&
            ball.x >= padX &&
            ball.x <= padX + padW &&
            ball.vy > 0
          ) {
            ball.vy = -Math.abs(ball.vy);
            const hit = (ball.x - (padX + padW / 2)) / (padW / 2);
            ball.vx = hit * 3.2;
            soundFx.playClick();
          }

          // Bricks collision
          let remaining = 0;
          for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
              const b = bricks[c][r];
              if (b.active) {
                remaining++;
                if (
                  ball.x + ball.r > b.x &&
                  ball.x - ball.r < b.x + bW &&
                  ball.y + ball.r > b.y &&
                  ball.y - ball.r < b.y + bH
                ) {
                  b.active = false;
                  ball.vy *= -1;
                  addScore(10);
                  soundFx.playChime();
                }
              }
            }
          }

          if (remaining === 0) {
            soundFx.playVictory();
            addScore(100);
            gameActive = false;
            setIsGameOver(true);
            return;
          }
        }

        // Draw
        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Bricks
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const b = bricks[c][r];
            if (b.active) {
              ctx.fillStyle = r % 2 === 0 ? '#f59e0b' : '#10b981';
              ctx.fillRect(b.x, b.y, bW, bH);
            }
          }
        }

        // Paddle
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(padX, height - 25, padW, padH);

        // Ball
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!started) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Appuyez sur ESPACE ou Clic pour lancer la bille', width / 2, height / 2 + 50);
          ctx.textAlign = 'left';
        }
      };

      canvas.onclick = () => {
        if (!started) {
          started = true;
          soundFx.playClick();
        }
      };

      startFixedLoop(() => gameActive, loop);
    }

    // ==========================================
    // 4. FLAPPY HIBOU
    // ==========================================
    else if (selectedGame === 'flappy') {
      let bird = { y: 200, vy: 0, gravity: 0.22, jump: -4.4 };
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

        if (isKeyDown(['Space', 'ArrowUp', 'KeyW', 'KeyZ'])) {
          started = true;
          bird.vy = bird.jump;
          soundFx.playClick();
          // Clear jump key so player must release and re-press
          keysDownRef.current.delete('Space');
          keysDownRef.current.delete('ArrowUp');
          keysDownRef.current.delete('KeyW');
          keysDownRef.current.delete('KeyZ');
        }

        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        if (started) {
          frame++;
          bird.vy += bird.gravity;
          bird.y += bird.vy;

          // Spawn pipes
          if (frame % 115 === 0) {
            const gap = 138;
            const top = Math.random() * (height - gap - 80) + 40;
            pipes.push({ x: width, w: 45, top, gap, passed: false });
          }

          // Move pipes & test collision
          for (let i = pipes.length - 1; i >= 0; i--) {
            const p = pipes[i];
            p.x -= 1.6;

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
      let playerX = 185;
      interface Bullet {
        x: number;
        y: number;
      }
      interface Invader {
        x: number;
        y: number;
        alive: boolean;
        icon: string;
      }
      let bullets: Bullet[] = [];
      let invaders: Invader[] = [];
      let shootTimer = 0;
      let direction = 1;
      let gameActive = true;
      let started = false;

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 7; c++) {
          invaders.push({
            x: 40 + c * 45,
            y: 40 + r * 35,
            alive: true,
            icon: r % 2 === 0 ? '👾' : '🛸',
          });
        }
      }

      canvas.onclick = () => {
        started = true;
        if (shootTimer <= 0) {
          bullets.push({ x: playerX, y: height - 40 });
          shootTimer = 18;
          soundFx.playClick();
        }
      };

      const loop = () => {
        if (!gameActive) return;
        shootTimer--;

        if (!started) {
          ctx.fillStyle = '#060f09';
          ctx.fillRect(0, 0, width, height);

          // Player (Owl)
          ctx.font = '28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🦉', playerX, height - 20);

          // Invaders
          for (const inv of invaders) {
            ctx.fillText(inv.icon, inv.x, inv.y);
          }

          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Appuyez sur ESPACE ou Clic pour attaquer', width / 2, height / 2 + 50);
          ctx.textAlign = 'left';

          if (isKeyDown(['Space', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyQ'])) {
            started = true;
          }
          return;
        }

        if (isKeyDown(['ArrowLeft', 'KeyA', 'KeyQ']) && playerX > 20) playerX -= 3.8;
        if (isKeyDown(['ArrowRight', 'KeyD']) && playerX < width - 20) playerX += 3.8;

        if (isKeyDown(['Space']) && shootTimer <= 0) {
          bullets.push({ x: playerX, y: height - 40 });
          shootTimer = 18;
          soundFx.playClick();
        }

        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Player (Owl)
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦉', playerX, height - 20);

        // Bullets
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.y -= 5.2;
          ctx.fillRect(b.x - 2, b.y, 4, 12);
          if (b.y < 0) bullets.splice(i, 1);
        }
        ctx.shadowBlur = 0;

        let hitEdge = false;
        let aliveCount = 0;

        for (const inv of invaders) {
          if (!inv.alive) continue;
          aliveCount++;
          inv.x += direction * 0.36;
          if (inv.x > width - 25 || inv.x < 25) hitEdge = true;

          ctx.fillText(inv.icon, inv.x, inv.y);

          // Hit test
          for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            if (Math.abs(b.x - inv.x) < 16 && Math.abs(b.y - inv.y) < 16) {
              inv.alive = false;
              bullets.splice(i, 1);
              addScore(10);
              soundFx.playChime();
              break;
            }
          }

          if (inv.y > height - 60) {
            gameActive = false;
            triggerGameOver();
            return;
          }
        }

        if (hitEdge) {
          direction *= -1;
          for (const inv of invaders) inv.y += 8;
        }

        // Wave cleared -> respawn stronger
        if (aliveCount === 0) {
          soundFx.playVictory();
          addScore(100);
          for (const inv of invaders) {
            inv.alive = true;
            inv.y = Math.max(40, inv.y - 50);
          }
        }
      };

      startFixedLoop(() => gameActive, loop);
    }

    // ==========================================
    // 6. FOREST RUN
    // ==========================================
    else if (selectedGame === 'run') {
      let player = { y: 340, vy: 0, gravity: 0.42, jump: -8.2, onGround: true };
      interface Obstacle {
        x: number;
        w: number;
        h: number;
      }
      let obstacles: Obstacle[] = [];
      let frame = 0;
      let gameActive = true;
      let started = false;

      canvas.onclick = () => {
        if (!started) {
          started = true;
          player.vy = player.jump;
          player.onGround = false;
          soundFx.playClick();
        } else if (player.onGround) {
          player.vy = player.jump;
          player.onGround = false;
          soundFx.playClick();
        }
      };

      const loop = () => {
        if (!gameActive) return;

        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Ground
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 355);
        ctx.lineTo(width, 355);
        ctx.stroke();

        // Runner Owl
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦉', 60, player.y);

        if (!started) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Appuyez sur ESPACE ou Clic pour courir', width / 2, height / 2);
          ctx.textAlign = 'left';

          if (isKeyDown(['Space', 'ArrowUp', 'KeyW', 'KeyZ'])) {
            started = true;
            player.vy = player.jump;
            player.onGround = false;
            soundFx.playClick();
          }
          return;
        }

        frame++;

        if (frame % 10 === 0) {
          addScore(1);
        }

        if (isKeyDown(['Space', 'ArrowUp', 'KeyW', 'KeyZ']) && player.onGround) {
          player.vy = player.jump;
          player.onGround = false;
          soundFx.playClick();
        }

        // Physics
        player.vy += player.gravity;
        player.y += player.vy;
        if (player.y >= 340) {
          player.y = 340;
          player.vy = 0;
          player.onGround = true;
        }

        // Spawn obstacles
        if (frame % 120 === 0 || (frame > 350 && Math.random() < 0.01 && frame % 40 !== 0)) {
          obstacles.push({ x: width, w: 22, h: 32 });
        }

        // Obstacles
        ctx.fillStyle = '#f59e0b';
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= 2.4 + scoreRef.current / 4000;
          ctx.fillRect(obs.x, 355 - obs.h, obs.w, obs.h);

          // Hit test
          if (
            60 + 10 > obs.x &&
            60 - 10 < obs.x + obs.w &&
            player.y > 355 - obs.h
          ) {
            gameActive = false;
            triggerGameOver();
            return;
          }

          if (obs.x + obs.w < 0) obstacles.splice(i, 1);
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
      let dropInterval = 750;

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
          if (board[r].every((val) => val !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(cols).fill(0));
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

      const draw = () => {
        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Board
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (board[r][c] !== 0) {
              ctx.fillStyle = colors[board[r][c]] || '#f59e0b';
              ctx.fillRect(c * bSize + 100, r * bSize, bSize - 1, bSize - 1);
            }
          }
        }

        // Current piece
        for (let r = 0; r < curPiece.length; r++) {
          for (let c = 0; c < curPiece[r].length; c++) {
            if (curPiece[r][c] !== 0) {
              ctx.fillStyle = colors[curColor] || '#f59e0b';
              ctx.fillRect((pX + c) * bSize + 100, (pY + r) * bSize, bSize - 1, bSize - 1);
            }
          }
        }
      };

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
    // 8. MINE STORM VECTREX REVIVAL (1982)
    // ==========================================
    else if (selectedGame === 'vectrex') {
      let ship = { x: 200, y: 200, vx: 0, vy: 0, angle: -Math.PI / 2 };
      interface Laser {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
      }
      interface Mine {
        x: number;
        y: number;
        vx: number;
        vy: number;
        r: number;
      }
      let lasers: Laser[] = [];
      let mines: Mine[] = [];
      let shootTimer = 0;
      let gameActive = true;
      let shieldTimer = 100; // ~1.6s safe spawn shield

      // Safe spawn avoiding ship at center (200, 200)
      const spawnMines = (count: number, baseSpeed: number) => {
        for (let i = 0; i < count; i++) {
          let mx = 0;
          let my = 0;
          do {
            mx = Math.random() * width;
            my = Math.random() * height;
          } while (Math.hypot(mx - 200, my - 200) < 110);

          mines.push({
            x: mx,
            y: my,
            vx: (Math.random() - 0.5) * baseSpeed,
            vy: (Math.random() - 0.5) * baseSpeed,
            r: 16,
          });
        }
      };

      spawnMines(5, 0.75);

      canvas.onclick = () => {
        if (shootTimer <= 0) {
          lasers.push({
            x: ship.x,
            y: ship.y,
            vx: Math.cos(ship.angle) * 5.5 + ship.vx,
            vy: Math.sin(ship.angle) * 5.5 + ship.vy,
            life: 45,
          });
          shootTimer = 15;
          soundFx.playClick();
        }
      };

      const loop = () => {
        if (!gameActive) return;
        shootTimer--;

        if (isKeyDown(['ArrowLeft', 'KeyA', 'KeyQ'])) ship.angle -= 0.048;
        if (isKeyDown(['ArrowRight', 'KeyD'])) ship.angle += 0.048;
        if (isKeyDown(['ArrowUp', 'KeyW', 'KeyZ'])) {
          ship.vx += Math.cos(ship.angle) * 0.09;
          ship.vy += Math.sin(ship.angle) * 0.09;
        }

        // Friction & Move
        ship.vx *= 0.972;
        ship.vy *= 0.972;
        ship.x += ship.vx;
        ship.y += ship.vy;

        // Wrap boundaries
        if (ship.x < 0) ship.x = width;
        if (ship.x > width) ship.x = 0;
        if (ship.y < 0) ship.y = height;
        if (ship.y > height) ship.y = 0;

        // Shoot laser
        if (isKeyDown(['Space']) && shootTimer <= 0) {
          lasers.push({
            x: ship.x,
            y: ship.y,
            vx: Math.cos(ship.angle) * 5.5 + ship.vx,
            vy: Math.sin(ship.angle) * 5.5 + ship.vy,
            life: 45,
          });
          shootTimer = 15;
          soundFx.playClick();
        }

        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, width, height);

        // Phosphor vector glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffcc';
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;

        // Draw Ship
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-12, -10);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Draw Spawn Shield
        if (shieldTimer > 0) {
          shieldTimer--;
          if (Math.floor(shieldTimer / 6) % 2 === 0) {
            ctx.strokeStyle = '#00ffcc';
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, 22, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Lasers
        ctx.shadowColor = '#f59e0b';
        ctx.strokeStyle = '#f59e0b';
        for (let i = lasers.length - 1; i >= 0; i--) {
          const l = lasers[i];
          l.x += l.vx;
          l.y += l.vy;
          l.life--;
          ctx.beginPath();
          ctx.arc(l.x, l.y, 2, 0, Math.PI * 2);
          ctx.stroke();
          if (l.life <= 0) lasers.splice(i, 1);
        }

        // Mines
        ctx.shadowColor = '#ff0055';
        ctx.strokeStyle = '#ff0055';
        for (let i = mines.length - 1; i >= 0; i--) {
          const m = mines[i];
          m.x += m.vx;
          m.y += m.vy;

          if (m.x < 0) m.x = width;
          if (m.x > width) m.x = 0;
          if (m.y < 0) m.y = height;
          if (m.y > height) m.y = 0;

          // Draw vector polygon mine
          ctx.beginPath();
          for (let j = 0; j < 8; j++) {
            const rad = (j * Math.PI) / 4;
            const dist = j % 2 === 0 ? m.r : m.r / 2;
            const px = m.x + Math.cos(rad) * dist;
            const py = m.y + Math.sin(rad) * dist;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();

          // Hit test lasers
          for (let li = lasers.length - 1; li >= 0; li--) {
            const l = lasers[li];
            const dist = Math.hypot(l.x - m.x, l.y - m.y);
            if (dist < m.r) {
              soundFx.playChime();
              addScore(25);
              lasers.splice(li, 1);
              mines.splice(i, 1);
              break;
            }
          }

          // Hit test ship (only if shield expired)
          if (shieldTimer <= 0) {
            const shipDist = Math.hypot(ship.x - m.x, ship.y - m.y);
            if (shipDist < m.r + 8) {
              gameActive = false;
              triggerGameOver();
              return;
            }
          }
        }

        ctx.shadowBlur = 0;

        // Respawn wave
        if (mines.length === 0) {
          soundFx.playVictory();
          addScore(100);
          spawnMines(7, 0.95);
          shieldTimer = 70;
        }
      };

      startFixedLoop(() => gameActive, loop);
    }

    return () => {
      stopAllLoops();
      if (customCleanup) customCleanup();
    };
  }, [isOpen, selectedGame, gameKey, saveHighScore]);

  // Global Key Listener for modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysDownRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const keysDown = keysDownRef.current;
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysDown.clear();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentGameMeta =
    ARCADE_GAMES.find((g) => g.id === selectedGame) || ARCADE_GAMES[0];

  // Continuous touch / mouse press handlers for virtual controls
  const handleVirtualPress = (code: string) => {
    keysDownRef.current.add(code);
    window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }));
  };
  const handleVirtualRelease = (code: string) => {
    keysDownRef.current.delete(code);
    window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#131a29] via-[#0e1524] to-[#070b12] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col items-center overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-lg select-none">
              🕹️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                La Salle d'Arcade Secrète
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
                  Hibouxe
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                8 mini-jeux rétro jouables directement dans le navigateur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-thin scrollbar-thumb-amber-500/30">
          {ARCADE_GAMES.map((game) => {
            const active = selectedGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => selectGame(game.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-[#131a29] text-slate-300 border border-[#1e293b] hover:border-amber-500/40 hover:text-white'
                }`}
              >
                <span>{game.icon}</span>
                <span>{game.name}</span>
              </button>
            );
          })}
        </div>

        {/* Score & Controls Bar */}
        <div className="w-full max-w-[400px] flex items-center justify-between px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <span>Score :</span>
            <span className="font-mono text-amber-400 text-sm font-black">{score}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Record :</span>
            <span className="font-mono text-white font-bold">{highScore}</span>
          </div>

          <button
            onClick={restartCurrentGame}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition cursor-pointer"
            title="Recommencer la partie"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Rejouer</span>
          </button>
        </div>

        {/* Canvas Game Area */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#1e293b] bg-[#060f09] shadow-2xl">
          <canvas
            ref={canvasRef}
            className="block w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] cursor-pointer touch-none"
          />

          {isGameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <span className="text-4xl mb-2">💥</span>
              <h3 className="text-xl font-black text-white mb-1 tracking-wider uppercase">
                Partie Terminée
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                Score final : <span className="font-black text-amber-400 font-mono text-base">{score}</span>
              </p>
              <button
                onClick={restartCurrentGame}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Rejouer Immédiatement
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-[11px] text-slate-400 text-center mt-3 max-w-[400px] leading-relaxed">
          <Sparkles className="w-3 h-3 text-amber-400 inline mr-1" />
          {currentGameMeta.instructions}
        </p>

        {/* Virtual Arcade D-Pad Controls (Continuous Hold Support) */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#1e293b] w-full max-w-[400px] select-none">
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              onTouchStart={() => handleVirtualPress('ArrowUp')}
              onTouchEnd={() => handleVirtualRelease('ArrowUp')}
              onMouseDown={() => handleVirtualPress('ArrowUp')}
              onMouseUp={() => handleVirtualRelease('ArrowUp')}
              className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />
            <button
              onTouchStart={() => handleVirtualPress('ArrowLeft')}
              onTouchEnd={() => handleVirtualRelease('ArrowLeft')}
              onMouseDown={() => handleVirtualPress('ArrowLeft')}
              onMouseUp={() => handleVirtualRelease('ArrowLeft')}
              className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onTouchStart={() => handleVirtualPress('ArrowDown')}
              onTouchEnd={() => handleVirtualRelease('ArrowDown')}
              onMouseDown={() => handleVirtualPress('ArrowDown')}
              onMouseUp={() => handleVirtualRelease('ArrowDown')}
              className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onTouchStart={() => handleVirtualPress('ArrowRight')}
              onTouchEnd={() => handleVirtualRelease('ArrowRight')}
              onMouseDown={() => handleVirtualPress('ArrowRight')}
              onMouseUp={() => handleVirtualRelease('ArrowRight')}
              className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onTouchStart={() => handleVirtualPress('Space')}
            onTouchEnd={() => handleVirtualRelease('Space')}
            onMouseDown={() => handleVirtualPress('Space')}
            onMouseUp={() => handleVirtualRelease('Space')}
            className="px-6 py-4 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/20 active:bg-amber-400 touch-none select-none cursor-pointer"
          >
            Action
          </button>
        </div>
      </div>
    </div>
  );
};
