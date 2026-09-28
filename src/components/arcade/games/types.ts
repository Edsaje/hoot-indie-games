import React from 'react';

export type ArcadeDifficulty = 'detente' | 'normal' | 'expert';

export interface ArcadeGameProps {
  difficulty: ArcadeDifficulty;
  isVectrexPhosphor?: boolean;
  onScoreAdd: (points: number) => void;
  onGameOver: () => void;
  isKeyDown: (codes: readonly string[]) => boolean;
  touchPosRef: React.RefObject<{ x: number; y: number; active: boolean }>;
  soundMuted: boolean;
  onCanvasTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onCanvasTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onCanvasTouchEnd: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  clearKey?: (code: string) => void;
  highScore?: number;
  setIsVectrexPhosphor?: (val: boolean) => void;
  setIsVectrexUnlocked?: (val: boolean) => void;
  unlockAchievement?: (id: string) => void;
  isVectrexPhosphorRef?: React.RefObject<boolean>;
}
