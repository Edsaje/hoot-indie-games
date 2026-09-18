import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  MessageCircle,
} from 'lucide-react';

const XTwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
import { soundFx } from '../../utils/audio';
import {
  generateShareCardDataUrl,
  generateShareCardBlob,
  downloadShareCard,
  type ShareCardData,
} from '../../utils/generateShareCard';

interface ShareResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData;
}

export const ShareResultModal: React.FC<ShareResultModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);

  // Generate Image Card Data URL when opened
  useEffect(() => {
    if (!isOpen) {
      setCardDataUrl(null);
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    generateShareCardDataUrl(data)
      .then((url) => {
        if (isMounted) {
          setCardDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate share card:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, data]);

  // Clean, zero-spoil text formatted for social posts
  const canonicalUrl = `https://hootindiegames.com/#${data.gameMode.toLowerCase()}`;
  const shareText = `🦉 Hoot Indie Games — ${data.gameMode} du ${data.date}\n${
    data.isWon ? '🏆 Victoire !' : '🎯 Défi terminé !'
  } ${data.scoreText}\n\n${data.details.join('\n')}\n\nRejoins le Sanctuaire des Jeux Indés :\n${canonicalUrl}`;

  const handleCopyText = async () => {
    soundFx.playClick();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = async () => {
    soundFx.playClick();
    await downloadShareCard(data);
  };

  const handleShareTwitter = () => {
    soundFx.playClick();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    soundFx.playClick();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      canonicalUrl
    )}&quote=${encodeURIComponent(
      `🦉 Mon résultat à ${data.gameMode} : ${data.scoreText} !`
    )}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    soundFx.playClick();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    soundFx.playClick();
    if (!navigator.share) return;

    try {
      const blob = await generateShareCardBlob(data);
      const file = new File([blob], `hoot-${data.gameMode.toLowerCase()}-${data.date}.png`, {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Hoot Indie Games — ${data.gameMode}`,
          text: shareText,
          files: [file],
        });
      } else {
        await navigator.share({
          title: `Hoot Indie Games — ${data.gameMode}`,
          text: shareText,
          url: canonicalUrl,
        });
      }
    } catch {
      // User cancelled or share not supported
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl bg-[#0f172a] border border-[#1e293b] rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 pb-3 flex items-center justify-between border-b border-[#1e293b]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    Partager mon Résultat
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      100% Zéro Spoil
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Image personnalisée &amp; message prêt à publier
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Generated Image Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-[#1e293b] bg-[#0b0f19] aspect-[1200/630] flex items-center justify-center shadow-lg">
                {isGenerating || !cardDataUrl ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span>Création de votre carte de partage HD...</span>
                  </div>
                ) : (
                  <img
                    src={cardDataUrl}
                    alt={`Carte de résultat ${data.gameMode}`}
                    className="w-full h-full object-contain select-none"
                  />
                )}
              </div>

              {/* Social Share 1-Click Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Partager directement sur :
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Twitter / X */}
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0b0f19] hover:bg-slate-800 border border-[#1e293b] hover:border-slate-600 text-slate-200 hover:text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <XTwitterIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>X (Twitter)</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={handleShareFacebook}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0b0f19] hover:bg-slate-800 border border-[#1e293b] hover:border-slate-600 text-slate-200 hover:text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <FacebookIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Facebook</span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0b0f19] hover:bg-slate-800 border border-[#1e293b] hover:border-slate-600 text-slate-200 hover:text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Native Mobile Share */}
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instagram / Plus</span>
                  </button>
                </div>
              </div>

              {/* Download & Copy Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Download PNG */}
                <button
                  onClick={handleDownload}
                  disabled={isGenerating || !cardDataUrl}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#131a29] hover:bg-slate-800 border border-[#1e293b] hover:border-amber-500/40 text-white font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Télécharger l'image (PNG)</span>
                </button>

                {/* Copy Text with emojis */}
                <button
                  onClick={handleCopyText}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-xs transition shadow-md cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Copié dans le presse-papier !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier le texte &amp; grille emojis</span>
                    </>
                  )}
                </button>
              </div>

              {/* Text Preview Box */}
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                  Aperçu du texte copié :
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                  {shareText}
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
