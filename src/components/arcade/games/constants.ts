export const KEY_CODES_UP = ['ArrowUp', 'KeyW', 'KeyZ'] as const;
export const KEY_CODES_DOWN = ['ArrowDown', 'KeyS'] as const;
export const KEY_CODES_LEFT = ['ArrowLeft', 'KeyA', 'KeyQ'] as const;
export const KEY_CODES_RIGHT = ['ArrowRight', 'KeyD'] as const;
export const KEY_CODES_JUMP = ['Space', 'ArrowUp', 'KeyW', 'KeyZ'] as const;
export const KEY_CODES_SHOOT = ['Space'] as const;
export const KEY_CODES_BREAKOUT_FIRE = ['Space', 'ArrowUp'] as const;
export const KEY_CODES_START_ALL = [
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyZ', 'KeyQ',
  'Space', 'Enter',
] as const;

export type BreakoutPowerUpType = 'multiball' | 'wide' | 'laser' | 'slow' | 'life' | 'fireball';

export const BREAKOUT_CAPSULE_CONFIG: Record<BreakoutPowerUpType, { bg: string; text: string; label: string }> = {
  multiball: { bg: '#3b82f6', text: '#ffffff', label: 'M' },
  wide: { bg: '#10b981', text: '#ffffff', label: 'W' },
  laser: { bg: '#ef4444', text: '#ffffff', label: 'L' },
  slow: { bg: '#eab308', text: '#000000', label: 'S' },
  life: { bg: '#ec4899', text: '#ffffff', label: '♥' },
  fireball: { bg: '#f97316', text: '#ffffff', label: 'F' },
};
