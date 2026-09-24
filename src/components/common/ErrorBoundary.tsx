import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCw, Home, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  isModal?: boolean;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🦉 [Hoot ErrorBoundary] Exception capturée :', error, errorInfo);

    // Détection des erreurs de chunk Vite suite à un nouveau déploiement
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /loading chunk/i.test(error?.message || '') ||
      /failed to fetch dynamically imported module/i.test(error?.message || '') ||
      /error loading dynamically imported module/i.test(error?.message || '');

    if (isChunkError && typeof window !== 'undefined') {
      const storageKey = 'hoot_chunk_reload_ts';
      const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
      const now = Date.now();

      // Éviter les boucles infinies de rechargement (max 1 auto-reload toutes les 15 secondes)
      if (now - lastReload > 15000) {
        sessionStorage.setItem(storageKey, String(now));
        console.warn('🦉 Nouveau déploiement détecté, rechargement automatique du bundle...');
        window.location.reload();
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.isModal) {
        return (
          <div className="p-6 text-center bg-[#072a20] border border-amber-500/40 rounded-2xl shadow-xl max-w-md mx-auto my-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              {this.props.fallbackTitle || 'Un contretemps est survenu'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {this.props.fallbackMessage || 'Une plume s’est égarée dans ce panneau. Vous pouvez retenter l’ouverture ou rafraîchir.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Réessayer
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCw className="w-3 h-3" />
                <span>Rafraîchir</span>
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#072a20] border-2 border-amber-500/40 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 text-3xl">
              🦉
            </div>
            <h2 className="text-xl font-black text-white tracking-wide">
              {this.props.fallbackTitle || 'Oups, le Grand Hibou a trébuché !'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {this.props.fallbackMessage ||
                'Une erreur inattendue est survenue lors de l’affichage. Pas d’inquiétude, vos données de progression sont en sécurité.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Recharger la page</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.href = '/';
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Accueil</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
