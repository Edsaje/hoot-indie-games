import React, { useEffect, useRef } from 'react';
import type { ArcadeGameProps } from './types';
import { soundFx } from '../../../utils/audio';
import {
  KEY_CODES_UP,
  KEY_CODES_DOWN,
  KEY_CODES_LEFT,
  KEY_CODES_RIGHT,
  KEY_CODES_START_ALL,
} from './constants';

export const ArcadeSnake: React.FC<ArcadeGameProps> = (props) => {
  const {
    difficulty,
    isVectrexPhosphor,
    onScoreAdd,
    onGameOver,
    isKeyDown,
    touchPosRef,
    soundMuted,
    onCanvasTouchStart,
    onCanvasTouchMove,
    onCanvasTouchEnd,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = 400;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    let animFrameId: number;
    let intervalId: number | null = null;
    let customCleanup: (() => void) | null = null;
    

    const addScore = (pts: number) => {
      onScoreAdd(pts);
    };

    const triggerGameOver = () => {
      gameActive = false;
      onGameOver();
    };

    // @ts-ignore
    const startFixedLoop = (isActive: () => boolean, updateAndRender: () => void) => {
      let lastTime = performance.now();
      const targetInterval = 1000 / 60;
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
          lastTime = now;
          animFrameId = requestAnimationFrame(runner);
          return;
        }

        const elapsed = now - lastTime;
        if (elapsed >= targetInterval - 3.0) {
          if (elapsed > 100) {
            lastTime = now;
          } else {
            lastTime += targetInterval;
            if (now - lastTime > targetInterval) {
              lastTime = now;
            }
          }
          updateAndRender();
        }

        if (isActive()) {
          animFrameId = requestAnimationFrame(runner);
        }
      };

      animFrameId = requestAnimationFrame(runner);

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
    let currentScore = 0;
    // @ts-ignore
    currentScore;
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
    
          const onKeyDownSnake = (e: KeyboardEvent) => {
            const c = e.code;
            const k = e.key;
            if (!started) {
              started = true;
              soundFx.playClick();
            }
            if ((['ArrowUp', 'KeyW', 'KeyZ'].includes(c) || ['ArrowUp', 'w', 'W', 'z', 'Z'].includes(k)) && dir !== 'DOWN') {
              nextDir = 'UP';
            } else if ((['ArrowDown', 'KeyS'].includes(c) || ['ArrowDown', 's', 'S'].includes(k)) && dir !== 'UP') {
              nextDir = 'DOWN';
            } else if ((['ArrowLeft', 'KeyA', 'KeyQ'].includes(c) || ['ArrowLeft', 'a', 'A', 'q', 'Q'].includes(k)) && dir !== 'RIGHT') {
              nextDir = 'LEFT';
            } else if ((['ArrowRight', 'KeyD'].includes(c) || ['ArrowRight', 'd', 'D'].includes(k)) && dir !== 'LEFT') {
              nextDir = 'RIGHT';
            }
          };
          window.addEventListener('keydown', onKeyDownSnake);
          customCleanup = () => {
            window.removeEventListener('keydown', onKeyDownSnake);
          };
    
          const snakeSpeed = difficulty === 'expert' ? 85 : difficulty === 'detente' ? 145 : 115;
          intervalId = window.setInterval(step, snakeSpeed);

    return () => {
      gameActive = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (intervalId !== null) clearInterval(intervalId);
      if (customCleanup) customCleanup();
    };
  }, [difficulty, isVectrexPhosphor, onScoreAdd, onGameOver, isKeyDown, touchPosRef, soundMuted]);

  return (
    <canvas
      ref={canvasRef}
      onTouchStart={onCanvasTouchStart}
      onTouchMove={onCanvasTouchMove}
      onTouchEnd={onCanvasTouchEnd}
      onTouchCancel={onCanvasTouchEnd}
      className="w-full h-full block"
    />
  );
};
