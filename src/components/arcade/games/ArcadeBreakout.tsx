import React, { useEffect, useRef } from 'react';
import type { ArcadeGameProps } from './types';
import { soundFx } from '../../../utils/audio';
import {
  KEY_CODES_LEFT,
  KEY_CODES_RIGHT,
  KEY_CODES_BREAKOUT_FIRE,
  BREAKOUT_CAPSULE_CONFIG
} from './constants';

export const ArcadeBreakout: React.FC<ArcadeGameProps> = (props) => {
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
