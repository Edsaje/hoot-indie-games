import React, { useEffect, useRef } from 'react';
import type { ArcadeGameProps } from './types';
import { soundFx } from '../../../utils/audio';
import {
} from './constants';

export const ArcadeTetris: React.FC<ArcadeGameProps> = (props) => {
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
    let currentScore = 0;
    // @ts-ignore
    currentScore;
          let dropInterval = difficulty === 'expert' ? 450 : difficulty === 'detente' ? 850 : 650;
    
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
              let rowFilled = true;
              for (let c = 0; c < cols; c++) {
                if (board[r][c] === 0) {
                  rowFilled = false;
                  break;
                }
              }
              if (rowFilled) {
                board.splice(r, 1);
                board.unshift(new Array(cols).fill(0));
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
    
          const drawBlock = (x: number, y: number, color: string) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, bSize - 1, bSize - 1);
            // Bevel top-left light
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x, y, bSize - 1, 2);
            ctx.fillRect(x, y, 2, bSize - 1);
            // Bevel bottom-right shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(x, y + bSize - 3, bSize - 1, 2);
            ctx.fillRect(x + bSize - 3, y, 2, bSize - 1);
          };
    
          const draw = () => {
            // Base canvas
            ctx.fillStyle = '#060f09';
            ctx.fillRect(0, 0, width, height);
    
            // Sidebar backgrounds
            ctx.fillStyle = '#040b06';
            ctx.fillRect(0, 0, 100, height);
            ctx.fillRect(300, 0, 100, height);
    
            // Matrix background (playfield)
            ctx.fillStyle = '#010503';
            ctx.fillRect(100, 0, 200, height);
    
            // Subtle matrix grid
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let c = 1; c < cols; c++) {
              ctx.moveTo(100 + c * bSize, 0);
              ctx.lineTo(100 + c * bSize, height);
            }
            for (let r = 1; r < rows; r++) {
              ctx.moveTo(100, r * bSize);
              ctx.lineTo(300, r * bSize);
            }
            ctx.stroke();
    
            // Delimitation borders around the 10x20 playfield (Left, Right, Bottom)
            ctx.save();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(99, 0);
            ctx.lineTo(99, 399);
            ctx.lineTo(301, 399);
            ctx.lineTo(301, 0);
            ctx.stroke();
            ctx.restore();
    
            // Corner accents on borders
            ctx.fillStyle = '#34d399';
            ctx.fillRect(96, 396, 6, 4);
            ctx.fillRect(298, 396, 6, 4);
    
            // Sidebar decorative HUD & Controls
            ctx.save();
            ctx.textAlign = 'center';
    
            // Left sidebar: Controls
            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('COMMANDES', 50, 120);
    
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.fillText('← / →', 50, 148);
            ctx.fillStyle = '#64748b';
            ctx.fillText('Déplacer', 50, 160);
    
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('↑ / Clic', 50, 188);
            ctx.fillStyle = '#64748b';
            ctx.fillText('Pivoter', 50, 200);
    
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('↓', 50, 228);
            ctx.fillStyle = '#64748b';
            ctx.fillText('Accélérer', 50, 240);
    
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('ESPACE', 50, 268);
            ctx.fillStyle = '#64748b';
            ctx.fillText('Chute directe', 50, 280);
    
            // Right sidebar: Mode & Status
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('TETRIS', 350, 60);
            ctx.fillStyle = '#059669';
            ctx.font = '9px monospace';
            ctx.fillText('MYSTIQUE', 350, 75);
    
            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
            ctx.fillRect(320, 90, 60, 1);
    
            ctx.fillStyle = '#64748b';
            ctx.font = '9px monospace';
            ctx.fillText('ZONE 10×20', 350, 120);
            ctx.fillStyle = '#10b981';
            ctx.fillText('ACTIF', 350, 140);
            ctx.restore();
    
            // Board placed blocks
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                if (board[r][c] !== 0) {
                  const color = colors[board[r][c]] || '#f59e0b';
                  drawBlock(c * bSize + 100, r * bSize, color);
                }
              }
            }
    
            // Current active falling piece
            for (let r = 0; r < curPiece.length; r++) {
              for (let c = 0; c < curPiece[r].length; c++) {
                if (curPiece[r][c] !== 0) {
                  const color = colors[curColor] || '#f59e0b';
                  drawBlock((pX + c) * bSize + 100, (pY + r) * bSize, color);
                }
              }
            }
          };
    
          // Initial render immediately
          draw();
    
          intervalId = window.setInterval(drop, dropInterval);
    
          // Tetris discrete key listener
          const onKeyDownTetris = (e: KeyboardEvent) => {
            const c = e.code || '';
            const k = e.key || '';
            if (['ArrowLeft', 'KeyA', 'KeyQ'].includes(c) || ['ArrowLeft', 'a', 'A', 'q', 'Q'].includes(k)) {
              if (!collides(curPiece, pX - 1, pY)) pX--;
            }
            if (['ArrowRight', 'KeyD'].includes(c) || ['ArrowRight', 'd', 'D'].includes(k)) {
              if (!collides(curPiece, pX + 1, pY)) pX++;
            }
            if (['ArrowDown', 'KeyS'].includes(c) || ['ArrowDown', 's', 'S'].includes(k)) {
              if (!collides(curPiece, pX, pY + 1)) pY++;
            }
            if (['ArrowUp', 'KeyW', 'KeyZ'].includes(c) || ['ArrowUp', 'w', 'W', 'z', 'Z'].includes(k)) {
              rotate(curPiece);
            }
            if (['Space'].includes(c) || k === ' ' || k === 'Spacebar') {
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
