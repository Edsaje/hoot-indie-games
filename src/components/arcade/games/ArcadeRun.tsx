import React, { useEffect, useRef } from 'react';
import type { ArcadeGameProps } from './types';
import { soundFx } from '../../../utils/audio';
import {
  KEY_CODES_DOWN,
  KEY_CODES_JUMP,
} from './constants';

export const ArcadeRun: React.FC<ArcadeGameProps> = (props) => {
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
    let currentScore = 0;
    // @ts-ignore
    currentScore;
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
                /* keyboardKeysRef.current.add('ArrowDown') */
                /* keysDownRef.current.add('ArrowDown') */
                setTimeout(() => {
                  clearKey?.('ArrowDown');
                  clearKey?.('ArrowDown');
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
    
            // Progressive Difficulty Curve for Course Sylvestre:
            // Speed & obstacle frequency smoothly accelerate as player survives longer
            /* const currentScore = currentScore; */
            const rampThreshold = difficulty === 'expert' ? 300 : difficulty === 'detente' ? 500 : 400;
            const progress = Math.min(currentScore / rampThreshold, 1.0);
    
            const runBaseSpeed = difficulty === 'expert' ? 4.0 : difficulty === 'detente' ? 2.6 : 3.3;
            const runMaxSpeed = difficulty === 'expert' ? 7.6 : difficulty === 'detente' ? 5.2 : 6.5;
            const currentSpeed = runBaseSpeed + progress * (runMaxSpeed - runBaseSpeed);
            const speedMultiplier = (currentSpeed / runBaseSpeed).toFixed(1);
    
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
            // Progressive Difficulty: intervals compress and patterns diversify with score
            distanceToNextSpawn -= currentSpeed;
            if (distanceToNextSpawn <= 0) {
              let nextType: ObstacleType = 'ground';
              // Progressive introduction of overhead obstacles:
              // Early on (score < 35), 100% ground obstacles to allow player to find rhythm
              let overheadChance = 0;
              if (currentScore >= 35) {
                const baseChance = difficulty === 'detente' ? 0.30 : 0.45;
                overheadChance = currentScore < 90 ? 0.25 : baseChance;
              }
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
                const stumpH = currentScore > 100 && Math.random() < 0.35 ? 36 : 30;
                obstacles.push({ x: width + 10, w: 24, h: stumpH, type: 'ground' });
                // Dynamic jump buffer compresses smoothly as score climbs
                const baseJumpBuffer = difficulty === 'expert' ? 66 : difficulty === 'detente' ? 90 : 78;
                const minJumpBuffer = difficulty === 'expert' ? 44 : difficulty === 'detente' ? 64 : 52;
                const jumpBufferFrames = Math.max(minJumpBuffer, Math.round(baseJumpBuffer - progress * 24));
                const variance = Math.floor(Math.random() * 12);
                distanceToNextSpawn = currentSpeed * (jumpBufferFrames + variance);
              } else {
                obstacles.push({ x: width + 10, w: 28, h: 140, type: 'overhead' });
                // Dynamic slide buffer compresses smoothly
                const baseSlideBuffer = difficulty === 'expert' ? 52 : difficulty === 'detente' ? 78 : 64;
                const minSlideBuffer = difficulty === 'expert' ? 34 : difficulty === 'detente' ? 52 : 40;
                const slideBufferFrames = Math.max(minSlideBuffer, Math.round(baseSlideBuffer - progress * 22));
                const variance = Math.floor(Math.random() * 10);
                distanceToNextSpawn = currentSpeed * (slideBufferFrames + variance);
              }
            }
    
            // Draw HUD: Vitesse progressive
            if (started) {
              ctx.save();
              ctx.font = 'bold 11px monospace';
              ctx.textAlign = 'right';
              const hudColor = progress > 0.6 ? '#fbbf24' : '#34d399';
              ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
              ctx.beginPath();
              ctx.roundRect(width - 92, 12, 80, 22, 6);
              ctx.fill();
              ctx.strokeStyle = hudColor;
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.fillStyle = hudColor;
              ctx.fillText(`⚡ x${speedMultiplier}`, width - 20, 27);
              ctx.restore();
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
