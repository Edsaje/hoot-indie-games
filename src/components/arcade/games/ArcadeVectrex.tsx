import React, { useEffect, useRef } from 'react';
import type { ArcadeGameProps } from './types';
import { soundFx } from '../../../utils/audio';
import {
} from './constants';

export const ArcadeVectrex: React.FC<ArcadeGameProps> = (props) => {
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
    highScore,
    setIsVectrexPhosphor,
    setIsVectrexUnlocked,
    unlockAchievement,
    isVectrexPhosphorRef
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
    let currentScore = 0;
    // @ts-ignore
    currentScore;
    
          const getIsPhosphor = () => (isVectrexPhosphorRef?.current || false);
          let phosphorHoldFrames = 0;
          let secretUnlockedJustNow = false;
          let started = false;
    
          const getPrimaryColor = () => (getIsPhosphor() ? '#39ff14' : '#00ffcc');
          const getGlowColor = () => (getIsPhosphor() ? '#39ff14' : '#00ffcc');
    
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
    
            const isPhosphorMode = getIsPhosphor();
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
                const displayHs = (highScore || 0) > 0 ? (highScore || 0) : 10000;
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
                  if (isVectrexPhosphorRef) isVectrexPhosphorRef.current = true;
                  setIsVectrexPhosphor?.(true);
                  setIsVectrexUnlocked?.(true);
                  try {
                    localStorage.setItem('hoot_vectrex_unlocked', 'true');
                    localStorage.setItem('hoot_vectrex_phosphor', 'true');
                  } catch {
                    // Ignore
                  }
                  soundFx.playVectrexUnlock();
                  unlockAchievement?.('vectrex_phosphor');
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
              clearKey?.('KeyE');
              clearKey?.('KeyE');
              clearKey?.('KeyE');
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
