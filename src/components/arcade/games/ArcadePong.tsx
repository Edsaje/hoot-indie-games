import React, { useEffect, useRef } from 'react';
import type { ArcadeGameProps } from './types';
import { soundFx } from '../../../utils/audio';
import {
  KEY_CODES_UP,
  KEY_CODES_DOWN,
  KEY_CODES_START_ALL,
} from './constants';

export const ArcadePong: React.FC<ArcadeGameProps> = (props) => {
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
    let currentScore = 0;
    // @ts-ignore
    currentScore;
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
