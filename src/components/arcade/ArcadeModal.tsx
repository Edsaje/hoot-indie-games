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
    instructions: 'Flèches directionnelles pour diriger le serpent. Mange les lucioles sans toucher les murs ni ta queue !',
  },
  {
    id: 'pong',
    name: 'Pong Magique',
    icon: '🏓',
    instructions: 'Flèches HAUT / BAS pour déplacer ta raquette. ESPACE pour engager la balle magique.',
  },
  {
    id: 'breakout',
    name: 'Casse-Briques',
    icon: '🧱',
    instructions: 'Flèches GAUCHE / DROITE pour déplacer la barre. ESPACE pour lancer la balle dorée.',
  },
  {
    id: 'flappy',
    name: 'Flappy Hibou',
    icon: '🦉',
    instructions: 'ESPACE ou Clic pour faire battre les ailes du hibou et franchir les colonnes d\'arbres.',
  },
  {
    id: 'invaders',
    name: 'Hibou Invaders',
    icon: '🚀',
    instructions: 'Flèches GAUCHE / DROITE pour déplacer ton vaisseau. ESPACE pour tirer des salves laser.',
  },
  {
    id: 'run',
    name: 'Forest Run',
    icon: '🦘',
    instructions: 'ESPACE ou Clic pour sauter par-dessus les ronces et obstacles nocturnes.',
  },
  {
    id: 'tetris',
    name: 'Tetris Mystique',
    icon: '🧩',
    instructions: 'Flèches GAUCHE / DROITE pour bouger, HAUT pour faire pivoter, BAS pour accélérer la chute.',
  },
  {
    id: 'vectrex',
    name: 'Mine Storm Vectrex',
    icon: '⚡',
    instructions: 'Flèches GAUCHE/DROITE pour pivoter, HAUT pour propulser, ESPACE pour détruire les mines.',
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
  const [prevInitial, setPrevInitial] = useState<ArcadeGameId>(initialGame);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`hoot_arcade_hs_${initialGame}`) : null;
    return saved ? parseInt(saved, 10) : 0;
  });

  if (initialGame !== prevInitial) {
    setPrevInitial(initialGame);
    setSelectedGame(initialGame);
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`hoot_arcade_hs_${initialGame}`) : null;
    setHighScore(saved ? parseInt(saved, 10) : 0);
  }

  const [score, setScore] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(!soundFx.isEnabled());
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);

  const updateHighScore = useCallback(
    (newScore: number) => {
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem(`hoot_arcade_hs_${selectedGame}`, String(newScore));
      }
    },
    [highScore, selectedGame]
  );

  const stopAllLoops = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  // Keyboard dispatcher
  const keyHandlersRef = useRef<{
    onKeyDown: (e: KeyboardEvent) => void;
    onKeyUp: (e: KeyboardEvent) => void;
  }>({
    onKeyDown: () => {},
    onKeyUp: () => {},
  });

  // Start the currently selected game on the canvas
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
    setIsGameOver(false);
    setScore(0);

    const width = 400;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // --- GAME 1: SNAKE DORÉ ---
    if (selectedGame === 'snake') {
      const gridSize = 20;
      let snake = [
        { x: 10 * gridSize, y: 10 * gridSize },
        { x: 9 * gridSize, y: 10 * gridSize },
      ];
      let dir = 'RIGHT';
      let nextDir = 'RIGHT';
      let currentScore = 0;
      let food = { x: 14 * gridSize, y: 10 * gridSize };
      let running = true;

      const spawnFood = () => {
        const maxX = width / gridSize - 1;
        const maxY = height / gridSize - 1;
        food = {
          x: Math.floor(Math.random() * maxX) * gridSize,
          y: Math.floor(Math.random() * maxY) * gridSize,
        };
      };

      const step = () => {
        if (!running) return;
        dir = nextDir;

        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Food (Golden firefly)
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
            // Eye
            ctx.fillStyle = '#0b0f19';
            ctx.fillRect(seg.x + 5, seg.y + 5, 4, 4);
          } else {
            ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#059669';
            ctx.fillRect(seg.x + 1, seg.y + 1, gridSize - 2, gridSize - 2);
          }
        });

        let headX = snake[0].x;
        let headY = snake[0].y;

        if (dir === 'LEFT') headX -= gridSize;
        if (dir === 'UP') headY -= gridSize;
        if (dir === 'RIGHT') headX += gridSize;
        if (dir === 'DOWN') headY += gridSize;

        // Eat food
        if (headX === food.x && headY === food.y) {
          currentScore += 10;
          setScore(currentScore);
          updateHighScore(currentScore);
          soundFx.playChime();
          spawnFood();
        } else {
          snake.pop();
        }

        // Collision detection
        if (
          headX < 0 ||
          headX >= width ||
          headY < 0 ||
          headY >= height ||
          snake.some((seg) => seg.x === headX && seg.y === headY)
        ) {
          running = false;
          setIsGameOver(true);
          soundFx.playError();
          return;
        }

        snake.unshift({ x: headX, y: headY });
      };

      intervalIdRef.current = window.setInterval(step, 100);

      keyHandlersRef.current.onKeyDown = (e: KeyboardEvent) => {
        if (['ArrowUp', 'KeyW'].includes(e.code) && dir !== 'DOWN') nextDir = 'UP';
        if (['ArrowDown', 'KeyS'].includes(e.code) && dir !== 'UP') nextDir = 'DOWN';
        if (['ArrowLeft', 'KeyA'].includes(e.code) && dir !== 'RIGHT') nextDir = 'LEFT';
        if (['ArrowRight', 'KeyD'].includes(e.code) && dir !== 'LEFT') nextDir = 'RIGHT';
      };
    }

    // --- GAME 2: PONG MAGIQUE ---
    else if (selectedGame === 'pong') {
      const padW = 10;
      const padH = 75;
      let leftY = 160;
      let rightY = 160;
      let leftScore = 0;
      let rightScore = 0;
      let ball = { x: 200, y: 200, r: 6, vx: 4.5, vy: 3 };
      let up = false;
      let down = false;
      let running = true;

      const loop = () => {
        if (!running) return;

        if (up && leftY > 0) leftY -= 6;
        if (down && leftY < height - padH) leftY += 6;

        // AI
        const aiSpeed = 4.2 + leftScore * 0.3;
        if (ball.y < rightY + padH / 2) rightY -= aiSpeed;
        if (ball.y > rightY + padH / 2) rightY += aiSpeed;

        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce top/bottom
        if (ball.y - ball.r < 0 || ball.y + ball.r > height) {
          ball.vy *= -1;
        }

        // Left paddle collision
        if (ball.x - ball.r < 25 && ball.y > leftY && ball.y < leftY + padH) {
          ball.vx = Math.abs(ball.vx) * 1.05;
          ball.x = 25 + ball.r;
          soundFx.playClick();
        }

        // Right paddle collision
        if (ball.x + ball.r > width - 25 && ball.y > rightY && ball.y < rightY + padH) {
          ball.vx = -Math.abs(ball.vx) * 1.05;
          ball.x = width - 25 - ball.r;
          soundFx.playClick();
        }

        // Score
        if (ball.x < 0) {
          rightScore++;
          ball = { x: 200, y: 200, r: 6, vx: 4.5, vy: 3 };
          if (rightScore >= 5) {
            running = false;
            setIsGameOver(true);
            soundFx.playError();
          }
        } else if (ball.x > width) {
          leftScore++;
          setScore(leftScore);
          updateHighScore(leftScore);
          soundFx.playVictory();
          ball = { x: 200, y: 200, r: 6, vx: -4.5, vy: 3 };
        }

        // Draw
        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Center line
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
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
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Score overlay
        ctx.font = "bold 20px 'Outfit', sans-serif";
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(String(leftScore), width / 2 - 40, 35);
        ctx.fillStyle = '#10b981';
        ctx.fillText(String(rightScore), width / 2 + 25, 35);

        if (running) {
          animFrameIdRef.current = requestAnimationFrame(loop);
        }
      };

      animFrameIdRef.current = requestAnimationFrame(loop);

      keyHandlersRef.current.onKeyDown = (e: KeyboardEvent) => {
        if (['ArrowUp', 'KeyW'].includes(e.code)) up = true;
        if (['ArrowDown', 'KeyS'].includes(e.code)) down = true;
      };
      keyHandlersRef.current.onKeyUp = (e: KeyboardEvent) => {
        if (['ArrowUp', 'KeyW'].includes(e.code)) up = false;
        if (['ArrowDown', 'KeyS'].includes(e.code)) down = false;
      };
    }

    // --- GAME 3: CASSE-BRIQUES ---
    else if (selectedGame === 'breakout') {
      const padW = 75;
      const padH = 10;
      let padX = width / 2 - padW / 2;
      let ball = { x: 200, y: 350, r: 6, vx: 4, vy: -4 };
      let left = false;
      let right = false;
      let currentScore = 0;
      let running = true;

      const rows = 5;
      const cols = 6;
      const bW = 52;
      const bH = 18;
      const padding = 8;
      const offLeft = 20;
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
        if (!running) return;

        if (left && padX > 0) padX -= 6;
        if (right && padX < width - padW) padX += 6;

        ball.x += ball.vx;
        ball.y += ball.vy;

        // Walls
        if (ball.x - ball.r < 0) {
          ball.x = ball.r;
          ball.vx = Math.abs(ball.vx);
        } else if (ball.x + ball.r > width) {
          ball.x = width - ball.r;
          ball.vx = -Math.abs(ball.vx);
        }
        if (ball.y - ball.r < 0) {
          ball.y = ball.r;
          ball.vy = Math.abs(ball.vy);
        } else if (ball.y - ball.r > height) {
          running = false;
          setIsGameOver(true);
          soundFx.playError();
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
          ball.vx = hit * 5;
          soundFx.playClick();
        }

        // Bricks collision
        let won = true;
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const b = bricks[c][r];
            if (b.active) {
              won = false;
              if (
                ball.x + ball.r > b.x &&
                ball.x - ball.r < b.x + bW &&
                ball.y + ball.r > b.y &&
                ball.y - ball.r < b.y + bH
              ) {
                b.active = false;
                ball.vy *= -1;
                currentScore += 10;
                setScore(currentScore);
                updateHighScore(currentScore);
                soundFx.playChime();
              }
            }
          }
        }

        if (won) {
          running = false;
          setIsGameOver(true);
          soundFx.playVictory();
          return;
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

        if (running) {
          animFrameIdRef.current = requestAnimationFrame(loop);
        }
      };

      animFrameIdRef.current = requestAnimationFrame(loop);

      keyHandlersRef.current.onKeyDown = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) left = true;
        if (['ArrowRight', 'KeyD'].includes(e.code)) right = true;
      };
      keyHandlersRef.current.onKeyUp = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) left = false;
        if (['ArrowRight', 'KeyD'].includes(e.code)) right = false;
      };
    }

    // --- GAME 4: FLAPPY HIBOU ---
    else if (selectedGame === 'flappy') {
      let bird = { y: 200, vy: 0, gravity: 0.5, jump: -7 };
      interface Pipe {
        x: number;
        w: number;
        top: number;
        gap: number;
        passed: boolean;
      }
      let pipes: Pipe[] = [];
      let frame = 0;
      let currentScore = 0;
      let running = true;

      const loop = () => {
        if (!running) return;
        frame++;

        bird.vy += bird.gravity;
        bird.y += bird.vy;

        // Spawn pipes
        if (frame % 85 === 0) {
          const gap = 120;
          const top = Math.random() * (height - gap - 60) + 30;
          pipes.push({ x: width, w: 45, top, gap, passed: false });
        }

        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Draw pipes
        ctx.fillStyle = '#1e3a29';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;

        for (let i = pipes.length - 1; i >= 0; i--) {
          const p = pipes[i];
          p.x -= 2.8;

          ctx.fillRect(p.x, 0, p.w, p.top);
          ctx.strokeRect(p.x, 0, p.w, p.top);

          ctx.fillRect(p.x, p.top + p.gap, p.w, height - (p.top + p.gap));
          ctx.strokeRect(p.x, p.top + p.gap, p.w, height - (p.top + p.gap));

          if (p.x + p.w < 60 && !p.passed) {
            p.passed = true;
            currentScore++;
            setScore(currentScore);
            updateHighScore(currentScore);
            soundFx.playChime();
          }

          // Collision
          if (60 + 12 > p.x && 60 - 12 < p.x + p.w) {
            if (bird.y - 12 < p.top || bird.y + 12 > p.top + p.gap) {
              running = false;
              setIsGameOver(true);
              soundFx.playError();
              return;
            }
          }

          if (p.x + p.w < 0) pipes.splice(i, 1);
        }

        // Draw Owl
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦉', 60, bird.y + 10);

        if (bird.y > height || bird.y < 0) {
          running = false;
          setIsGameOver(true);
          soundFx.playError();
          return;
        }

        if (running) {
          animFrameIdRef.current = requestAnimationFrame(loop);
        }
      };

      animFrameIdRef.current = requestAnimationFrame(loop);

      const flap = () => {
        bird.vy = bird.jump;
        soundFx.playClick();
      };

      keyHandlersRef.current.onKeyDown = (e: KeyboardEvent) => {
        if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) flap();
      };
      canvas.onclick = flap;
    }

    // --- GAME 5: HIBOU INVADERS ---
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
      let left = false;
      let right = false;
      let currentScore = 0;
      let shootTimer = 0;
      let direction = 1;
      let running = true;

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

      const loop = () => {
        if (!running) return;
        shootTimer--;

        if (left && playerX > 20) playerX -= 5;
        if (right && playerX < width - 20) playerX += 5;

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
          b.y -= 7;
          ctx.fillRect(b.x - 2, b.y, 4, 12);
          if (b.y < 0) bullets.splice(i, 1);
        }
        ctx.shadowBlur = 0;

        let hitEdge = false;
        let aliveCount = 0;

        for (const inv of invaders) {
          if (!inv.alive) continue;
          aliveCount++;
          inv.x += direction * 0.8;
          if (inv.x > width - 25 || inv.x < 25) hitEdge = true;

          ctx.fillText(inv.icon, inv.x, inv.y);

          // Hit test
          for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            if (Math.abs(b.x - inv.x) < 16 && Math.abs(b.y - inv.y) < 16) {
              inv.alive = false;
              bullets.splice(i, 1);
              currentScore += 10;
              setScore(currentScore);
              updateHighScore(currentScore);
              soundFx.playChime();
              break;
            }
          }

          if (inv.y > height - 60) {
            running = false;
            setIsGameOver(true);
            soundFx.playError();
            return;
          }
        }

        if (hitEdge) {
          direction *= -1;
          for (const inv of invaders) inv.y += 14;
        }

        if (aliveCount === 0) {
          soundFx.playVictory();
          currentScore += 100;
          setScore(currentScore);
          updateHighScore(currentScore);
          for (const inv of invaders) {
            inv.alive = true;
            inv.y -= 80;
          }
        }

        if (running) {
          animFrameIdRef.current = requestAnimationFrame(loop);
        }
      };

      animFrameIdRef.current = requestAnimationFrame(loop);

      keyHandlersRef.current.onKeyDown = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) left = true;
        if (['ArrowRight', 'KeyD'].includes(e.code)) right = true;
        if (e.code === 'Space' && shootTimer <= 0) {
          bullets.push({ x: playerX, y: height - 40 });
          shootTimer = 15;
          soundFx.playClick();
        }
      };
      keyHandlersRef.current.onKeyUp = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) left = false;
        if (['ArrowRight', 'KeyD'].includes(e.code)) right = false;
      };
    }

    // --- GAME 6: FOREST RUN ---
    else if (selectedGame === 'run') {
      let player = { y: 340, vy: 0, gravity: 0.7, jump: -12, onGround: true };
      interface Obstacle {
        x: number;
        w: number;
        h: number;
      }
      let obstacles: Obstacle[] = [];
      let frame = 0;
      let currentScore = 0;
      let running = true;

      const loop = () => {
        if (!running) return;
        frame++;
        if (frame % 6 === 0) {
          currentScore++;
          setScore(currentScore);
          updateHighScore(currentScore);
        }

        ctx.fillStyle = '#060f09';
        ctx.fillRect(0, 0, width, height);

        // Ground
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 355);
        ctx.lineTo(width, 355);
        ctx.stroke();

        // Physics
        player.vy += player.gravity;
        player.y += player.vy;
        if (player.y >= 340) {
          player.y = 340;
          player.vy = 0;
          player.onGround = true;
        }

        // Draw runner owl
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦉', 60, player.y);

        // Spawn obstacles
        if (frame % 80 === 0 || (frame > 250 && Math.random() < 0.02 && frame % 25 !== 0)) {
          obstacles.push({ x: width, w: 22, h: 32 });
        }

        // Obstacles
        ctx.fillStyle = '#f59e0b';
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= 5 + currentScore / 100;
          ctx.fillRect(obs.x, 355 - obs.h, obs.w, obs.h);

          // Hit
          if (
            60 + 10 > obs.x &&
            60 - 10 < obs.x + obs.w &&
            player.y > 355 - obs.h
          ) {
            running = false;
            setIsGameOver(true);
            soundFx.playError();
            return;
          }

          if (obs.x + obs.w < 0) obstacles.splice(i, 1);
        }

        if (running) {
          animFrameIdRef.current = requestAnimationFrame(loop);
        }
      };

      animFrameIdRef.current = requestAnimationFrame(loop);

      const jump = () => {
        if (player.onGround) {
          player.vy = player.jump;
          player.onGround = false;
          soundFx.playClick();
        }
      };

      keyHandlersRef.current.onKeyDown = (e: KeyboardEvent) => {
        if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) jump();
      };
      canvas.onclick = jump;
    }

    // --- GAME 7: TETRIS MYSTIQUE ---
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
      let currentScore = 0;
      let running = true;

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

        // Clear lines
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
          currentScore += linesCleared * 100;
          setScore(currentScore);
          updateHighScore(currentScore);
          soundFx.playVictory();
        }

        // Spawn next
        curPiece = pieces[Math.floor(Math.random() * 7) + 1];
        curColor = Math.floor(Math.random() * 7) + 1;
        pX = 3;
        pY = 0;

        if (collides(curPiece, pX, pY)) {
          running = false;
          setIsGameOver(true);
          soundFx.playError();
        }
      };

      const drop = () => {
        if (!running) return;
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

        // Current
        for (let r = 0; r < curPiece.length; r++) {
          for (let c = 0; c < curPiece[r].length; c++) {
            if (curPiece[r][c] !== 0) {
              ctx.fillStyle = colors[curColor] || '#f59e0b';
              ctx.fillRect((pX + c) * bSize + 100, (pY + r) * bSize, bSize - 1, bSize - 1);
            }
          }
        }
      };

      intervalIdRef.current = window.setInterval(drop, 400);

      keyHandlersRef.current.onKeyDown = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) {
          if (!collides(curPiece, pX - 1, pY)) pX--;
        }
        if (['ArrowRight', 'KeyD'].includes(e.code)) {
          if (!collides(curPiece, pX + 1, pY)) pX++;
        }
        if (['ArrowDown', 'KeyS'].includes(e.code)) {
          if (!collides(curPiece, pX, pY + 1)) pY++;
        }
        if (['ArrowUp', 'KeyW'].includes(e.code)) {
          rotate(curPiece);
        }
        draw();
      };
    }

    // --- GAME 8: MINE STORM VECTREX REVIVAL (1982) ---
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
      let left = false;
      let right = false;
      let thrust = false;
      let currentScore = 0;
      let running = true;

      // Spawn initial mines
      for (let i = 0; i < 6; i++) {
        mines.push({
          x: Math.random() * width,
          y: Math.random() * (height - 100),
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          r: 16,
        });
      }

      const loop = () => {
        if (!running) return;

        if (left) ship.angle -= 0.08;
        if (right) ship.angle += 0.08;
        if (thrust) {
          ship.vx += Math.cos(ship.angle) * 0.15;
          ship.vy += Math.sin(ship.angle) * 0.15;
        }

        // Friction
        ship.vx *= 0.985;
        ship.vy *= 0.985;
        ship.x += ship.vx;
        ship.y += ship.vy;

        // Wrap edges
        if (ship.x < 0) ship.x = width;
        if (ship.x > width) ship.x = 0;
        if (ship.y < 0) ship.y = height;
        if (ship.y > height) ship.y = 0;

        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, width, height);

        // Vector glow style
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

          // Draw vector mine
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

          // Laser hit mine
          for (let li = lasers.length - 1; li >= 0; li--) {
            const l = lasers[li];
            const dist = Math.hypot(l.x - m.x, l.y - m.y);
            if (dist < m.r) {
              soundFx.playChime();
              currentScore += 50;
              setScore(currentScore);
              updateHighScore(currentScore);
              lasers.splice(li, 1);
              mines.splice(i, 1);
              break;
            }
          }

          // Ship hit mine
          const shipDist = Math.hypot(ship.x - m.x, ship.y - m.y);
          if (shipDist < m.r + 8) {
            running = false;
            setIsGameOver(true);
            soundFx.playError();
            return;
          }
        }

        ctx.shadowBlur = 0;

        if (mines.length === 0) {
          soundFx.playVictory();
          for (let i = 0; i < 8; i++) {
            mines.push({
              x: Math.random() * width,
              y: Math.random() * (height - 100),
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              r: 16,
            });
          }
        }

        if (running) {
          animFrameIdRef.current = requestAnimationFrame(loop);
        }
      };

      animFrameIdRef.current = requestAnimationFrame(loop);

      keyHandlersRef.current.onKeyDown = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) left = true;
        if (['ArrowRight', 'KeyD'].includes(e.code)) right = true;
        if (['ArrowUp', 'KeyW'].includes(e.code)) thrust = true;
        if (e.code === 'Space') {
          lasers.push({
            x: ship.x,
            y: ship.y,
            vx: Math.cos(ship.angle) * 7 + ship.vx,
            vy: Math.sin(ship.angle) * 7 + ship.vy,
            life: 45,
          });
          soundFx.playClick();
        }
      };
      keyHandlersRef.current.onKeyUp = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) left = false;
        if (['ArrowRight', 'KeyD'].includes(e.code)) right = false;
        if (['ArrowUp', 'KeyW'].includes(e.code)) thrust = false;
      };
    }

    return () => {
      stopAllLoops();
    };
  }, [isOpen, selectedGame, updateHighScore]);

  // Key event listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keyHandlersRef.current.onKeyDown(e);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keyHandlersRef.current.onKeyUp(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentGameMeta =
    ARCADE_GAMES.find((g) => g.id === selectedGame) || ARCADE_GAMES[0];

  const triggerVirtualKey = (code: string) => {
    keyHandlersRef.current.onKeyDown(new KeyboardEvent('keydown', { code }));
    setTimeout(() => {
      keyHandlersRef.current.onKeyUp(new KeyboardEvent('keyup', { code }));
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#131a29] via-[#0e1524] to-[#070b12] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col items-center overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
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
                onClick={() => {
                  soundFx.playClick();
                  setSelectedGame(game.id);
                  const saved = localStorage.getItem(`hoot_arcade_hs_${game.id}`);
                  setHighScore(saved ? parseInt(saved, 10) : 0);
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
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

        {/* Score & Instructions Bar */}
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
            onClick={() => {
              soundFx.playClick();
              setSelectedGame((prev) => prev); // force reload
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition"
            title="Recommencer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Rejouer</span>
          </button>
        </div>

        {/* Game Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#1e293b] bg-[#060f09] shadow-2xl">
          <canvas
            ref={canvasRef}
            className="block w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] cursor-pointer"
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
                onClick={() => {
                  soundFx.playClick();
                  setIsGameOver(false);
                  setSelectedGame((prev) => prev); // restart
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Rejouer Immédiatement
              </button>
            </div>
          )}
        </div>

        {/* Game Instructions */}
        <p className="text-[11px] text-slate-400 text-center mt-3 max-w-[400px] leading-relaxed">
          <Sparkles className="w-3 h-3 text-amber-400 inline mr-1" />
          {currentGameMeta.instructions}
        </p>

        {/* Virtual Mobile D-Pad Controls */}
        <div className="sm:hidden flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#1e293b] w-full max-w-[400px]">
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              onClick={() => triggerVirtualKey('ArrowUp')}
              className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />
            <button
              onClick={() => triggerVirtualKey('ArrowLeft')}
              className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => triggerVirtualKey('ArrowDown')}
              className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => triggerVirtualKey('ArrowRight')}
              className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => triggerVirtualKey('Space')}
            className="px-6 py-4 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/20 active:bg-amber-400"
          >
            Action
          </button>
        </div>
      </div>
    </div>
  );
};
