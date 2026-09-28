import React, { useEffect, useRef } from 'react';
import type { ArcadeGameProps } from './types';
import { soundFx } from '../../../utils/audio';
import {
  KEY_CODES_JUMP,
} from './constants';

export const ArcadeFlappy: React.FC<ArcadeGameProps> = (props) => {
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
    clearKey,
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
    let currentScore = 0;
    // @ts-ignore
    currentScore;
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
                clearKey?.(k);
                clearKey?.(k);
                clearKey?.(k);
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
