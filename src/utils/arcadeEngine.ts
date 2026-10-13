/**
 * Moteur de boucle temporelle canonique pour les jeux d'arcade Canvas.
 * Découplage strict entre la simulation physique à pas fixe (Fixed Timestep Accumulator à 60 Hz)
 * et le rendu graphique calé sur le cycle de rafraîchissement d'écran (requestAnimationFrame / VSync).
 */

export interface EngineLoopOptions {
  /** Fréquence de pas fixe de simulation physique (défaut : 1 / 60 s = 16.666 ms) */
  fixedStep?: number;
  /** Plafond maximal de temps accumulé pour parer la spirale de la mort (défaut : 0.1 s = 100 ms) */
  maxAccumulatedTime?: number;
}

/**
 * Configure un canvas 2D pour les écrans haute densité (Retina / DPR).
 * Adapte la résolution du tampon physique sans modifier le système de coordonnées logique (0..width, 0..height).
 *
 * @param canvas L'élément HTMLCanvasElement cible
 * @param ctx Le contexte de rendu CanvasRenderingContext2D
 * @param width Largeur logique en pixels CSS (défaut : 400)
 * @param height Hauteur logique en pixels CSS (défaut : 400)
 * @returns Le ratio DPR calculé et appliqué (plafonné à 2.5)
 */
export function setupRetinaCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width = 400,
  height = 400
): number {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.scale(dpr, dpr);
  return dpr;
}

/**
 * Lance une boucle de jeu à pas fixe avec accumulateur et gestion gracieuse de la visibilité.
 *
 * @param isActive Prédicat indiquant si la boucle doit continuer à tourner
 * @param update Callback de simulation physique recevant le pas fixe (dt en secondes)
 * @param render Callback de rendu graphique exécuté à chaque trame d'affichage VSync
 * @param options Paramètres optionnels de configuration temporelle
 * @returns Fonction de nettoyage pour détacher les écouteurs et annuler requestAnimationFrame
 */
export function startEngineLoop(
  isActive: () => boolean,
  update: (dt: number) => void,
  render: () => void,
  options?: EngineLoopOptions
): () => void {
  const FIXED_STEP = options?.fixedStep ?? 1 / 60;
  const MAX_ACCUMULATED_TIME = options?.maxAccumulatedTime ?? 0.1;

  let animId: number | null = null;
  let lastTime = performance.now();
  let accumulator = 0;
  let isPaused = false;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      isPaused = true;
    } else {
      isPaused = false;
      // Réinitialisation de lastTime pour éliminer tout saut de temps accumulé en arrière-plan
      lastTime = performance.now();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  const runner = (now: number) => {
    if (!isActive()) return;

    if (isPaused || document.hidden) {
      lastTime = now;
      animId = requestAnimationFrame(runner);
      return;
    }

    let frameDelta = (now - lastTime) / 1000;
    lastTime = now;

    // Protection anti-spirale de la mort : borner le delta pour éviter les saccades en chaîne après un lag
    if (frameDelta > MAX_ACCUMULATED_TIME) {
      frameDelta = MAX_ACCUMULATED_TIME;
    }

    accumulator += frameDelta;

    // Simulation physique à pas constant
    while (accumulator >= FIXED_STEP) {
      if (!isActive()) return;
      update(FIXED_STEP);
      accumulator -= FIXED_STEP;
    }

    // Rendu graphique synchronisé avec l'écran
    if (isActive()) {
      render();
      animId = requestAnimationFrame(runner);
    }
  };

  animId = requestAnimationFrame(runner);

  return () => {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
