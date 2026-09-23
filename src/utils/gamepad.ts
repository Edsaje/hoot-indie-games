/**
 * Utilitaire de gestion souveraine des Manettes de Jeu (W3C Gamepad API)
 * Prise en charge universelle et calibrée des manettes PlayStation (DualSense PS5, DualShock 4),
 * Xbox (Series, One, 360), Nintendo Switch (Pro Controller, Joy-Con), 8BitDo et sticks rétro.
 * Supporte le mapping standard W3C et le mapping DirectInput / HID brut spécifique à Sony.
 */

import { useState, useEffect, useRef } from 'react';

export type ControllerFamily = 'playstation' | 'xbox' | 'switch' | 'generic';

export interface GamepadButtonLabels {
  actionA: string;      // Bouton principal (Saut, Tir, Validation)
  actionB: string;      // Bouton secondaire (Annuler, Retour)
  actionX: string;      // Bouton tertiaire (Action alternative)
  actionY: string;      // Bouton quaternaire (Leaderboard, Aléatoire)
  lb: string;           // Tranche gauche (Borne précédente)
  rb: string;           // Tranche droite (Borne suivante)
  start: string;        // Menu principal (Rejouer / Démarrer)
  select: string;       // Menu secondaire (Classement / Quitter)
}

export interface GamepadSnapshot {
  connected: boolean;
  id: string;
  name: string;
  family: ControllerFamily;
  labels: GamepadButtonLabels;
  // Directions (combinaison D-Pad matériel, Hat Switch et Stick gauche)
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  justUp: boolean;
  justDown: boolean;
  justLeft: boolean;
  justRight: boolean;
  // Boutons d'action unifiés
  actionA: boolean; // Croix (PS) / A (Xbox) / B (Switch) -> Validation, Saut, Tir
  justActionA: boolean;
  actionB: boolean; // Rond (PS) / B (Xbox) / A (Switch) -> Hyperdrive, Annuler
  justActionB: boolean;
  actionX: boolean; // Carré (PS) / X (Xbox) / Y (Switch) -> Rotation, Action 2
  justActionX: boolean;
  actionY: boolean; // Triangle (PS) / Y (Xbox) / X (Switch) -> Aléatoire, Hard Drop
  justActionY: boolean;
  // Gâchettes et tranches
  lb: boolean; // L1 / LB / L
  justLb: boolean;
  rb: boolean; // R1 / RB / R
  justRb: boolean;
  lt: boolean; // L2 / LT / ZL
  rt: boolean; // R2 / RT / ZR
  justRt: boolean;
  // Menus
  select: boolean; // Share / Create / Select / Minus
  justSelect: boolean;
  start: boolean; // Options / Start / Plus
  justStart: boolean;
  // Axes bruts analogiques
  axes: {
    leftStickX: number;
    leftStickY: number;
    rightStickX: number;
    rightStickY: number;
  };
}

/**
 * Détermine la famille matérielle de la manette
 */
export function getControllerFamily(rawId: string): ControllerFamily {
  if (!rawId) return 'generic';
  const id = rawId.toLowerCase();
  if (
    id.includes('054c') ||
    id.includes('sony') ||
    id.includes('dualsense') ||
    id.includes('dualshock') ||
    id.includes('playstation') ||
    id.includes('wireless controller')
  ) {
    return 'playstation';
  }
  if (
    id.includes('switch') ||
    id.includes('pro controller') ||
    id.includes('joy-con') ||
    id.includes('nintendo') ||
    id.includes('057e')
  ) {
    return 'switch';
  }
  if (
    id.includes('xbox') ||
    id.includes('xinput') ||
    id.includes('microsoft') ||
    id.includes('045e')
  ) {
    return 'xbox';
  }
  return 'generic';
}

/**
 * Libellés textuels et glyphes exacts selon la manette branchée
 */
export function getGamepadButtonLabels(family: ControllerFamily): GamepadButtonLabels {
  if (family === 'playstation') {
    return {
      actionA: 'Croix (✕)',
      actionB: 'Rond (◯)',
      actionX: 'Carré (◻)',
      actionY: 'Triangle (△)',
      lb: 'L1',
      rb: 'R1',
      start: 'Options',
      select: 'Share',
    };
  }
  if (family === 'switch') {
    return {
      actionA: 'Touche B',
      actionB: 'Touche A',
      actionX: 'Touche Y',
      actionY: 'Touche X',
      lb: 'L',
      rb: 'R',
      start: '+',
      select: '-',
    };
  }
  return {
    actionA: 'Touche A',
    actionB: 'Touche B',
    actionX: 'Touche X',
    actionY: 'Touche Y',
    lb: 'LB',
    rb: 'RB',
    start: 'Start',
    select: 'Select',
  };
}

/**
 * Nettoyage et identification conviviale du modèle de manette
 */
export function getGamepadFriendlyName(rawId: string): string {
  if (!rawId) return 'Manette Connectée';
  const idLower = rawId.toLowerCase();

  if (idLower.includes('dualsense')) {
    return 'Manette DualSense (PS5)';
  }
  if (
    idLower.includes('dualshock') ||
    idLower.includes('playstation') ||
    idLower.includes('054c') ||
    (idLower.includes('wireless controller') && !idLower.includes('xbox'))
  ) {
    return 'Manette PlayStation';
  }
  if (idLower.includes('xbox') || idLower.includes('xinput') || idLower.includes('microsoft')) {
    return 'Manette Xbox';
  }
  if (idLower.includes('switch') || idLower.includes('pro controller') || idLower.includes('joy-con')) {
    return 'Manette Nintendo Switch';
  }
  if (idLower.includes('8bitdo')) {
    return 'Manette 8BitDo';
  }
  if (idLower.includes('retro') || idLower.includes('arcade')) {
    return 'Stick Arcade / Rétro';
  }
  return 'Manette Connectée';
}

/**
 * Récupère la première manette active disponible
 */
export function getActiveGamepad(): Gamepad | null {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) {
    return null;
  }
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (gp && gp.connected) {
      return gp;
    }
  }
  return null;
}

// État précédent mémorisé pour la détection de front montant (justPressed)
let prevButtonsState: Record<string, boolean> = {};

/**
 * Décodage universel du Hat Switch / POV D-Pad (DirectInput Windows Sony / Générique)
 */
function readDpadHatSwitch(axes: readonly number[]): { up: boolean; down: boolean; left: boolean; right: boolean } {
  // En DirectInput sur Windows, le Hat Switch est typiquement sur l'axe 9 ou 4
  const candidates = [9, 4, 5, 6, 7, 8].filter((idx) => idx < axes.length);

  for (const idx of candidates) {
    const val = axes[idx];
    // Valeur neutre standard DirectInput : > 1.0 (ex: 1.2857 ou 3.2857)
    if (typeof val === 'number' && Math.abs(val) <= 1.05) {
      const isUp = (val >= -1.05 && val <= -0.85) || (val >= -0.75 && val <= -0.65) || (val >= 0.85 && val <= 1.05);
      const isDown = (val >= 0.05 && val <= 0.25) || (val >= -0.25 && val <= -0.05) || (val >= 0.35 && val <= 0.55);
      const isLeft = (val >= 0.65 && val <= 0.85) || (val >= 0.85 && val <= 1.05) || (val >= 0.35 && val <= 0.55);
      const isRight = (val >= -0.55 && val <= -0.35) || (val >= -0.75 && val <= -0.65) || (val >= -0.25 && val <= -0.05);

      if (isUp || isDown || isLeft || isRight) {
        return { up: isUp, down: isDown, left: isLeft, right: isRight };
      }
    }
  }

  return { up: false, down: false, left: false, right: false };
}

/**
 * Lit l'état actuel de la manette avec normalisation multi-driver
 */
export function readGamepadSnapshot(deadzone: number = 0.35): GamepadSnapshot | null {
  const gp = getActiveGamepad();
  if (!gp) {
    prevButtonsState = {};
    return null;
  }

  const buttons = gp.buttons;
  const axes = gp.axes;
  const family = getControllerFamily(gp.id);
  const isStandard = gp.mapping === 'standard';
  const labels = getGamepadButtonLabels(family);

  const isBtnPressed = (index: number | undefined) => {
    if (index === undefined || !buttons[index]) return false;
    return Boolean(buttons[index].pressed || buttons[index].value > 0.45);
  };

  const getAxis = (index: number) => {
    return axes && typeof axes[index] === 'number' ? axes[index] : 0;
  };

  // Sticks analogiques principaux
  const rawLeftX = getAxis(0);
  const rawLeftY = getAxis(1);
  const rawRightX = getAxis(2);
  const rawRightY = getAxis(3);

  // Filtrage zone morte
  const stickLeftX = Math.abs(rawLeftX) > deadzone ? rawLeftX : 0;
  const stickLeftY = Math.abs(rawLeftY) > deadzone ? rawLeftY : 0;
  const stickRightX = Math.abs(rawRightX) > deadzone ? rawRightX : 0;
  const stickRightY = Math.abs(rawRightY) > deadzone ? rawRightY : 0;

  // Directions analogiques Stick Gauche
  const stickUp = stickLeftY < -deadzone;
  const stickDown = stickLeftY > deadzone;
  const stickLeft = stickLeftX < -deadzone;
  const stickRight = stickLeftX > deadzone;

  // Détection D-Pad (Boutons physiques ou Hat Switch DirectInput)
  let dpadUp = false;
  let dpadDown = false;
  let dpadLeft = false;
  let dpadRight = false;

  if (isStandard || buttons.length > 15) {
    dpadUp = isBtnPressed(12);
    dpadDown = isBtnPressed(13);
    dpadLeft = isBtnPressed(14);
    dpadRight = isBtnPressed(15);
  }

  // Si le D-Pad n'a pas été détecté par boutons, décoder l'axe POV / Hat Switch
  if (!dpadUp && !dpadDown && !dpadLeft && !dpadRight) {
    const hat = readDpadHatSwitch(axes);
    dpadUp = hat.up;
    dpadDown = hat.down;
    dpadLeft = hat.left;
    dpadRight = hat.right;
  }

  // Directions combinées unifiées
  const up = dpadUp || stickUp;
  const down = dpadDown || stickDown;
  const left = dpadLeft || stickLeft;
  const right = dpadRight || stickRight;

  // Normalisation des Boutons d'Action (Croix / A, Rond / B, Carré / X, Triangle / Y)
  let actionA = false; // Bas (Action principale)
  let actionB = false; // Droite (Action secondaire / Retour)
  let actionX = false; // Gauche (Rotation / Tertiaire)
  let actionY = false; // Haut (Menu / Aléatoire / Quaternaire)

  if (isStandard) {
    actionA = isBtnPressed(0); // Croix (PS) / A (Xbox)
    actionB = isBtnPressed(1); // Rond (PS) / B (Xbox)
    actionX = isBtnPressed(2); // Carré (PS) / X (Xbox)
    actionY = isBtnPressed(3); // Triangle (PS) / Y (Xbox)
  } else if (family === 'playstation') {
    // Mode DirectInput / Bluetooth brut pour DualSense / DualShock sur Windows :
    // Bouton 0 = Carré, Bouton 1 = Croix, Bouton 2 = Rond, Bouton 3 = Triangle
    actionA = isBtnPressed(1); // Croix = Bouton 1
    actionB = isBtnPressed(2); // Rond = Bouton 2
    actionX = isBtnPressed(0); // Carré = Bouton 0
    actionY = isBtnPressed(3); // Triangle = Bouton 3
  } else {
    actionA = isBtnPressed(0);
    actionB = isBtnPressed(1);
    actionX = isBtnPressed(2);
    actionY = isBtnPressed(3);
  }

  // Tranches et gâchettes
  const lb = isBtnPressed(4); // L1 / LB
  const rb = isBtnPressed(5); // R1 / RB
  const lt = isBtnPressed(6) || Boolean(buttons[6] && buttons[6].value > 0.4); // L2 / LT
  const rt = isBtnPressed(7) || Boolean(buttons[7] && buttons[7].value > 0.4); // R2 / RT

  // Menus
  const select = isBtnPressed(8); // Share / Create / Select
  const start = isBtnPressed(9);  // Options / Start

  // Détection de front montant (justPressed)
  const isJustPressed = (key: string, currentVal: boolean) => {
    const wasPressed = Boolean(prevButtonsState[key]);
    return currentVal && !wasPressed;
  };

  const snapshot: GamepadSnapshot = {
    connected: true,
    id: gp.id,
    name: getGamepadFriendlyName(gp.id),
    family,
    labels,
    up,
    down,
    left,
    right,
    justUp: isJustPressed('up', up),
    justDown: isJustPressed('down', down),
    justLeft: isJustPressed('left', left),
    justRight: isJustPressed('right', right),
    actionA,
    justActionA: isJustPressed('actionA', actionA),
    actionB,
    justActionB: isJustPressed('actionB', actionB),
    actionX,
    justActionX: isJustPressed('actionX', actionX),
    actionY,
    justActionY: isJustPressed('actionY', actionY),
    lb,
    justLb: isJustPressed('lb', lb),
    rb,
    justRb: isJustPressed('rb', rb),
    lt,
    rt,
    justRt: isJustPressed('rt', rt),
    select,
    justSelect: isJustPressed('select', select),
    start,
    justStart: isJustPressed('start', start),
    axes: {
      leftStickX: stickLeftX,
      leftStickY: stickLeftY,
      rightStickX: stickRightX,
      rightStickY: stickRightY,
    },
  };

  // Mémorisation de l'état précédent
  prevButtonsState = {
    up,
    down,
    left,
    right,
    actionA,
    actionB,
    actionX,
    actionY,
    lb,
    rb,
    lt,
    rt,
    select,
    start,
  };

  return snapshot;
}

/**
 * Hook de détection automatique de connexion d'une manette
 */
export function useGamepadStatus(): {
  isConnected: boolean;
  gamepadName: string;
  family: ControllerFamily;
  labels: GamepadButtonLabels;
} {
  const [status, setStatus] = useState(() => {
    const gp = getActiveGamepad();
    const family = gp ? getControllerFamily(gp.id) : 'generic';
    return {
      isConnected: Boolean(gp && gp.connected),
      gamepadName: gp ? getGamepadFriendlyName(gp.id) : '',
      family,
      labels: getGamepadButtonLabels(family),
    };
  });

  useEffect(() => {
    const update = (gp: Gamepad | null) => {
      const isConnected = Boolean(gp && gp.connected);
      const family = gp ? getControllerFamily(gp.id) : 'generic';
      setStatus({
        isConnected,
        gamepadName: gp ? getGamepadFriendlyName(gp.id) : '',
        family,
        labels: getGamepadButtonLabels(family),
      });
    };

    const handleConnected = (e: GamepadEvent) => {
      update(e.gamepad);
    };

    const handleDisconnected = () => {
      update(getActiveGamepad());
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);

    // Polling léger de secours pour détecter les manettes connectées avant chargement de la page
    const pollInterval = setInterval(() => {
      const active = getActiveGamepad();
      update(active);
    }, 1200);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
      clearInterval(pollInterval);
    };
  }, []);

  return status;
}

export interface GamepadArcadeLoopOptions {
  enabled: boolean;
  gameId?: string;
  keysDownRef?: React.MutableRefObject<Set<string>>;
  gamepadKeysRef?: React.MutableRefObject<Set<string>>;
  onDirectionJustPressed?: (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onActionJustPressed?: () => void;
  onActionSecondaryJustPressed?: () => void;
  onRestartJustPressed?: () => void;
  onNextGameJustPressed?: () => void;
  onPrevGameJustPressed?: () => void;
  onCloseJustPressed?: () => void;
}

/**
 * Hook de boucle d'acquisition Gamepad haute fidélité pour les jeux et la navigation arcade
 */
export function useGamepadArcadeLoop({
  enabled,
  gameId,
  keysDownRef,
  gamepadKeysRef,
  onDirectionJustPressed,
  onActionJustPressed,
  onActionSecondaryJustPressed,
  onRestartJustPressed,
  onNextGameJustPressed,
  onPrevGameJustPressed,
  onCloseJustPressed,
}: GamepadArcadeLoopOptions) {
  const optionsRef = useRef({
    enabled,
    gameId,
    keysDownRef,
    gamepadKeysRef,
    onDirectionJustPressed,
    onActionJustPressed,
    onActionSecondaryJustPressed,
    onRestartJustPressed,
    onNextGameJustPressed,
    onPrevGameJustPressed,
    onCloseJustPressed,
  });

  useEffect(() => {
    optionsRef.current = {
      enabled,
      gameId,
      keysDownRef,
      gamepadKeysRef,
      onDirectionJustPressed,
      onActionJustPressed,
      onActionSecondaryJustPressed,
      onRestartJustPressed,
      onNextGameJustPressed,
      onPrevGameJustPressed,
      onCloseJustPressed,
    };
  }, [
    enabled,
    gameId,
    keysDownRef,
    gamepadKeysRef,
    onDirectionJustPressed,
    onActionJustPressed,
    onActionSecondaryJustPressed,
    onRestartJustPressed,
    onNextGameJustPressed,
    onPrevGameJustPressed,
    onCloseJustPressed,
  ]);

  useEffect(() => {
    if (!enabled) return;

    let animId: number;
    // Auto-repeat (DAS) pour la navigation fluide dans les menus et Tetris
    let holdDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
    let holdStartTime = 0;
    let lastRepeatTime = 0;

    // Touches spécifiquement activées par la manette (pour ne JAMAIS écraser les touches du clavier physique)
    const activeGamepadKeys = new Set<string>();

    const dispatchSyntheticKey = (type: 'keydown' | 'keyup', code: string) => {
      window.dispatchEvent(
        new KeyboardEvent(type, {
          code,
          key: code,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    const updateLoop = () => {
      const snap = readGamepadSnapshot(0.35);
      const opts = optionsRef.current;

      if (!snap || !opts.enabled) {
        // En cas de déconnexion manette, libérer les touches précédemment maintenues par la manette
        if (activeGamepadKeys.size > 0) {
          const keys = opts.gamepadKeysRef?.current || opts.keysDownRef?.current;
          if (keys) {
            activeGamepadKeys.forEach((code) => keys.delete(code));
          }
          activeGamepadKeys.clear();
        }
        animId = requestAnimationFrame(updateLoop);
        return;
      }

      if (snap && opts.enabled) {
        // Utiliser en priorité le Set dédié manette pour une isolation 100% totale
        const keys = opts.gamepadKeysRef?.current || opts.keysDownRef?.current;
        const currentGame = opts.gameId;

        // 1. Mise à jour continue directe sans écraser les touches du clavier
        if (keys) {
          // Helper défensif : active la touche si la manette l'actionne, mais NE LA SUPPRIME
          // QUE si c'est la manette qui l'avait activée. Garantit que le clavier reste 100% prioritaire.
          const syncKey = (code: string, active: boolean) => {
            if (active) {
              keys.add(code);
              activeGamepadKeys.add(code);
            } else if (activeGamepadKeys.has(code)) {
              keys.delete(code);
              activeGamepadKeys.delete(code);
            }
          };

          // Haut (Sauf Tetris où Haut est une rotation discrète)
          if (currentGame !== 'tetris') {
            syncKey('ArrowUp', Boolean(snap.up));
            syncKey('KeyW', Boolean(snap.up));
          }

          // Bas (ou Action B / X pour glisser dans Course Sylvestre)
          const isDown = Boolean(snap.down || (currentGame === 'run' && (snap.actionB || snap.actionX)));
          syncKey('ArrowDown', isDown);
          syncKey('KeyS', isDown);

          // Gauche
          syncKey('ArrowLeft', Boolean(snap.left));
          syncKey('KeyA', Boolean(snap.left));

          // Droite
          syncKey('ArrowRight', Boolean(snap.right));
          syncKey('KeyD', Boolean(snap.right));

          // Action A (Saut / Tir / Battement / Lancement)
          if (currentGame === 'flappy') {
            // Pour Flappy, saut sur impulsion uniquement pour éviter l'effet "collé au plafond"
            if (snap.justActionA || snap.justUp) {
              keys.add('Space');
              activeGamepadKeys.add('Space');
            }
          } else if (currentGame !== 'tetris') {
            const isActionA = Boolean(snap.actionA || snap.rt);
            syncKey('Space', isActionA);
          }

          // Action B / X (Touche E : Hyperdrive dans Vectrex)
          if (currentGame === 'vectrex') {
            const isActionB = Boolean(snap.actionB || snap.actionX);
            syncKey('KeyE', isActionB);
          }
        }

        // 2. Déclenchements discrets (JustPressed) et répétition cadencée (DAS)
        const now = performance.now();
        const currentDir = snap.up ? 'UP' : snap.down ? 'DOWN' : snap.left ? 'LEFT' : snap.right ? 'RIGHT' : null;

        if (currentDir !== holdDir) {
          holdDir = currentDir;
          holdStartTime = now;
          lastRepeatTime = now;

          if (currentDir) {
            const code =
              currentDir === 'UP'
                ? 'ArrowUp'
                : currentDir === 'DOWN'
                ? 'ArrowDown'
                : currentDir === 'LEFT'
                ? 'ArrowLeft'
                : 'ArrowRight';

            if (opts.gameId === 'tetris') {
              dispatchSyntheticKey('keydown', code);
            }
            opts.onDirectionJustPressed?.(currentDir);
          }
        } else if (holdDir && now - holdStartTime > 220 && now - lastRepeatTime > 65) {
          // Répétition automatique (DAS)
          // Pour Tetris, la rotation (Haut) ne se répète pas pour éviter le sur-tournoiement
          if (!(opts.gameId === 'tetris' && holdDir === 'UP')) {
            lastRepeatTime = now;
            const code =
              holdDir === 'UP'
                ? 'ArrowUp'
                : holdDir === 'DOWN'
                ? 'ArrowDown'
                : holdDir === 'LEFT'
                ? 'ArrowLeft'
                : 'ArrowRight';

            if (opts.gameId === 'tetris') {
              dispatchSyntheticKey('keydown', code);
            }
            opts.onDirectionJustPressed?.(holdDir);
          }
        }

        // 3. Actions discrètes
        if (opts.gameId === 'tetris') {
          // Dans Tetris : Croix / A, Rond / B ou Carré / X = Rotation
          if (snap.justActionA || snap.justActionB || snap.justActionX) {
            dispatchSyntheticKey('keydown', 'ArrowUp');
            opts.onActionJustPressed?.();
          }
          // Y ou RT = Chute instantanée (Hard Drop)
          if (snap.justActionY || snap.justRt) {
            dispatchSyntheticKey('keydown', 'Space');
          }
        } else {
          // Action A (Saut / Tir / Lancement / Validation)
          if (snap.justActionA) {
            opts.onActionJustPressed?.();
          }

          // Action secondaire (X ou B)
          if (snap.justActionX || snap.justActionB) {
            opts.onActionSecondaryJustPressed?.();
          }
        }

        // Start / Options : Rejouer / Pause
        if (snap.justStart) {
          opts.onRestartJustPressed?.();
        }

        // LB / RB : Changer de borne
        if (snap.justLb) {
          opts.onPrevGameJustPressed?.();
        }
        if (snap.justRb) {
          opts.onNextGameJustPressed?.();
        }

        // Select / Share : Quitter / Leaderboard
        if (snap.justSelect) {
          opts.onCloseJustPressed?.();
        }
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animId);
      // Nettoyage strict uniquement des touches que la manette avait elle-même activées
      const keys = optionsRef.current.gamepadKeysRef?.current || optionsRef.current.keysDownRef?.current;
      if (keys) {
        activeGamepadKeys.forEach((code) => keys.delete(code));
      }
      activeGamepadKeys.clear();
    };
  }, [enabled]);
}
