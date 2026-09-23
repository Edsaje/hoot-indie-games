import { useEffect, useRef } from 'react';
import { readGamepadSnapshot } from './gamepad';

/**
 * Hook souverain d'écoute du Code Konami légendaire (↑ ↑ ↓ ↓ ← → ← → B A)
 * Compatible Clavier (touches fléchées + B + A) et Manettes de jeu unifiées (D-Pad + B + A)
 */

const KONAMI_SEQUENCE: readonly string[] = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

interface UseKonamiCodeOptions {
  enabled?: boolean;
  onSuccess: () => void;
}

export function useKonamiCode({ enabled = true, onSuccess }: UseKonamiCodeOptions): void {
  const indexRef = useRef<number>(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!enabled) return;

    const resetSequence = () => {
      indexRef.current = 0;
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };

    const processInput = (token: string) => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(resetSequence, 3500);

      const expected = KONAMI_SEQUENCE[indexRef.current];
      if (token === expected) {
        indexRef.current++;
        if (indexRef.current === KONAMI_SEQUENCE.length) {
          resetSequence();
          onSuccessRef.current();
        }
      } else {
        // En cas de mauvaise touche, si la touche tapée était la première (ArrowUp), on initialise à 1
        indexRef.current = token === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };

    // 1. Écoute Clavier
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      let token: string | null = null;
      if (e.code === 'ArrowUp' || e.key === 'ArrowUp') token = 'ArrowUp';
      else if (e.code === 'ArrowDown' || e.key === 'ArrowDown') token = 'ArrowDown';
      else if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') token = 'ArrowLeft';
      else if (e.code === 'ArrowRight' || e.key === 'ArrowRight') token = 'ArrowRight';
      else if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') token = 'KeyB';
      else if (e.code === 'KeyA' || e.key === 'a' || e.key === 'A') token = 'KeyA';

      if (token) {
        processInput(token);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: true });

    // 2. Écoute Manette (Gamepad Polling discret)
    let animId: number | null = null;
    const pollGamepad = () => {
      const snap = readGamepadSnapshot(0.35);
      if (snap && snap.connected) {
        if (snap.justUp) processInput('ArrowUp');
        else if (snap.justDown) processInput('ArrowDown');
        else if (snap.justLeft) processInput('ArrowLeft');
        else if (snap.justRight) processInput('ArrowRight');
        else if (snap.justActionB) processInput('KeyB');
        else if (snap.justActionA) processInput('KeyA');
      }
      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animId !== null) cancelAnimationFrame(animId);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [enabled]);
}
