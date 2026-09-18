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
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { ARCADE_GAMES, type ArcadeGameId, type ArcadeGameMeta } from '../../data/arcadeGames';
export type { ArcadeGameId, ArcadeGameMeta };


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

      intervalIdRef.current = window.setInterval(step, 115);
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
      let ball = { x: 200, y: 200, r: 7, vx: 4.4, vy: 2.2 };
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
          if (isKeyDown(['ArrowUp', 'KeyW', 'KeyZ']) && leftY > 0) leftY -= 5.4;
          if (isKeyDown(['ArrowDown', 'KeyS']) && leftY < height - padH) leftY += 5.4;
        }

        // Launch ball on space or arrow press
        if (!started && (isKeyDown(['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS']))) {
          started = true;
          soundFx.playClick();
        }

        if (started) {
          // Adaptive AI
          const aiSpeed = 3.6 + leftScore * 0.15;
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
            const delta = (ball.y - (leftY + padH / 2)) / (padH / 2);
            ball.vy = delta * 4.2;
            ball.vx = Math.min(7.2, Math.abs(ball.vx) + 0.18);
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
            ball = { x: 200, y: 200, r: 7, vx: 4.4, vy: (Math.random() - 0.5) * 3.5 };
            started = false;
          } else if (ball.x > width) {
            leftScore++;
            soundFx.playVictory();
            ball = { x: 200, y: 200, r: 7, vx: -4.4, vy: (Math.random() - 0.5) * 3.5 };
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
      let ball = { x: 200, y: 350, r: 6, vx: 3.2, vy: -4.2 };
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

        if (touchPosRef.current.active) {
          padX = Math.max(0, Math.min(width - padW, touchPosRef.current.x - padW / 2));
        } else {
          if (isKeyDown(['ArrowLeft', 'KeyA', 'KeyQ']) && padX > 0) padX -= 5.4;
          if (isKeyDown(['ArrowRight', 'KeyD']) && padX < width - padW) padX += 5.4;
        }

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
            ball.vx = hit * 4.4;
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
                  // Authentic Atari speed acceleration on top layers
                  if (r <= 1) {
                    ball.vy = Math.sign(ball.vy) * Math.min(6.5, Math.abs(ball.vy) + 0.25);
                  }
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
            const gap = 132;
            const top = Math.random() * (height - gap - 80) + 40;
            pipes.push({ x: width, w: 45, top, gap, passed: false });
          }

          // Move pipes & test collision
          for (let i = pipes.length - 1; i >= 0; i--) {
            const p = pipes[i];
            p.x -= 1.85;

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
      let lives = 3;
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
          if (isKeyDown(['ArrowLeft', 'KeyA', 'KeyQ']) && playerX > 20) playerX -= 4.4;
          if (isKeyDown(['ArrowRight', 'KeyD']) && playerX < width - 20) playerX += 4.4;
        }

        // Shooting
        if (isKeyDown(['Space']) && shootTimer <= 0 && bullets.length < 2) {
          bullets.push({ x: playerX, y: height - 36 });
          shootTimer = 16;
          soundFx.playClick();
        }

        // Alien bombs dropping
        const aliveInvaders = invaders.filter((i) => i.alive);
        if (bombTimer <= 0 && aliveInvaders.length > 0) {
          const randomAlien = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
          alienBombs.push({ x: randomAlien.x, y: randomAlien.y + 10 });
          bombTimer = Math.max(35, Math.floor(aliveInvaders.length * 2.2));
        }

        // Stepped Invader March (Authentic hardware rhythm)
        marchTimer++;
        const marchInterval = Math.max(4, Math.floor(aliveInvaders.length * 1.05));
        if (marchTimer >= marchInterval && aliveInvaders.length > 0) {
          marchTimer = 0;
          invaderFrame = invaderFrame === 0 ? 1 : 0;

          let hitWall = false;
          for (const inv of aliveInvaders) {
            if ((direction > 0 && inv.x >= width - 25) || (direction < 0 && inv.x <= 25)) {
              hitWall = true;
              break;
            }
          }

          if (hitWall) {
            direction *= -1;
            for (const inv of aliveInvaders) {
              inv.y += 12;
              if (inv.y >= height - 45) {
                gameActive = false;
                triggerGameOver();
                return;
              }
            }
          } else {
            for (const inv of aliveInvaders) {
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
          for (const inv of aliveInvaders) {
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
        for (const inv of aliveInvaders) {
          drawInvaderSprite(inv, invaderFrame);
        }

        // Lives and HUD
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`VIES: ${'▲ '.repeat(lives)}`, 15, height - 8);

        // Wave Cleared -> Respawn with speed increase
        if (aliveInvaders.length === 0) {
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
    else if (selectedGame === 'run') {
      let player = { y: 340, vy: 0, gravity: 0.44, jump: -8.8, onGround: true };
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
        if (frame % 110 === 0 || (frame > 350 && Math.random() < 0.012 && frame % 40 !== 0)) {
          obstacles.push({ x: width, w: 22, h: 32 });
        }

        // Obstacles
        ctx.fillStyle = '#f59e0b';
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= 3.5 + scoreRef.current / 2500;
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
      let lives = 3;
      let escapesLeft = 3;
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

      // Spawn authentic vector line burst debris
      const addVectorExplosion = (x: number, y: number, count: number, color = '#00ffcc') => {
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

        for (let i = 0; i < floatingCount; i++) createMine('floating_large', 16, 0.75);
        for (let i = 0; i < magneticCount; i++) createMine('magnetic_large', 16, 0.65);
        for (let i = 0; i < fireballCount; i++) createMine('fireball_mine', 16, 0.7);
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
          addVectorExplosion(ship.x, ship.y, 8, '#00ffcc');
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
        fireLaser();
      };

      const loop = () => {
        if (!gameActive) return;
        shootTimer--;
        if (escapeCooldown > 0) escapeCooldown--;
        if (shieldTimer > 0) shieldTimer--;

        // Escape Key trigger
        if (isKeyDown(['KeyE'])) {
          triggerHyperdrive();
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
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, width - 16, height - 16);

        // Setup Phosphor Vector Glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ffcc';
        ctx.strokeStyle = '#00ffcc';
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
          ctx.strokeStyle = '#00ffcc';
          ctx.shadowColor = '#00ffcc';
        }

        // Draw Spawn / Warp Shield
        if (shieldTimer > 0 && Math.floor(shieldTimer / 5) % 2 === 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = '#00ffcc';
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
            ctx.strokeStyle = '#00ffcc';
            ctx.shadowColor = '#00ffcc';
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

        // Vector line explosions (Debris)
        for (let i = debris.length - 1; i >= 0; i--) {
          const d = debris[i];
          d.x += d.vx;
          d.y += d.vy;
          d.life--;

          const alpha = d.life / d.maxLife;
          ctx.strokeStyle = d.color;
          ctx.shadowColor = d.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + Math.cos(d.angle) * (d.len * alpha), d.y + Math.sin(d.angle) * (d.len * alpha));
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          if (d.life <= 0) debris.splice(i, 1);
        }

        // Vector CRT HUD (Score, Field, Escapes, Lives)
        ctx.fillStyle = '#00ffcc';
        ctx.shadowColor = '#00ffcc';
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
          ctx.fillStyle = '#00ffcc';
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
  }, [isOpen, selectedGame, gameKey, saveHighScore]);

  // Global Key Listener for modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyE'].includes(e.code)) {
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

    if (['flappy', 'run', 'breakout', 'pong', 'invaders', 'vectrex'].includes(selectedGame)) {
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
      <div className="relative w-full max-w-xl max-h-[94vh] overflow-y-auto bg-[#131a29] border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col items-center">
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
        </div>

        {/* Score & Controls Bar */}
        <div className="w-full max-w-[380px] flex items-center justify-between px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl mb-3 text-xs">
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
        <p className="text-[11px] text-slate-400 text-center mt-2.5 max-w-[380px] leading-relaxed">
          <Sparkles className="w-3 h-3 text-amber-400 inline mr-1" />
          {currentGameMeta.instructions}
        </p>

        {/* Mobile-Optimized Adaptive Virtual Controls */}
        <div className="w-full max-w-[380px] select-none">
          {/* FLAPPY & RUN: Single Large Action Bar */}
          {['flappy', 'run'].includes(selectedGame) && (
            <div className="flex flex-col items-center gap-2 mt-3 pt-3 border-t border-[#1e293b] w-full">
              <button
                {...bindVirtualTouch('Space')}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-98 touch-none select-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{selectedGame === 'flappy' ? '🪽 BATTRE DES AILES' : '⚡ SAUTER LE PIÈGE'}</span>
                <span className="opacity-80 text-[10px]">(ou toucher l'écran)</span>
              </button>
            </div>
          )}

          {/* PONG: Vertical Controls + Touch Hint */}
          {selectedGame === 'pong' && (
            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[#1e293b] w-full">
              <div className="flex flex-col gap-2">
                <button
                  {...bindVirtualTouch('ArrowUp')}
                  className="w-14 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200"
                  title="Monter"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  {...bindVirtualTouch('ArrowDown')}
                  className="w-14 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200"
                  title="Descendre"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 text-center p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 text-[11px] text-slate-300 leading-snug">
                👆 <strong>Contrôle tactile direct :</strong> glissez votre doigt verticalement sur l'écran pour bouger la raquette !
              </div>
            </div>
          )}

          {/* BREAKOUT: Left / Right + Launch Ball */}
          {selectedGame === 'breakout' && (
            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[#1e293b] w-full">
              <div className="flex items-center gap-2">
                <button
                  {...bindVirtualTouch('ArrowLeft')}
                  className="w-13 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200"
                  title="Gauche"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  {...bindVirtualTouch('ArrowRight')}
                  className="w-13 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200"
                  title="Droite"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <button
                {...bindVirtualTouch('Space')}
                className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                Lancer la balle
              </button>
            </div>
          )}

          {/* INVADERS: Left / Right + Shoot */}
          {selectedGame === 'invaders' && (
            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[#1e293b] w-full">
              <div className="flex items-center gap-2">
                <button
                  {...bindVirtualTouch('ArrowLeft')}
                  className="w-13 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200"
                  title="Gauche"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  {...bindVirtualTouch('ArrowRight')}
                  className="w-13 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200"
                  title="Droite"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <button
                {...bindVirtualTouch('Space')}
                className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                🚀 Tirer
              </button>
            </div>
          )}

          {/* SNAKE, TETRIS: 4-Way D-Pad + Action */}
          {['snake', 'tetris'].includes(selectedGame) && (
            <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-[#1e293b] w-full">
              <div className="grid grid-cols-3 gap-1.5">
                <div />
                <button
                  {...bindVirtualTouch('ArrowUp')}
                  className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200 shadow"
                  title="Haut / Rotation"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <div />
                <button
                  {...bindVirtualTouch('ArrowLeft')}
                  className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200 shadow"
                  title="Gauche"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  {...bindVirtualTouch('ArrowDown')}
                  className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200 shadow"
                  title="Bas"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <button
                  {...bindVirtualTouch('ArrowRight')}
                  className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-amber-500 active:text-slate-950 touch-none select-none text-slate-200 shadow"
                  title="Droite"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <button
                {...bindVirtualTouch('Space')}
                className="px-6 h-23 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/20 active:scale-95 touch-none select-none cursor-pointer flex flex-col items-center justify-center gap-1 leading-tight"
              >
                <span>ACTION</span>
                <span className="text-[10px] font-medium opacity-75">(Espace)</span>
              </button>
            </div>
          )}

          {/* VECTREX MINE STORM: Steering D-Pad + Thrust + Fire + Hyperdrive */}
          {selectedGame === 'vectrex' && (
            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[#1e293b] w-full">
              {/* Steering D-Pad */}
              <div className="flex items-center gap-1.5">
                <button
                  {...bindVirtualTouch('ArrowLeft')}
                  className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-cyan-500 active:text-slate-950 touch-none select-none text-cyan-300 shadow"
                  title="Pivoter à Gauche"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  {...bindVirtualTouch('ArrowUp')}
                  className="w-12 h-12 rounded-xl bg-slate-800 border border-cyan-500/40 flex items-center justify-center active:bg-cyan-500 active:text-slate-950 touch-none select-none text-cyan-300 shadow"
                  title="Propulsion (Gaz)"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  {...bindVirtualTouch('ArrowRight')}
                  className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-cyan-500 active:text-slate-950 touch-none select-none text-cyan-300 shadow"
                  title="Pivoter à Droite"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Action Buttons: Fire & Escape / Hyperdrive */}
              <div className="flex items-center gap-2 flex-1">
                <button
                  {...bindVirtualTouch('KeyE')}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/50 text-cyan-300 font-black text-[11px] uppercase tracking-wider shadow active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-1"
                  title="Fuite / Hyperdrive (Touche E)"
                >
                  ⚡ Fuite (E)
                </button>
                <button
                  {...bindVirtualTouch('Space')}
                  className="flex-1 h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-95 touch-none select-none cursor-pointer flex items-center justify-center gap-1"
                  title="Tirer (Espace)"
                >
                  💥 Tirer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
