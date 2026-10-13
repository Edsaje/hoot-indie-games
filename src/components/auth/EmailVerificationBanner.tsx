import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUserAccount } from '../../context/useUserAccount';
import { soundFx } from '../../utils/audio';

export interface EmailVerificationBannerProps {
  onOpenModal?: () => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ onOpenModal }) => {
  const { isAuthenticated, isEmailVerified, profile, resendVerificationEmail } = useUserAccount();

  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Décompte actif du cooldown (en secondes)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Nettoyage automatique du message de feedback après 5s
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Si l'utilisateur n'est pas connecté ou si l'e-mail est déjà vérifié, ne rien afficher
  if (!isAuthenticated || isEmailVerified) {
    return null;
  }

  const handleOpenModal = () => {
    soundFx.playClick();
    if (onOpenModal) {
      onOpenModal();
    } else {
      window.dispatchEvent(new CustomEvent('hoot_open_email_verification'));
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    soundFx.playClick();
    try {
      const res = await resendVerificationEmail();
      if (res.success) {
        soundFx.playSuccess();
        setCooldown(res.cooldownRemaining ?? 60);
        setFeedback({
          type: 'success',
          message: res.message || 'Un nouvel e-mail de confirmation vient de vous être envoyé !',
        });
      } else {
        soundFx.playError();
        if (res.cooldownRemaining) {
          setCooldown(res.cooldownRemaining);
        }
        setFeedback({
          type: 'error',
          message: res.error || 'Impossible de renvoyer l\'e-mail pour le moment.',
        });
      }
    } catch {
      soundFx.playError();
      setFeedback({
        type: 'error',
        message: 'Erreur réseau lors du renvoi.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <aside
      aria-label="Vérification de l'adresse e-mail"
      className="sticky top-14 sm:top-16 z-30 w-full bg-gradient-to-r from-[#171206]/95 via-[#231707]/95 to-[#171206]/95 border-b border-amber-500/40 backdrop-blur-md px-3 sm:px-6 py-2.5 text-xs text-amber-200 shadow-lg shadow-amber-950/20 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Message d'information */}
        <div className="flex items-center gap-2.5 min-w-0 text-center sm:text-left">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <Mail className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-amber-200 text-xs flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
              <span>Un e-mail de confirmation t'a été envoyé.</span>
              {profile.email && (
                <span className="font-mono text-[11px] text-amber-300/90 underline decoration-amber-500/40">
                  {profile.email}
                </span>
              )}
            </p>
            <p className="text-[11px] text-amber-100/70 leading-tight mt-0.5">
              Valide ton adresse pour déverrouiller l'accès complet au tchat et protéger ton compte.
            </p>
          </div>
        </div>

        {/* Boutons d'action & retour d'état */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
          {feedback && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 animate-in fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-rose-400" />
              )}
              <span className="truncate max-w-[200px] sm:max-w-xs">{feedback.message}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer touch-manipulation whitespace-nowrap active:scale-95 ${
              cooldown > 0 || isResending
                ? 'bg-black/30 border-amber-500/20 text-amber-300/60 cursor-not-allowed'
                : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/40 hover:border-amber-400 text-amber-200'
            }`}
            title={cooldown > 0 ? `Attendez encore ${cooldown}s` : 'Renvoyer un e-mail de confirmation'}
          >
            <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
            <span>
              {cooldown > 0 ? `Renvoyer (${cooldown}s)` : isResending ? 'Envoi...' : 'Renvoyer l\'e-mail'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-950/40 transition flex items-center gap-1.5 cursor-pointer touch-manipulation whitespace-nowrap active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saisir le code</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
