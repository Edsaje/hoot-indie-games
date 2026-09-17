import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Shield,
  Cloud,
  Download,
  Upload,
  Swords,
  Trophy,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import { useUserAccount } from '../../context/useUserAccount';
import { useAchievements } from '../../context/useAchievements';
import { INDIE_AVATARS } from '../../data/avatars';
import type { IndieAvatarId } from '../../types/user';
import { soundFx } from '../../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    isAuthenticated,
    setAvatar,
    setUsername,
    exportSaveData,
    importSaveData,
    loginWithEmail,
    signUpWithEmail,
    logout,
    syncCloud,
  } = useUserAccount();

  const { feathersCount, unlockedIds, allAchievements } = useAchievements();

  const [activeTab, setActiveTab] = useState<'profile' | 'cloud'>('profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentAvatar = INDIE_AVATARS.find((a) => a.id === profile.avatarId) || INDIE_AVATARS[0];

  const handleSaveName = () => {
    soundFx.playClick();
    setUsername(nameInput);
    setIsEditingName(false);
  };

  const handleExport = () => {
    soundFx.playChime();
    const dataStr = exportSaveData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hoot-save-${profile.username.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importSaveData(content);
        if (res.success) {
          soundFx.playVictory();
          setSyncStatus('Sauvegarde restaurée avec succès !');
        } else {
          soundFx.playError();
          setSyncStatus(res.error || 'Erreur lors de l’importation.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;
    setIsAuthLoading(true);
    setAuthError(null);
    const res = await loginWithEmail(emailInput, passwordInput);
    setIsAuthLoading(false);
    if (!res.success) {
      soundFx.playError();
      setAuthError(res.error || 'Échec de connexion');
    } else {
      soundFx.playVictory();
      setSyncStatus('Connexion réussie !');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;
    setIsAuthLoading(true);
    setAuthError(null);
    const res = await signUpWithEmail(emailInput, passwordInput);
    setIsAuthLoading(false);
    if (!res.success) {
      soundFx.playError();
      setAuthError(res.error || 'Échec de création de compte');
    } else {
      soundFx.playVictory();
      setSyncStatus('Compte créé avec succès !');
    }
  };

  const handleSyncCloud = async () => {
    soundFx.playClick();
    setIsAuthLoading(true);
    const res = await syncCloud();
    setIsAuthLoading(false);
    setSyncStatus(res.message);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0e1422] border border-[#1e293b] rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Profil du Joueur
                </h2>
                <p className="text-xs text-slate-400">
                  Personnalisez votre avatar et synchronisez votre progression
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 my-4 p-1 bg-[#131a29] border border-[#1e293b] rounded-2xl shrink-0">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('profile');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Avatar & Stats
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('cloud');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'cloud'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cloud className="w-4 h-4" />
              Compte & Sauvegarde
            </button>
          </div>

          {/* Content Body */}
          <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            {activeTab === 'profile' ? (
              <>
                {/* Profile Card Summary */}
                <div className="p-4 bg-gradient-to-br from-[#131a29] to-[#0d131f] border border-[#1e293b] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentAvatar.bgGradient} border-2 border-amber-500/40 flex items-center justify-center text-4xl shadow-xl shrink-0`}
                  >
                    {currentAvatar.emoji}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            maxLength={24}
                            className="px-2.5 py-1 bg-slate-900 border border-amber-500/50 rounded-lg text-white font-bold text-sm focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveName}
                            className="p-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-black text-white tracking-tight">
                            {profile.username}
                          </h3>
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setNameInput(profile.username);
                              setIsEditingName(true);
                            }}
                            className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 mt-0.5">
                      <Shield className="w-3 h-3" />
                      {profile.title}
                    </div>
                    <p className="text-xs text-slate-400 italic mt-1.5">
                      "{currentAvatar.quote}"
                    </p>
                  </div>

                  {/* Rating / Feathers Pill */}
                  <div className="flex sm:flex-col items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                    <div className="text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Plumes</div>
                      <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {feathersCount}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Rang ELO</div>
                      <div className="text-sm font-black text-indigo-400 flex items-center justify-center gap-1">
                        <Swords className="w-3.5 h-3.5" />
                        {profile.versusStats.eloRating}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avatar Selection Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Choisissez votre Compagnon Indé
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {INDIE_AVATARS.map((avatar) => {
                      const isSelected = profile.avatarId === avatar.id;
                      return (
                        <button
                          key={avatar.id}
                          onClick={() => {
                            soundFx.playClick();
                            setAvatar(avatar.id as IndieAvatarId);
                          }}
                          className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                              : 'bg-[#131a29] border-[#1e293b] hover:border-slate-700 hover:bg-[#182133]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{avatar.emoji}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                {avatar.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {avatar.game}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Performance Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl text-center">
                    <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-base font-black text-white">
                      {unlockedIds.length}/{allAchievements.length}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">Succès Débloqués</div>
                  </div>

                  <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl text-center">
                    <Swords className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <div className="text-base font-black text-white">
                      {profile.versusStats.matchesWon}/{profile.versusStats.matchesPlayed}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">Victoires Versus</div>
                  </div>

                  <div className="p-3 bg-[#131a29] border border-[#1e293b] rounded-2xl text-center">
                    <Sparkles className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                    <div className="text-base font-black text-white">
                      {profile.versusStats.bestStreak}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">Meilleure Série</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Cloud & Backup Tab */}
                <div className="p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">
                        Synchronisation Cloud (Supabase)
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isAuthenticated
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isAuthenticated ? 'Connecté' : 'Mode Invité / Hors-ligne'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Vos données sont automatiquement préservées en local sur cet appareil. Connectez un compte pour synchroniser vos séries et trophées entre votre PC, votre téléphone et vos duels en ligne.
                  </p>

                  {/* Auth Forms */}
                  {!isAuthenticated ? (
                    <form className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                          Adresse Email
                        </label>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="joueur@exemple.com"
                          className="w-full px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                          Mot de passe
                        </label>
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {authError && (
                        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/50">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleLogin}
                          disabled={isAuthLoading}
                          className="flex-1 py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-50"
                        >
                          Se Connecter
                        </button>
                        <button
                          type="button"
                          onClick={handleSignUp}
                          disabled={isAuthLoading}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#1e293b] text-white font-bold text-xs hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                          Créer un Compte
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b0f19] border border-[#1e293b]">
                        <div className="text-xs">
                          <div className="text-slate-400 font-medium">Connecté sous :</div>
                          <div className="font-bold text-white">{profile.email || profile.username}</div>
                        </div>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            logout();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 flex items-center gap-1.5 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Déconnexion
                        </button>
                      </div>

                      <button
                        onClick={handleSyncCloud}
                        disabled={isAuthLoading}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
                      >
                        <Cloud className="w-4 h-4" />
                        Synchroniser avec le Nuage
                      </button>
                    </div>
                  )}

                  {syncStatus && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{syncStatus}</span>
                    </div>
                  )}
                </div>

                {/* Local JSON Export/Import */}
                <div className="p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-amber-400" />
                    Sauvegarde & Restauration Manuelle (Fichier JSON)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Exportez votre progression complète dans un fichier JSON pour ne jamais perdre vos succès, même en naviguant en mode privé.
                  </p>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={handleExport}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0b0f19] border border-[#1e293b] hover:border-amber-500/50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      Exporter (Sauvegarder)
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0b0f19] border border-[#1e293b] hover:border-amber-500/50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      Importer (Restaurer)
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportFile}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
