import React from 'react';
import { HeadlessModal } from './HeadlessModal';
import { OwlLogo } from './OwlLogo';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { X, Shield, Server, FileText, Lock, Globe } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  return (
    <HeadlessModal
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="relative w-full h-full sm:h-auto max-w-2xl bg-[#06241b] sm:border-2 border-0 border-[#78350f] rounded-none sm:rounded-3xl shadow-2xl max-h-[100dvh] sm:max-h-[88dvh] flex flex-col overflow-hidden text-slate-200"
    >
      <div className="hidden sm:block pointer-events-none">
        <SylvestreIvyFrame density="medium" />
      </div>

      {/* Ambiance dorée et émeraude */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-[#1e293b] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <OwlLogo size="sm" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Mentions Légales &amp; Confidentialité
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Transparence, hébergement souverain et respect de la vie privée (RGPD)
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

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-xs leading-relaxed text-slate-300">
        
        {/* Édition */}
        <section className="p-4 bg-[#081f18] border border-[#0d543e]/50 rounded-2xl space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            1. Édition du Site
          </h3>
          <p>
            Le site <strong>Hoot Indie Games</strong> (accessible à l'adresse <a href="https://hootindiegames.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">hootindiegames.com</a>) est une création artisanale et indépendante conçue et développée par :
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li><strong>Éditeur responsable :</strong> Quentin Beaud (alias Hibouxe / Edsaje)</li>
            <li><strong>Localisation :</strong> Annecy, Haute-Savoie, France</li>
            <li><strong>Contact :</strong> <a href="mailto:contact@hootindiegames.com" className="text-amber-400 hover:underline">contact@hootindiegames.com</a></li>
            <li><strong>Activité :</strong> Plateforme gratuite et indépendante dédiée à la découverte du jeu vidéo indépendant, sans abonnement payant ni régie publicitaire intrusive.</li>
          </ul>
        </section>

        {/* Hébergement */}
        <section className="p-4 bg-[#081f18] border border-[#0d543e]/50 rounded-2xl space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            2. Hébergement &amp; Infrastructure
          </h3>
          <p>
            L'ensemble des fichiers statiques, du moteur d'exécution PHP et des données applicatives est hébergé sur les infrastructures souveraines de :
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li><strong>Hébergeur :</strong> OVHcloud SAS</li>
            <li><strong>Siège social :</strong> 2 rue Kellermann, 59100 Roubaix, France</li>
            <li><strong>Datacenter :</strong> France (Union Européenne)</li>
            <li><strong>Site officiel :</strong> <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">www.ovhcloud.com</a></li>
          </ul>
        </section>

        {/* Protection des données & RGPD */}
        <section className="p-4 bg-[#081f18] border border-[#0d543e]/50 rounded-2xl space-y-2.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            3. Protection des Données Personnelles (RGPD &amp; ePrivacy)
          </h3>
          <p>
            Hoot Indie Games applique le principe de <em>Privacy by Design</em>. Nous ne faisons aucun commerce de données et n'utilisons aucun traceur publicitaire tiers (Google Analytics, Meta Pixel, régies publicitaires sont totalement absents).
          </p>

          <div className="space-y-2 pt-1">
            <div className="p-3 bg-[#03140e] border border-[#0f4c38] rounded-xl space-y-1">
              <strong className="text-amber-300 block text-xs">Télémétrie &amp; Statistiques Cookieless</strong>
              <p className="text-[11px] text-slate-400">
                L'audience et l'utilisation des mini-jeux sont mesurées via notre propre API souveraine. Les adresses IP sont hachées cryptographiquement en SHA-256 avec la date du jour et une clé secrète serveur, puis tronquées. Aucune adresse IP brute n'est stockée sur disque, rendant impossible tout suivi nominatif inter-jours (conforme aux critères d'exemption de consentement de la CNIL).
              </p>
            </div>

            <div className="p-3 bg-[#03140e] border border-[#0f4c38] rounded-xl space-y-1">
              <strong className="text-emerald-300 block text-xs">Comptes Utilisateurs Souverains</strong>
              <p className="text-[11px] text-slate-400">
                La création d'un compte nécessite une adresse e-mail valide. Les mots de passe sont hachés de manière irréversible via l'algorithme Bcrypt. Ces données servent exclusivement à authentifier le joueur et à synchroniser sa progression (plumes, cartes du sanctuaire, séries de victoires) entre ses différents appareils.
              </p>
            </div>

            <div className="p-3 bg-[#03140e] border border-[#0f4c38] rounded-xl space-y-1">
              <strong className="text-slate-200 block text-xs">Cookies Strictement Techniques</strong>
              <p className="text-[11px] text-slate-400">
                Le seul cookie utilisé est le cookie de session de compte (HttpOnly, SameSite=Lax), indispensable au maintien de la connexion. Conformément à la directive européenne ePrivacy, les cookies strictement nécessaires au fonctionnement du service ne requièrent pas de consentement préalable.
              </p>
            </div>
          </div>
        </section>

        {/* Sous-traitants */}
        <section className="p-4 bg-[#081f18] border border-[#0d543e]/50 rounded-2xl space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            4. Sous-Traitants Techniques
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li><strong>OVHcloud (France / UE) :</strong> Hébergement web et stockage chiffré des sauvegardes de jeu.</li>
            <li><strong>Resend Inc. (UE / USA - DPF certifié) :</strong> Acheminement sécurisé des e-mails transactionnels (codes OTP et liens de confirmation de compte).</li>
            <li><strong>Valve Corporation (Steam Web API) :</strong> Uniquement interrogé si vous décidez d'associer volontairement votre compte Steam pour importer vos jeux possédés.</li>
          </ul>
        </section>

        {/* Droits des utilisateurs */}
        <section className="p-4 bg-[#081f18] border border-[#0d543e]/50 rounded-2xl space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            5. Vos Droits (Articles 15 à 22 du RGPD)
          </h3>
          <p>
            Vous disposez d'un contrôle total sur l'ensemble de vos données :
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li><strong>Droit à la portabilité (Art. 20) :</strong> Téléchargez l'intégralité de vos sauvegardes au format JSON standard en 1 clic dans l'onglet Profil (section Sauvegarde &amp; Restauration Manuelle).</li>
            <li><strong>Droit à l'effacement (Art. 17) :</strong> Supprimez définitivement votre compte et l'ensemble des données serveur associées en 1 clic depuis votre Profil (section Confidentialité), ou sur simple demande à <a href="mailto:contact@hootindiegames.com" className="text-rose-400 hover:underline">contact@hootindiegames.com</a>.</li>
            <li><strong>Droit de rectification (Art. 16) :</strong> Modifiez votre pseudonyme, votre avatar ou votre mot de passe à tout moment.</li>
          </ul>
        </section>
      </div>

      {/* Footer modal */}
      <div className="p-4 border-t border-[#1e293b] flex justify-end shrink-0 bg-[#041a13]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </HeadlessModal>
  );
};
