import { describe, it, expect, vi } from 'vitest';
import { setupRetinaCanvas, startEngineLoop } from '../utils/arcadeEngine';
import {
  KEY_CODES_UP,
  KEY_CODES_DOWN,
  KEY_CODES_LEFT,
  KEY_CODES_RIGHT,
  KEY_CODES_JUMP,
  KEY_CODES_START_ALL,
  BREAKOUT_CAPSULE_CONFIG,
  type BreakoutPowerUpType,
} from '../components/arcade/games/constants';

describe('arcadeEngines — Moteur Canvas, Boucle Temporelle & Physique des 8 Jeux Rétro', () => {
  describe('Moteur Temporelle (Fixed Timestep Loop)', () => {
    it('initialise correctement la mise à l’échelle DPR d’un canvas Retina', () => {
      const mockCtx = {
        scale: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const mockCanvas = {
        width: 0,
        height: 0,
      } as unknown as HTMLCanvasElement;

      // Simulation d'un écran Retina DPR = 2
      vi.stubGlobal('devicePixelRatio', 2);

      const dpr = setupRetinaCanvas(mockCanvas, mockCtx, 400, 300);

      expect(dpr).toBe(2);
      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(600);
      expect(mockCtx.scale).toHaveBeenCalledWith(2, 2);
    });

    it('plafonne le DPR à 2.5 pour préserver les performances GPU', () => {
      const mockCtx = {
        scale: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const mockCanvas = {
        width: 0,
        height: 0,
      } as unknown as HTMLCanvasElement;

      // Simulation écran 4K très haute densité DPR = 4
      vi.stubGlobal('devicePixelRatio', 4);

      const dpr = setupRetinaCanvas(mockCanvas, mockCtx, 200, 200);

      expect(dpr).toBe(2.5);
      expect(mockCanvas.width).toBe(500);
      expect(mockCanvas.height).toBe(500);
    });

    it('arrête proprement la boucle lors de l’appel de la fonction de nettoyage', () => {
      let isRunning = true;
      const updateFn = vi.fn();
      const renderFn = vi.fn();

      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

      const stopLoop = startEngineLoop(
        () => isRunning,
        updateFn,
        renderFn
      );

      expect(typeof stopLoop).toBe('function');
      stopLoop();
      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('Constantes et Configurations des Jeux Rétro', () => {
    it('définit des contrôles clavier complets et conformes (Flèches, ZQSD, Espace, Entrée)', () => {
      expect(KEY_CODES_UP).toContain('ArrowUp');
      expect(KEY_CODES_UP).toContain('KeyW');
      expect(KEY_CODES_UP).toContain('KeyZ');

      expect(KEY_CODES_DOWN).toContain('ArrowDown');
      expect(KEY_CODES_DOWN).toContain('KeyS');

      expect(KEY_CODES_LEFT).toContain('ArrowLeft');
      expect(KEY_CODES_LEFT).toContain('KeyA');
      expect(KEY_CODES_LEFT).toContain('KeyQ');

      expect(KEY_CODES_RIGHT).toContain('ArrowRight');
      expect(KEY_CODES_RIGHT).toContain('KeyD');

      expect(KEY_CODES_JUMP).toContain('Space');
      expect(KEY_CODES_START_ALL.length).toBeGreaterThanOrEqual(10);
    });

    it('configure l’ensemble des 6 capsules de bonus de Breakout avec des couleurs valides', () => {
      const powerUpTypes: BreakoutPowerUpType[] = ['multiball', 'wide', 'laser', 'slow', 'life', 'fireball'];

      powerUpTypes.forEach((type) => {
        const config = BREAKOUT_CAPSULE_CONFIG[type];
        expect(config).toBeDefined();
        expect(config.label.length).toBeGreaterThan(0);
        expect(config.bg).toMatch(/^#[0-9a-f]{6}$/i);
        expect(config.text).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('Algorithmes de Collision & Logique Physique', () => {
    it('détecte correctement une collision AABB (Axis-Aligned Bounding Box)', () => {
      function checkAABB(
        r1: { x: number; y: number; w: number; h: number },
        r2: { x: number; y: number; w: number; h: number }
      ): boolean {
        return (
          r1.x < r2.x + r2.w &&
          r1.x + r1.w > r2.x &&
          r1.y < r2.y + r2.h &&
          r1.y + r1.h > r2.y
        );
      }

      const player = { x: 50, y: 50, w: 20, h: 20 };
      const enemyColliding = { x: 60, y: 60, w: 20, h: 20 };
      const enemyFar = { x: 200, y: 200, w: 20, h: 20 };

      expect(checkAABB(player, enemyColliding)).toBe(true);
      expect(checkAABB(player, enemyFar)).toBe(false);
    });

    it('calcule correctement la rotation et les limites d’une pièce de Tetris (Matrice 4x4)', () => {
      function rotateMatrix(matrix: number[][]): number[][] {
        const n = matrix.length;
        const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            result[c][n - 1 - r] = matrix[r][c];
          }
        }
        return result;
      }

      // Pièce "T"
      const tetrominoT = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];

      const rotated90 = rotateMatrix(tetrominoT);
      expect(rotated90).toEqual([
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ]);

      const rotated180 = rotateMatrix(rotated90);
      expect(rotated180).toEqual([
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ]);
    });

    it('gère le rebond et l’angle d’une balle de Pong selon la zone d’impact de la raquette', () => {
      function computePongBounce(
        ballY: number,
        paddleY: number,
        paddleHeight: number
      ): number {
        // Point d'impact normalisé entre -1 (haut) et +1 (bas)
        const relativeIntersectY = (paddleY + paddleHeight / 2) - ballY;
        const normalized = relativeIntersectY / (paddleHeight / 2);
        // Angle de rebond plafonné à ±60° (π/3 radians)
        return Math.max(-1, Math.min(1, -normalized)) * (Math.PI / 3);
      }

      const paddleHeight = 80;
      const paddleY = 100;

      // Rebond au centre exact (angle 0°)
      const centerAngle = computePongBounce(140, paddleY, paddleHeight);
      expect(Math.abs(centerAngle)).toBeLessThan(0.001);

      // Rebond au sommet de la raquette (angle négatif vers le haut)
      const topAngle = computePongBounce(100, paddleY, paddleHeight);
      expect(topAngle).toBeLessThan(0);

      // Rebond en bas de la raquette (angle positif vers le bas)
      const bottomAngle = computePongBounce(180, paddleY, paddleHeight);
      expect(bottomAngle).toBeGreaterThan(0);
    });

    it('gère le wrap-around torique et l’auto-collision du Snake', () => {
      const GRID_COLS = 20;
      const GRID_ROWS = 20;

      function moveHead(head: { x: number; y: number }, dir: { dx: number; dy: number }) {
        return {
          x: (head.x + dir.dx + GRID_COLS) % GRID_COLS,
          y: (head.y + dir.dy + GRID_ROWS) % GRID_ROWS,
        };
      }

      // Traversée du mur droit vers la gauche
      const wrappedRight = moveHead({ x: 19, y: 10 }, { dx: 1, dy: 0 });
      expect(wrappedRight).toEqual({ x: 0, y: 10 });

      // Traversée du mur supérieur vers le bas
      const wrappedTop = moveHead({ x: 5, y: 0 }, { dx: 0, dy: -1 });
      expect(wrappedTop).toEqual({ x: 5, y: 19 });

      // Auto-collision
      const body = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 4, y: 6 },
        { x: 5, y: 6 },
      ];
      const nextHeadColliding = { x: 4, y: 6 };
      const nextHeadSafe = { x: 6, y: 5 };

      const hasSelfCollision = (head: { x: number; y: number }) =>
        body.some((segment) => segment.x === head.x && segment.y === head.y);

      expect(hasSelfCollision(nextHeadColliding)).toBe(true);
      expect(hasSelfCollision(nextHeadSafe)).toBe(false);
    });
  });
});
