import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { useUserAccount } from '../../context/useUserAccount';
import { soundFx } from '../../utils/audio';

export interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
}) => {
  const { profile, isEmailVerified, verifyEmail, resendVerificationEmail } = useUserAccount();

  const [otpCode, setOtpCode] = useState(initialCode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronise initialCode si fourni
  useEffect(() => {
    if (initialCode) {
      setOtpCode(initialCode.trim().toUpperCase());
    }
  }, [initialCode]);

  // Focus automatique au montage / ouverture
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Décompte actif du cooldown de renvoi
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Si l'e-mail est déjà vérifié, fermeture automatique après célébration
  useEffect(() => {
    if (isOpen && isEmailVerified && !successMessage) {
      setSuccessMessage('Votre adresse e-mail est déjà confirmée !');
      const timer = setTimeout(() => onClose(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isEmailVerified, successMessage, onClose]);

  // Touche Échap pour fermer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    setOtpCode(raw);
    if (errorMessage) setErrorMessage(null);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = otpCode.trim();
    if (!clean || isVerifying) return;

    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    soundFx.playClick();

    try {
      const res = await verifyEmail(clean);
      if (res.success) {
        soundFx.playChime();
        setSuccessMessage(res.message || 'Adresse e-mail vérifiée avec succès ! Accès au tchat déverrouillé.');
        // Ferme la modale après 2 secondes pour laisser le temps de lire le succès
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        soundFx.playError();
        setErrorMessage(res.error || 'Code ou jeton invalide ou expiré.');
      }
    } catch (err: any) {
      soundFx.playError();
      setErrorMessage(err?.message || 'Erreur réseau lors de la validation.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    soundFx.playClick();

    try {
      const res = await resendVerificationEmail();
      if (res.success) {
        soundFx.playSuccess();
        setCooldown(res.cooldownRemaining ?? 60);
        setSuccessMessage(res.message || 'Un nouvel e-mail de confirmation vient de vous être envoyé !');
      } else {
        soundFx.playError();
        if (res.cooldownRemaining) {
          setCooldown(res.cooldownRemaining);
        }
        setErrorMessage(res.error || 'Impossible de renvoyer l\'e-mail pour le moment.');
      }
    } catch (err: any) {
      soundFx.playError();
      setErrorMessage(err?.message || 'Erreur réseau lors du renvoi.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#03150f] border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-amber-950/40 text-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Mail className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Confirmer votre e-mail</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </h3>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Protection du compte et déverrouillage du tchat
            </p>
          </div>
        </div>

        {/* Explication & Adresse e-mail */}
        <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 text-xs text-slate-300 leading-relaxed">
          <p>
            Un e-mail contenant un lien cliquable et un code de confirmation a été envoyé à :
          </p>
          <p className="mt-1 font-mono font-bold text-amber-300 text-sm break-all">
            {profile.email || 'votre adresse e-mail'}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            💡 Vous pouvez soit cliquer directement sur le lien reçu dans l'e-mail, soit saisir le code à 6 chiffres ci-dessous.
          </p>
        </div>

        {/* Alerte de retour : Succès (Émeraude) */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="font-semibold leading-tight">{successMessage}</p>
          </div>
        )}

        {/* Alerte de retour : Erreur (Rouge Rubis) */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="font-semibold leading-tight">{errorMessage}</p>
          </div>
        )}

        {/* Formulaire de saisie du code OTP */}
        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Code de confirmation OTP</span>
              </span>
              <span className="text-[10px] text-slate-400">6 chiffres</span>
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={otpCode}
                onChange={handleCodeChange}
                placeholder="123456"
                maxLength={8}
                autoComplete="one-time-code"
                className="w-full px-4 py-3 rounded-xl bg-[#020d0a] border-2 border-[#78350f]/70 focus:border-amber-400 text-amber-200 font-mono text-center text-xl tracking-[0.4em] placeholder:tracking-normal placeholder:text-slate-600 focus:outline-none transition shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!otpCode.trim() || isVerifying || Boolean(successMessage)}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95 ${
              !otpCode.trim() || isVerifying || Boolean(successMessage)
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white border border-amber-400/50 shadow-emerald-950/40'
            }`}
          >
            {isVerifying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Vérification en cours...</span>
              </>
            ) : (
              <>
                <span>Valider le code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Zone de renvoi d'email avec décompte actif */}
        <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[11px] text-center sm:text-left">
            Vous n'avez rien reçu ? Vérifiez vos spams.
          </span>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer touch-manipulation shrink-0 active:scale-95 ${
              cooldown > 0 || isResending
                ? 'bg-black/30 border-amber-500/20 text-amber-300/50 cursor-not-allowed'
                : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/30 hover:border-amber-400 text-amber-200'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
            <span>
              {cooldown > 0 ? `Renvoyer (${cooldown}s)` : isResending ? 'Envoi...' : 'Renvoyer l\'e-mail'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
