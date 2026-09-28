import React, { useEffect, useRef } from 'react';
import type { ArcadeGameProps } from './types';
import { soundFx } from '../../../utils/audio';
import {
  KEY_CODES_LEFT,
  KEY_CODES_RIGHT,
  KEY_CODES_SHOOT,
} from './constants';

export const ArcadeInvaders: React.FC<ArcadeGameProps> = (props) => {
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
    let currentScore = 0;
    // @ts-ignore
    currentScore;
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
