import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SteamIcon } from './SteamIcon';
import { OwlLogo } from './OwlLogo';
import { useUserAccount } from '../../context/useUserAccount';
import { soundFx } from '../../utils/audio';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, connectSteamWithOpenId } = useUserAccount();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Veuillez remplir votre adresse e-mail et votre mot de passe.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setIsLoading(true);
    soundFx.playClick();

    try {
      if (mode === 'signin') {
        const res = await loginWithEmail(email, password);
        if (res.success) {
          soundFx.playChime();
          setSuccessMessage('Connexion réussie ! Bienvenue sur le Perchoir.');
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          soundFx.playError();
          setErrorMessage(res.error || 'Identifiants invalides.');
        }
      } else {
        const res = await signUpWithEmail(email, password);
        if (res.success) {
          soundFx.playChime();
          setSuccessMessage('Compte créé avec succès ! Vos données sont désormais sauvegardées.');
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          soundFx.playError();
          setErrorMessage(res.error || 'Échec de la création du compte.');
        }
      }
    } catch (err: any) {
      soundFx.playError();
      setErrorMessage(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    soundFx.playClick();
    setErrorMessage(null);
    setIsLoading(true);
    const res = await loginWithGoogle();
    if (res.success) {
      soundFx.playChime();
      setSuccessMessage('Connexion Google réussie !');
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      soundFx.playError();
      setErrorMessage(res.error || 'Connexion Google indisponible.');
    }
    setIsLoading(false);
  };

  const handleSteamAuth = () => {
    soundFx.playClick();
    connectSteamWithOpenId();
  };

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-[#06241b] border-2 border-[#78350f] rounded-2xl sm:rounded-3xl shadow-2xl z-10 max-h-[92dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden"
          >
            <div className="hidden sm:block pointer-events-none">
              <SylvestreIvyFrame density="medium" />
            </div>
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-[#1e293b] shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <OwlLogo size="sm" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                    {mode === 'signin' ? 'Connexion au Sanctuaire' : 'Rejoindre Hoot Indie Games'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Sauvegardez vos streaks et synchronisez vos jeux
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer shrink-0"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body - smoothly scrollable on mobile */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
              {/* 1-Click Authentication Buttons */}
              <div className="space-y-2.5">
                {/* Steam 1-Click Button */}
                <button
                  onClick={handleSteamAuth}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#171a21] hover:bg-[#1f2430] border border-[#2a475e] hover:border-cyan-400/60 text-white font-bold text-xs transition shadow-lg group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <SteamIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-slate-100 group-hover:text-cyan-300 transition">
                        Continuer avec Steam
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        Connexion 1 clic &amp; synchro bibliothèque
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                    Recommandé
                  </span>
                </button>

                {/* Google 1-Click Button */}
                <button
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] hover:border-slate-600 text-white font-bold text-xs transition shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
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
                        Connexion sécurisée via compte Google
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#1e293b] w-full" />
                <span className="bg-[#0f172a] px-3 text-[11px] uppercase tracking-wider text-slate-500 font-bold shrink-0">
                  ou avec votre e-mail
                </span>
                <div className="border-t border-[#1e293b] w-full" />
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-[#0b0f19] border border-[#1e293b] rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition ${
                    mode === 'signin'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition ${
                    mode === 'signup'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Créer un compte
                </button>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span className="leading-relaxed">{successMessage}</span>
                </div>
              )}

              {/* Standard Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Adresse E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      required
                      className="w-full bg-[#131a29] border border-[#1e293b] focus:border-amber-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#131a29] border border-[#1e293b] focus:border-amber-500 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 active:scale-98 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : mode === 'signin' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      Se connecter
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Créer mon compte
                    </>
                  )}
                </button>
              </form>

              {/* Free play reassurance */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-4"
                >
                  Continuer en tant que visiteur (jouer sans compte)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
