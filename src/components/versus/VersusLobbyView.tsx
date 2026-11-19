import React from 'react';
import {
  Swords,
  Users,
  Zap,
  Radio,
  Bot,
  Copy,
  Check,
  ShieldCheck,
  User,
  LogOut,
  Dices,
} from 'lucide-react';
import { SteamIcon } from '../common/SteamIcon';
import { soundFx } from '../../utils/audio';
import type { VersusDiscipline } from '../../types/versus';
import {
  VERSUS_DISCIPLINES,
  getDisciplineMeta,
  type VersusPhase,
} from './versusConstants';

interface VersusLobbyViewProps {
  phase: VersusPhase;
  profile: any;
  playerAvatar: any;
  isSteamConnected: boolean;
  handleSwitchAccount: () => void;
  selectedDiscipline: VersusDiscipline;
  setSelectedDiscipline: (d: VersusDiscipline) => void;
  handleCreateRoom: () => void;
  joinCodeInput: string;
  setJoinCodeInput: (code: string) => void;
  handleJoinRoom: () => void;
  handleStartSoloBot: () => void;
  roomCode: string;
  handleCopyInvite: () => void;
  copiedLink: boolean;
  onCancelWaiting: () => void;
}

export const VersusLobbyView: React.FC<VersusLobbyViewProps> = ({
  phase,
  profile,
  playerAvatar,
  isSteamConnected,
  handleSwitchAccount,
  selectedDiscipline,
  setSelectedDiscipline,
  handleCreateRoom,
  joinCodeInput,
  setJoinCodeInput,
  handleJoinRoom,
  handleStartSoloBot,
  roomCode,
  handleCopyInvite,
  copiedLink,
  onCancelWaiting,
}) => {
  // LOBBY INITIAL
  if (phase === 'lobby') {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Swords className="w-4 h-4" />
            Arène Multijoueur 1v1 • Relais Souverain (0 Popup)
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Arène Face-à-Face
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
            Défiez un ami en direct sur notre relais souverain sécurisé ou entraînez vos réflexes solo contre le Grand-Duc. Première personne à 2 victoires l'emporte !
          </p>
        </div>

        {/* Profil Joueur ELO & Statut Compte */}
        <div className="max-w-md mx-auto p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${playerAvatar.bgGradient} flex items-center justify-center text-2xl shadow-md overflow-hidden p-1`}
              >
                {playerAvatar.imageUrl ? (
                  <img src={playerAvatar.imageUrl} alt={playerAvatar.name} className="w-full h-full object-contain" />
                ) : (
                  playerAvatar.emoji
                )}
              </div>
              <div>
                <div className="text-sm font-black text-white">{profile.username}</div>
                <div className="text-xs text-amber-400 font-semibold">{profile.title}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Votre Rang ELO</div>
              <div className="text-lg font-black text-indigo-400 font-mono">
                {profile.versusStats?.eloRating ?? 1000}
              </div>
            </div>
          </div>

          {/* Barre de statut du compte joueur & bouton changer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              {isSteamConnected ? (
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <SteamIcon className="w-3.5 h-3.5" />
                  <span>Steam ({profile.steam?.personaName || profile.username})</span>
                </span>
              ) : profile.email ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Cloud ({profile.email})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <User className="w-3.5 h-3.5" />
                  <span>Compte Joueur Local</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSwitchAccount}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-semibold transition cursor-pointer"
              title="Changer de compte ou se déconnecter"
            >
              <LogOut className="w-3 h-3" />
              <span>Changer</span>
            </button>
          </div>
        </div>

        {/* SÉLECTEUR DE DISCIPLINE DE DUEL */}
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Dices className="w-4 h-4 text-amber-400" />
              <span>Discipline du Duel</span>
            </span>
            <span className="text-[11px] text-amber-400 font-bold">
              {selectedDiscipline === 'all'
                ? 'Épreuves tournantes par manche'
                : `Manches 100% ${getDisciplineMeta(selectedDiscipline).label}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {VERSUS_DISCIPLINES.map((disc) => {
              const IconComponent = disc.icon;
              const isSelected = selectedDiscipline === disc.id;
              return (
                <button
                  key={disc.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedDiscipline(disc.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-[#131a29] border-[#1e293b] hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {disc.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                    {disc.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cartes des Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Mode 1: Duel Réel entre Amis (Relais Souverain) */}
          <div className="p-6 bg-gradient-to-b from-[#131a29] to-[#0e1422] border border-amber-500/30 hover:border-amber-500/60 rounded-3xl shadow-xl flex flex-col justify-between transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-black text-white">
                  Duel 1v1 en Direct
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  0 Popup
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Connexion sécurisée via notre relais souverain OVHcloud. Aucun popup de réseau local, zéro configuration. Partagez un code ou le lien à un ami pour vous affronter en temps réel.
              </p>

              <button
                onClick={handleCreateRoom}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 mb-3 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                Créer un Salon Privé (Hôte)
              </button>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="HOOT-..."
                  maxLength={10}
                  className="flex-1 px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs font-mono font-bold text-white uppercase placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinCodeInput.trim()}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Rejoindre
                </button>
              </div>
            </div>
          </div>

          {/* Mode 2: Entraînement Solo contre le Grand-Duc */}
          <div className="p-6 bg-gradient-to-b from-[#131a29] to-[#0e1422] border border-[#1e293b] hover:border-indigo-500/40 rounded-3xl shadow-xl flex flex-col justify-between transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-black text-white">
                  Entraînement Solo
                </h3>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                  Chrono IA
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Affrontez l'intelligence du Grand-Duc pour affûter vos réflexes de reconnaissance rapide sans attendre un adversaire humain.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={handleStartSoloBot}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Défier le Grand-Duc en Solo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EN ATTENTE D'UN AMI (HÔTE)
  if (phase === 'waiting_friend') {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 bg-[#131a29] border border-amber-500/30 rounded-3xl shadow-2xl space-y-6 animate-in fade-in">
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-ping" />
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-xl">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black text-white">Salon Privé Ouvert</h3>
          <p className="text-xs text-slate-300 mt-1">
            Transmettez ce code à votre ami pour qu'il vous rejoigne en un clic.
          </p>
        </div>

        <div className="p-4 bg-[#0b0f19] border border-amber-500/40 rounded-2xl space-y-3">
          <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
            Code du Salon :
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-widest font-mono">
            {roomCode}
          </div>
          <button
            onClick={handleCopyInvite}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Lien copié dans le presse-papier !' : 'Copier le lien d\'invitation direct'}
          </button>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              soundFx.playClick();
              onCancelWaiting();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Annuler et quitter le salon
          </button>
        </div>
      </div>
    );
  }

  // RECHERCHE DU BOT SOLO
  if (phase === 'queueing') {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-[#131a29] border border-[#1e293b] rounded-3xl shadow-2xl space-y-6 animate-in fade-in">
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shadow-xl">
            <Bot className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black text-white">Éveil du Grand-Duc...</h3>
          <p className="text-xs text-slate-400 mt-1">
            Calibrage d'un défi chronométré adapté à vos {profile.versusStats?.eloRating ?? 1000} ELO
          </p>
        </div>
      </div>
    );
  }

  return null;
};
