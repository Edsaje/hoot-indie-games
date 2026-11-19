import React from 'react';
import {
  Lock,
  ShieldCheck,
  Cloud,
  Swords,
  User,
  Zap,
  Sparkles,
  AlertCircle,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { SteamIcon } from '../common/SteamIcon';
import { soundFx } from '../../utils/audio';

interface VersusAuthGateProps {
  authUsername: string;
  setAuthUsername: (name: string) => void;
  authLoading: boolean;
  authError: string | null;
  handleSteam1Click: () => void;
  handleGoogle1Click: () => void;
  handleInstantGuest1Click: () => void;
  onOpenAuth?: () => void;
  currentUsername?: string;
  onApplyUsername?: (name: string) => void;
}

export const VersusAuthGate: React.FC<VersusAuthGateProps> = ({
  authUsername,
  setAuthUsername,
  authLoading,
  authError,
  handleSteam1Click,
  handleGoogle1Click,
  handleInstantGuest1Click,
  onOpenAuth,
  currentUsername,
  onApplyUsername,
}) => {
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Compte Joueur Requis • Cloud Souverain</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Accédez à l'Arène 1v1
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Pour défier vos amis en direct, affronter le Grand-Duc et sauvegarder votre cote ELO sur notre cloud souverain, connectez-vous ou créez votre compte joueur gratuit.
        </p>
      </div>

      {/* Avantages du compte */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-[#131a29]/80 border border-[#1e293b] rounded-2xl text-center text-xs">
        <div className="p-2 space-y-1">
          <ShieldCheck className="w-5 h-5 mx-auto text-amber-400" />
          <div className="font-bold text-white text-[11px]">Classement ELO</div>
          <div className="text-[10px] text-slate-400">Progression garantie</div>
        </div>
        <div className="p-2 space-y-1">
          <Cloud className="w-5 h-5 mx-auto text-emerald-400" />
          <div className="font-bold text-white text-[11px]">Cloud Souverain</div>
          <div className="text-[10px] text-slate-400">0 perte de données</div>
        </div>
        <div className="p-2 space-y-1">
          <Swords className="w-5 h-5 mx-auto text-indigo-400" />
          <div className="font-bold text-white text-[11px]">Duels P2P</div>
          <div className="text-[10px] text-slate-400">Temps réel direct</div>
        </div>
      </div>

      {/* Carte Formulaire & Méthodes 1 Clic */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-[#131a29] to-[#0e1422] border border-amber-500/30 rounded-3xl shadow-2xl space-y-6">
        {/* Champ Pseudo Rapide */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Votre Pseudo de Duelliste</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Personnalisable à tout moment</span>
          </label>
          <input
            type="text"
            value={authUsername}
            onChange={(e) => setAuthUsername(e.target.value)}
            placeholder="Ex: Maître Du Hibou"
            className="w-full px-4 py-2.5 bg-[#0b0f19] border border-[#1e293b] focus:border-amber-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition"
          />
        </div>

        {/* Méthodes 1 Clic */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Création &amp; Connexion en 1 Clic</span>
            </span>
            <span className="text-emerald-400 font-bold">Sans mot de passe</span>
          </div>

          {/* 1. Continuer avec Steam */}
          <button
            type="button"
            onClick={handleSteam1Click}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#171a21] hover:bg-[#1f2430] border border-[#2a475e] hover:border-cyan-400/60 text-white font-bold text-xs transition shadow-lg group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <SteamIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-slate-100 group-hover:text-cyan-300 transition flex items-center gap-2">
                  <span>Continuer avec Steam</span>
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Connexion 1 clic &amp; synchro bibliothèque Valve
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20 shrink-0">
              Recommandé
            </span>
          </button>

          {/* 2. Continuer avec Google */}
          <button
            type="button"
            onClick={handleGoogle1Click}
            disabled={authLoading}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] hover:border-slate-600 text-white font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-200">
                  Continuer avec Google
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Connexion &amp; compte cloud en 1 clic
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg shrink-0">
              1 Clic
            </span>
          </button>

          {/* 3. Bouton Compte Joueur Local 1 Clic */}
          <button
            type="button"
            onClick={handleInstantGuest1Click}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-white font-bold text-xs transition shadow-md group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-amber-300 group-hover:text-amber-200 transition">
                  Création Express 1 Clic (Profil Local)
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Accès immédiat à l'arène avec sauvegarde locale de votre ELO
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 shrink-0">
              Instantané
            </span>
          </button>
        </div>

        {/* Séparateur */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Ou par e-mail &amp; mot de passe
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {authError && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{authError}</span>
          </div>
        )}

        {/* Connexion / Inscription via la modale officielle AuthModal */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            if (onApplyUsername && authUsername.trim() && authUsername.trim() !== currentUsername) {
              onApplyUsername(authUsername.trim());
            }
            if (onOpenAuth) {
              onOpenAuth();
            }
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2.5"
        >
          <Mail className="w-4 h-4 text-slate-950" />
          <span>Se connecter ou Créer un compte par Email</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
