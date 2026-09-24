import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  RefreshCw,
  Key,
  ExternalLink,
  Search,
  CheckSquare,
  Square,
  Library,
  Gamepad2,
  Crown,
  Lock,
  Users,
  Copy,
  ShoppingBag,
  Zap,
  LogIn,
} from 'lucide-react';
import { useFriends } from '../../context/useFriends';
import { SteamIcon } from './SteamIcon';
import { useUserAccount } from '../../context/useUserAccount';
import { useAchievements } from '../../context/useAchievements';
import { useSteamCatalog } from '../../context/useSteamCatalog';
import {
  parseAppIdsFromInput,
  fetchSteamProxyStatus,
  saveMasterSteamApiKey,
} from '../../services/steamService';
import { INDIE_AVATARS } from '../../data/avatars';
import type { IndieAvatarId } from '../../types/user';
import { soundFx } from '../../utils/audio';
import { ADMIN_STEAM_ID } from '../../utils/usernameValidation';
import { SylvestreIvyFrame } from '../sylvestre/SylvestreIvyFrame';
import { getFrameDefinition } from '../../utils/featherEconomy';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenFriends?: () => void;
  onOpenShop?: () => void;
  onOpenAuth?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminDashboard,
  onOpenFriends,
  onOpenShop,
  onOpenAuth,
}) => {
  const {
    profile,
    isAuthenticated,
    isAdmin,
    isCreator,
    isSupabaseActive,
    setAvatar,
    setUsername,
    renameCooldown,
    bypassRenameCooldown,
    exportSaveData,
    importSaveData,
    loginWithEmail,
    signUpWithEmail,
    logout,
    syncCloud,
    steamAccount,
    isSteamConnected,
    connectSteamWithOpenId,
    connectSteamByIdentifier,
    syncSteamLibrary,
    disconnectSteam,
    toggleGameOwned,
    isGameOwned,
    setManualOwnedGames,
  } = useUserAccount();

  const { unlockedIds, allAchievements, feathersCount, spendFeathers } = useAchievements();
  const { allPlayableGames } = useSteamCatalog();

  const [activeTab, setActiveTab] = useState<'profile' | 'steam' | 'cloud'>('profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Friend code state - Uniquement disponible pour les utilisateurs connectés
  let myFriendCode = (isAuthenticated && profile.friendCode) ? profile.friendCode : '';
  let totalFriendsCount = 0;
  try {
    const friendsCtx = useFriends();
    if (friendsCtx) {
      myFriendCode = isAuthenticated ? friendsCtx.myFriendCode : '';
      totalFriendsCount = friendsCtx.totalFriendsCount;
    }
  } catch {
    // If rendered outside FriendsProvider
  }
  const [copiedFriendCode, setCopiedFriendCode] = useState(false);

  // Steam state
  const [steamInput, setSteamInput] = useState('');
  const [steamApiKeyInput, setSteamApiKeyInput] = useState(steamAccount?.apiKey || '');
  const [steamImportText, setSteamImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [showApiKeyBox, setShowApiKeyBox] = useState(false);
  const [isSteamLoading, setIsSteamLoading] = useState(false);
  const [steamStatus, setSteamStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [steamSearchQuery, setSteamSearchQuery] = useState('');
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [hasMasterKey, setHasMasterKey] = useState<boolean | null>(null);
  const [maskedMasterKey, setMaskedMasterKey] = useState<string>('');

  useEffect(() => {
    if (isOpen && activeTab === 'steam') {
      fetchSteamProxyStatus().then((res) => {
        if (res.success) {
          setHasMasterKey(res.hasMasterKey);
          if (res.maskedKey) setMaskedMasterKey(res.maskedKey);
        }
      });
    }
  }, [isOpen, activeTab]);

  const ownedGemsCount = useMemo(() => {
    return allPlayableGames.filter((g) => isGameOwned(g.steamUrl)).length;
  }, [allPlayableGames, isGameOwned]);

  const filteredPlayableForSteam = useMemo(() => {
    if (!steamSearchQuery.trim()) return allPlayableGames;
    const q = steamSearchQuery.toLowerCase().trim();
    return allPlayableGames.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.developer.toLowerCase().includes(q) ||
        g.genre.some((gen) => gen.toLowerCase().includes(q))
    );
  }, [allPlayableGames, steamSearchQuery]);

  if (!isOpen) return null;

  const currentAvatar = INDIE_AVATARS.find((a) => a.id === profile.avatarId) || INDIE_AVATARS[0];

  const handleSaveName = async () => {
    soundFx.playClick();
    setNameError(null);
    setIsCheckingName(true);
    const res = await setUsername(nameInput);
    setIsCheckingName(false);
    if (res.success) {
      soundFx.playVictory();
      setIsEditingName(false);
    } else {
      soundFx.playError();
      setNameError(res.error || 'Erreur lors du changement de pseudonyme.');
    }
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
    setSyncStatus(null);
    const res = await syncCloud();
    setIsAuthLoading(false);
    if (res.success) {
      soundFx.playVictory();
    } else {
      soundFx.playError();
    }
    setSyncStatus(res.message);
  };

  const handleSteamOpenId = () => {
    soundFx.playClick();
    connectSteamWithOpenId();
  };

  const handleConnectSteamById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steamInput.trim()) return;
    soundFx.playClick();
    setIsSteamLoading(true);
    setSteamStatus(null);
    const res = await connectSteamByIdentifier(steamInput, steamApiKeyInput || undefined);
    setIsSteamLoading(false);
    if (res.success) {
      soundFx.playVictory();
      setSteamStatus({ type: 'success', message: res.message || 'Compte Steam lié avec succès !' });
      setSteamInput('');
    } else {
      soundFx.playError();
      setSteamStatus({ type: 'error', message: res.message || 'Erreur lors de la liaison.' });
    }
  };

  const handleSyncLibrary = async () => {
    soundFx.playClick();
    setIsSteamLoading(true);
    setSteamStatus(null);
    const res = await syncSteamLibrary(steamApiKeyInput || undefined);
    setIsSteamLoading(false);
    if (res.success) {
      soundFx.playVictory();
      setSteamStatus({ type: 'success', message: res.message || 'Bibliothèque synchronisée !' });
    } else {
      soundFx.playError();
      setSteamStatus({ type: 'error', message: res.message || 'Échec de synchronisation.' });
    }
  };

  const handleSaveMasterKey = async () => {
    if (!masterKeyInput.trim()) return;
    soundFx.playClick();
    setIsSteamLoading(true);
    setSteamStatus(null);
    const res = await saveMasterSteamApiKey(masterKeyInput, ADMIN_STEAM_ID);
    setIsSteamLoading(false);
    if (res.success) {
      soundFx.playVictory();
      setHasMasterKey(true);
      if (res.maskedKey) setMaskedMasterKey(res.maskedKey);
      setSteamStatus({ type: 'success', message: res.message });
      setMasterKeyInput('');
      await syncSteamLibrary();
    } else {
      soundFx.playError();
      setSteamStatus({ type: 'error', message: res.message });
    }
  };

  const handleImportAppIds = () => {
    soundFx.playClick();
    const appIds = parseAppIdsFromInput(steamImportText);
    if (appIds.length === 0) {
      setSteamStatus({ type: 'error', message: 'Aucun AppID Steam valide détecté dans votre saisie.' });
      return;
    }
    const current = new Set(steamAccount?.ownedAppIds || []);
    appIds.forEach((id) => current.add(id));
    setManualOwnedGames(Array.from(current));
    soundFx.playVictory();
    setSteamStatus({
      type: 'success',
      message: `${appIds.length} jeux ajoutés à votre bibliothèque possédée !`,
    });
    setSteamImportText('');
    setShowImportBox(false);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative overflow-hidden sm:overflow-visible w-full max-w-2xl bg-[#06241b] border-2 border-[#78350f] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl max-h-[92dvh] sm:max-h-[90dvh] flex flex-col"
        >
          <div className="hidden sm:block pointer-events-none">
            <SylvestreIvyFrame density="medium" />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#1e293b] shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                  Profil du Joueur
                </h2>
                <p className="hidden sm:block text-xs text-slate-400">
                  Personnalisez votre avatar et synchronisez votre bibliothèque Steam
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={async () => {
                    soundFx.playClick();
                    await logout();
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                  title="Se déconnecter de votre compte"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              )}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 sm:gap-2 my-2.5 sm:my-4 p-1 bg-[#131a29] border border-[#1e293b] rounded-2xl shrink-0">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('profile');
              }}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Avatar</span>
              <span className="hidden sm:inline">& Stats</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('steam');
              }}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 relative touch-manipulation ${
                activeTab === 'steam'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SteamIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Steam</span>
              <span className="hidden sm:inline">& Jeux</span>
              {isSteamConnected && (
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              )}
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('cloud');
              }}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                activeTab === 'cloud'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Cloud</span>
              <span className="hidden sm:inline">& Sauvegarde</span>
              {profile.isCloudSynced && (
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" title="Synchronisé au Cloud" />
              )}
            </button>
          </div>

          {/* Content Body - flex-1 min-h-0 guarantees smooth scrolling on all mobile browsers */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 sm:space-y-6 pr-1 custom-scrollbar">
            {activeTab === 'profile' ? (
              <>
                {/* Profile Card Summary */}
                <div className="p-4 bg-gradient-to-br from-[#06241b] to-[#010805] border border-[#78350f] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentAvatar.bgGradient} border-2 ${
                      getFrameDefinition(profile.activeFrame).borderClass
                    } ${getFrameDefinition(profile.activeFrame).glowClass} flex items-center justify-center text-4xl shadow-xl shrink-0 p-2 overflow-hidden`}
                  >
                    {currentAvatar.imageUrl ? (
                      <img
                        src={currentAvatar.imageUrl}
                        alt={currentAvatar.name}
                        className="w-full h-full object-contain drop-shadow-md"
                      />
                    ) : (
                      currentAvatar.emoji
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      {isEditingName ? (
                        <div className="flex flex-col gap-1.5 w-full max-w-xs">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={nameInput}
                              onChange={(e) => {
                                setNameInput(e.target.value);
                                if (nameError) setNameError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveName();
                                if (e.key === 'Escape') {
                                  setNameInput(profile.username);
                                  setNameError(null);
                                  setIsEditingName(false);
                                }
                              }}
                              maxLength={24}
                              disabled={isCheckingName}
                              placeholder="Votre pseudonyme unique..."
                              className="px-2.5 py-1 bg-slate-900 border border-amber-500/50 rounded-lg text-white font-bold text-sm focus:outline-none flex-1"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveName}
                              disabled={isCheckingName}
                              className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition"
                              title="Valider le pseudonyme"
                            >
                              {isCheckingName ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setNameInput(profile.username);
                                setNameError(null);
                                setIsEditingName(false);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
                              title="Annuler"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {nameError && (
                            <div className="flex items-start gap-1.5 text-[11px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 rounded-lg text-left">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <span>{nameError}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center sm:items-start gap-1">
                          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                            <h3 className="text-lg font-black text-white tracking-tight">
                              {profile.username}
                            </h3>
                            {isAuthenticated && isAdmin && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Crown className="w-3 h-3 text-amber-400" />
                                Admin
                              </span>
                            )}
                            {renameCooldown.canChange || isAdmin ? (
                              <button
                                onClick={() => {
                                  soundFx.playClick();
                                  setNameInput(profile.username);
                                  setNameError(null);
                                  setIsEditingName(true);
                                }}
                                className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                                title="Modifier mon pseudonyme unique"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400/90 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg"
                                title={`Délai de carence actif. Prochain changement possible dans ${renameCooldown.daysRemaining} jour(s) (le ${renameCooldown.nextChangeDate}).`}
                              >
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>Verrouillé ({renameCooldown.daysRemaining}j)</span>
                              </span>
                            )}
                          </div>
                          {!renameCooldown.canChange && !isAdmin && !isCreator && (
                            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                              <span className="text-slate-400">
                                Prochain changement gratuit le <strong className="text-amber-300">{renameCooldown.nextChangeDate}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const res = bypassRenameCooldown((cost) => spendFeathers(cost, 'Renommage express profil'));
                                  if (res.success) {
                                    soundFx.playVictory();
                                    setNameInput(profile.username);
                                    setNameError(null);
                                    setIsEditingName(true);
                                  } else {
                                    soundFx.playError();
                                    setNameError(res.error || 'Plumes insuffisantes');
                                  }
                                }}
                                className="inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/60 cursor-pointer"
                              >
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span>Renommage Express (25 🪶)</span>
                              </button>
                            </div>
                          )}
                        </div>
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
                  <div className="flex sm:flex-col items-center justify-around sm:justify-center w-full sm:w-auto gap-4 sm:gap-2 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2.5 sm:pt-0 sm:pl-4">
                    <div className="text-center">
                      <div className="text-xs uppercase font-bold text-slate-300">Plumes</div>
                      <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {feathersCount}
                      </div>
                      {onOpenShop && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            onClose();
                            onOpenShop();
                          }}
                          className="mt-1 px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-[10px] font-black text-amber-300 flex items-center gap-1 transition shadow-sm cursor-pointer mx-auto touch-manipulation"
                          title="Ouvrir la Boutique du Sanctuaire"
                        >
                          <ShoppingBag className="w-2.5 h-2.5" />
                          <span>Boutique</span>
                        </button>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs uppercase font-bold text-slate-300">Rang ELO</div>
                      <div className="text-sm font-black text-indigo-400 flex items-center justify-center gap-1">
                        <Swords className="w-3.5 h-3.5" />
                        {profile.versusStats.eloRating}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Friend Code & Compagnons Card */}
                {isAuthenticated && myFriendCode ? (
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-[#06241b] via-[#041d16] to-[#010805] border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
                          <span>Code Joueur Ami</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                            Anti-Spoil
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-sm sm:text-base font-black tracking-wider text-white select-all break-all sm:break-normal">
                            {myFriendCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(myFriendCode);
                                setCopiedFriendCode(true);
                                soundFx.playSuccess();
                                setTimeout(() => setCopiedFriendCode(false), 2000);
                              }
                            }}
                            className="p-1 px-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-500/30 text-emerald-300 hover:text-white transition flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0 touch-manipulation"
                            title="Copier mon code ami"
                          >
                            {copiedFriendCode ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] font-bold text-emerald-300">Copié !</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {onOpenFriends && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          onClose();
                          onOpenFriends();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 border border-emerald-400/30 self-stretch sm:self-auto shrink-0 cursor-pointer touch-manipulation"
                      >
                        <Users className="w-4 h-4" />
                        <span>Cercle des Compagnons</span>
                        {totalFriendsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-emerald-200 text-[10px] font-mono">
                            {totalFriendsCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 sm:p-4 bg-gradient-to-br from-[#06241b] via-[#041d16] to-[#010805] border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Compagnons & Sauvegarde en Ligne</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                            Compte requis
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          Connectez-vous pour obtenir votre Code Ami unique, sauvegarder vos séries de victoires et défier vos compagnons en duel !
                        </p>
                      </div>
                    </div>

                    {onOpenAuth && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          onClose();
                          onOpenAuth();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 self-stretch sm:self-auto shrink-0 cursor-pointer touch-manipulation whitespace-nowrap"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Se connecter</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Admin Quick Action Banner */}
                {isAuthenticated && isAdmin && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      if (onOpenAdminDashboard) {
                        onClose();
                        onOpenAdminDashboard();
                      } else {
                        window.open('/api/track.php', '_blank');
                      }
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-slate-900 border border-amber-500/35 hover:border-amber-500/60 transition group cursor-pointer shadow-lg text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                        <Crown className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-white flex items-center gap-2 flex-wrap">
                          Tableau de Bord Administrateur & Métriques
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Souverain
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Accès exclusif et direct réservé à votre Steam ID ({ADMIN_STEAM_ID})
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform shrink-0">
                      <span className="hidden sm:inline">Ouvrir le Tableau</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </button>
                )}

                {/* Avatar Selection Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>Choisissez votre Compagnon Indé</span>
                    </div>
                    <span className="text-[10px] text-amber-400/80 font-mono font-bold lowercase tracking-normal">
                      {INDIE_AVATARS.length} compagnons disponibles
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto no-scrollbar pr-1 p-0.5">
                    {INDIE_AVATARS.map((avatar) => {
                      const isSelected = profile.avatarId === avatar.id;
                      const isCreatorOnly = Boolean(avatar.adminOnly);
                      const isOwnedShopAvatar = (profile.unlockedAvatars || []).includes(avatar.id);
                      const isShopItem = Boolean(avatar.shopPrice && avatar.shopPrice > 0);
                      const isShopLocked = isShopItem && !isOwnedShopAvatar && !isAdmin;

                      return (
                        <button
                          key={avatar.id}
                          disabled={isCreatorOnly && !isAdmin}
                          onClick={() => {
                            if (isCreatorOnly && !isAdmin) {
                              soundFx.playError();
                              return;
                            }
                            if (isShopLocked) {
                              soundFx.playClick();
                              if (onOpenShop) {
                                onClose();
                                onOpenShop();
                              }
                              return;
                            }
                            soundFx.playClick();
                            setAvatar(avatar.id as IndieAvatarId);
                          }}
                          className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                            isCreatorOnly && !isAdmin
                              ? 'bg-slate-900/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                              : isShopLocked
                              ? 'bg-[#0a1a17]/90 border-amber-500/30 hover:border-amber-400 hover:bg-[#0f2824] cursor-pointer'
                              : isSelected
                              ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50 cursor-pointer'
                              : 'bg-[#06241b] border-[#78350f] hover:border-amber-500/40 hover:bg-[#093224] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                              {avatar.imageUrl ? (
                                <img
                                  src={avatar.imageUrl}
                                  alt={avatar.name}
                                  className="w-7 h-7 object-contain drop-shadow-sm"
                                />
                              ) : (
                                <span className="text-2xl">{avatar.emoji}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                                {avatar.name}
                                {isCreatorOnly && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                                {isShopItem && !isOwnedShopAvatar && (
                                  <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {isCreatorOnly && !isAdmin
                                  ? '🔒 Exclusif Hibouxe'
                                  : isShopLocked
                                  ? `🛍️ ${avatar.shopPrice} 🪶 (Boutique)`
                                  : avatar.game}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
                          )}
                          {isCreatorOnly && !isAdmin && (
                            <div className="absolute top-1.5 right-1.5" title="Réservé exclusivement au créateur Hibouxe">
                              <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                            </div>
                          )}
                          {isShopLocked && (
                            <div className="absolute top-1.5 right-1.5" title={`Déblocable dans la Boutique pour ${avatar.shopPrice} Plumes`}>
                              <Lock className="w-3.5 h-3.5 text-amber-400/80" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Performance Stats Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-[#131a29] border border-[#1e293b] rounded-xl sm:rounded-2xl text-center">
                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-sm sm:text-base font-black text-white">
                      {unlockedIds.length}/{allAchievements.length}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 truncate">
                      <span>Succès</span>
                      <span className="hidden sm:inline"> Débloqués</span>
                    </div>
                  </div>

                  <div className="p-2 sm:p-3 bg-[#131a29] border border-[#1e293b] rounded-xl sm:rounded-2xl text-center">
                    <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 mx-auto mb-1" />
                    <div className="text-sm sm:text-base font-black text-white">
                      {profile.versusStats.matchesWon}/{profile.versusStats.matchesPlayed}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 truncate">
                      <span>Versus</span>
                      <span className="hidden sm:inline"> Gagnés</span>
                    </div>
                  </div>

                  <div className="p-2 sm:p-3 bg-[#131a29] border border-[#1e293b] rounded-xl sm:rounded-2xl text-center">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 mx-auto mb-1" />
                    <div className="text-sm sm:text-base font-black text-white">
                      {profile.versusStats.bestStreak}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 truncate">
                      <span>Série</span>
                      <span className="hidden sm:inline"> Record</span>
                    </div>
                  </div>
                </div>
              </>
            ) : activeTab === 'steam' ? (
              <>
                {/* Steam Tab Body */}
                <div className="space-y-5">
                  {/* Status Banner / Card */}
                  {isSteamConnected && steamAccount ? (
                    <div className="p-4 bg-gradient-to-br from-[#101c2b] via-[#132236] to-[#0c1624] border border-cyan-500/30 rounded-2xl shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={steamAccount.avatarUrl || 'https://avatars.fastly.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'}
                              alt={steamAccount.personaName}
                              className="w-14 h-14 rounded-2xl border-2 border-cyan-400 shadow-md object-cover bg-slate-900"
                            />
                            <div className="absolute -bottom-1 -right-1 p-1 bg-[#171a21] rounded-full border border-cyan-500/50 text-cyan-400">
                              <SteamIcon className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-white">{steamAccount.personaName}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Synchronisé
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              SteamID: {steamAccount.steamId}
                            </div>
                            {steamAccount.profileUrl && (
                              <a
                                href={steamAccount.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1 mt-1"
                              >
                                <span>Voir le profil Steam</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            soundFx.playClick();
                            disconnectSteam();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-auto"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Déconnecter
                        </button>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-cyan-500/20">
                        <div className="p-2.5 bg-[#0b121e] rounded-xl text-center border border-cyan-900/40">
                          <div className="text-[10px] font-bold uppercase text-slate-400">Jeux Steam</div>
                          <div className="text-sm font-black text-white">{steamAccount.gamesCount}</div>
                        </div>
                        <div className="p-2.5 bg-[#0b121e] rounded-xl text-center border border-cyan-900/40">
                          <div className="text-[10px] font-bold uppercase text-cyan-300">Pépites Possédées</div>
                          <div className="text-sm font-black text-cyan-400">{ownedGemsCount} / {allPlayableGames.length}</div>
                        </div>
                        <div className="p-2.5 bg-[#0b121e] rounded-xl text-center border border-cyan-900/40">
                          <div className="text-[10px] font-bold uppercase text-amber-300">Complétion Hoot</div>
                          <div className="text-sm font-black text-amber-400">{Math.round((ownedGemsCount / allPlayableGames.length) * 100)}%</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                          <span>Progression catalogue certifié</span>
                          <span className="font-mono text-cyan-400">{ownedGemsCount} sur {allPlayableGames.length} pépites</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((ownedGemsCount / allPlayableGames.length) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Sync & Options Bar */}
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">
                        <button
                          onClick={handleSyncLibrary}
                          disabled={isSteamLoading}
                          className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md disabled:opacity-50 touch-manipulation cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSteamLoading ? 'animate-spin' : ''}`} />
                          <span>Actualiser la bibliothèque</span>
                        </button>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto w-full">
                          <button
                            onClick={() => setShowImportBox(!showImportBox)}
                            className="py-2 px-2.5 sm:px-3 rounded-xl bg-[#0b121e] border border-cyan-500/30 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer"
                          >
                            <Library className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Importer</span>
                          </button>
                          <button
                            onClick={() => setShowApiKeyBox(!showApiKeyBox)}
                            className="py-2 px-2.5 sm:px-3 rounded-xl bg-[#0b121e] border border-cyan-500/30 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-400" />
                            <span>Clé API</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Not Connected View */
                    <div className="p-5 bg-gradient-to-br from-[#101c2b] via-[#132236] to-[#0c1624] border border-cyan-500/30 rounded-2xl shadow-xl space-y-4 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#171a21] border-2 border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shrink-0">
                          <SteamIcon className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold mb-1.5">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>Synchronisation 100% Automatique sans clé API</span>
                          </div>
                          <h3 className="text-base font-black text-white">
                            Associez votre Compte Steam
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed mt-1">
                            Connectez votre profil pour identifier d'un coup d'œil les pépites indépendantes que vous possédez déjà dans votre ludothèque, filtrer les jeux à découvrir et enrichir votre expérience de jeu !
                          </p>
                        </div>
                      </div>

                      {/* Official Sign in through Steam button */}
                      <div className="pt-2">
                        <button
                          onClick={handleSteamOpenId}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#2a475e] hover:from-[#1b2838] hover:to-[#171a21] border border-cyan-500/50 hover:border-cyan-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer"
                        >
                          <SteamIcon className="w-5 h-5 text-cyan-400" />
                          <span>Se connecter via Steam (Officiel & Sécurisé)</span>
                        </button>
                        <p className="text-[11px] text-slate-400 text-center mt-1.5">
                          Authentification officielle Valve. Votre mot de passe reste strictement confidentiel sur Steam.
                        </p>
                      </div>

                      {/* Direct ID Link Alternative */}
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-700/60" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                          <span className="bg-[#132236] px-3">Ou liaison par SteamID / URL</span>
                        </div>
                      </div>

                      <form onSubmit={handleConnectSteamById} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={steamInput}
                            onChange={(e) => setSteamInput(e.target.value)}
                            placeholder="SteamID64 (ex: 76561198...) ou pseudo Steam"
                            className="flex-1 px-3 py-2 bg-[#0b1019] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                          <button
                            type="submit"
                            disabled={isSteamLoading || !steamInput.trim()}
                            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs transition disabled:opacity-50 shrink-0"
                          >
                            {isSteamLoading ? 'Connexion...' : 'Lier'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Feedback Status Alert */}
                  {steamStatus && (
                    <div
                      className={`flex items-center gap-2 text-xs p-3 rounded-xl border ${
                        steamStatus.type === 'success'
                          ? 'text-emerald-300 bg-emerald-950/40 border-emerald-900/50'
                          : 'text-rose-300 bg-rose-950/40 border-rose-900/50'
                      }`}
                    >
                      {steamStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      )}
                      <span>{steamStatus.message}</span>
                    </div>
                  )}

                  {/* Collapsible API Key Box */}
                  {showApiKeyBox && (
                    <div className="p-3.5 bg-[#0e1726] border border-cyan-900/50 rounded-2xl space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          Clé API Steam Web (Optionnel)
                        </span>
                        <a
                          href="https://steamcommunity.com/dev/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>Obtenir ma clé Steam</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-slate-300 text-[11px] leading-relaxed">
                        ✨ <strong>Bonne nouvelle :</strong> Grâce à notre Proxy Souverain Hoot (Méthode 1), vous n'avez pas besoin de créer de clé API personnelle pour synchroniser vos jeux ! Si vous souhaitez néanmoins surcharger la configuration avec votre propre clé, vous pouvez la renseigner ici :
                      </div>
                      <div className="flex gap-2 pt-1">
                        <input
                          type="password"
                          value={steamApiKeyInput}
                          onChange={(e) => setSteamApiKeyInput(e.target.value)}
                          placeholder="Ex: A1B2C3D4E5F6..."
                          className="flex-1 px-3 py-1.5 bg-[#090e18] border border-slate-700 rounded-lg text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={handleSyncLibrary}
                          disabled={isSteamLoading}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                        >
                          Sauvegarder & Synchroniser
                        </button>
                      </div>

                      {/* Section Administrateur : Définition de la Clé Maîtresse Souveraine */}
                      {isAuthenticated && isAdmin && (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/35 space-y-2.5 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-amber-300 flex items-center gap-1.5">
                              <Crown className="w-4 h-4 text-amber-400" />
                              Clé API Steam Maîtresse du Site (Admin)
                            </span>
                            {hasMasterKey ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Active : {maskedMasterKey || 'Configurée'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Non configurée sur le serveur
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Enregistrez ici votre clé Steam Web API dans le fichier sécurisé <code>.steam_key</code> du serveur. Elle sera automatiquement utilisée pour tous les visiteurs du site, leur évitant d'avoir à créer une clé API.
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={masterKeyInput}
                              onChange={(e) => setMasterKeyInput(e.target.value)}
                              placeholder="Collez votre clé Steam Web API (32 caractères)..."
                              className="flex-1 px-3 py-1.5 bg-[#090e18] border border-amber-500/40 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={handleSaveMasterKey}
                              disabled={isSteamLoading || !masterKeyInput.trim()}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 disabled:opacity-50 cursor-pointer shadow-md"
                            >
                              {isSteamLoading ? 'Enregistrement...' : 'Définir Clé Maîtresse'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Collapsible AppIDs Import Box */}
                  {showImportBox && (
                    <div className="p-3.5 bg-[#0e1726] border border-cyan-900/50 rounded-2xl space-y-2 text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Library className="w-3.5 h-3.5 text-cyan-400" />
                        Coller une liste d'AppIDs ou export Steam
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Collez des identifiants numériques, des URLs Steam Store ou un tableau JSON (ex: [1145360, 268910, 504230]) :
                      </p>
                      <textarea
                        value={steamImportText}
                        onChange={(e) => setSteamImportText(e.target.value)}
                        placeholder="Collez ici vos AppIDs ou URLs de jeux possédés..."
                        rows={3}
                        className="w-full p-2.5 bg-[#090e18] border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowImportBox(false)}
                          className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={handleImportAppIds}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                        >
                          Importer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Certified Gems Checklist */}
                  <div className="p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-cyan-400" />
                          Vos Pépites Certifiées ({ownedGemsCount}/{allPlayableGames.length})
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Cochez ou décochez les pépites pour ajuster manuellement vos possessions
                        </p>
                      </div>

                      {/* Search in games list */}
                      <div className="relative w-full sm:w-48">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={steamSearchQuery}
                          onChange={(e) => setSteamSearchQuery(e.target.value)}
                          placeholder="Rechercher..."
                          className="w-full pl-8 pr-2.5 py-1 bg-[#0b0f19] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar divide-y divide-slate-800/50">
                      {filteredPlayableForSteam.map((game) => {
                        const owned = isGameOwned(game.steamUrl);
                        return (
                          <div
                            key={game.id}
                            onClick={() => {
                              soundFx.playClick();
                              toggleGameOwned(game.steamUrl);
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                              owned
                                ? 'bg-cyan-950/20 text-white'
                                : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button
                                type="button"
                                className="text-cyan-400 shrink-0"
                              >
                                {owned ? (
                                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600" />
                                )}
                              </button>
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                  <span>{game.title}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    ({game.releaseYear})
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {game.developer}
                                </div>
                              </div>
                            </div>

                            {owned && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 ml-2">
                                Possédé
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Cloud & Backup Tab */}
                <div className="p-4 bg-[#131a29] border border-[#1e293b] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">
                        Synchronisation Cloud Souverain (OVH)
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        profile.isCloudSynced
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${profile.isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {profile.isCloudSynced ? 'Cloud Synchronisé' : 'Synchronisation Recommandée'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Votre progression complète (<strong>Plumes d'Or 🪶</strong>, <strong>Succès 🏆</strong>, <strong>Boutique</strong>, <strong>Séries</strong> et <strong>Records Time Attack ⏱️</strong>) est sauvegardée et fusionnée de manière sécurisée sur notre serveur souverain OVHcloud.
                  </p>

                  {/* Connected Identifier Card */}
                  <div className="p-3.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {isSteamConnected && steamAccount ? (
                        <>
                          {steamAccount.avatarUrl ? (
                            <img
                              src={steamAccount.avatarUrl}
                              alt={steamAccount.personaName}
                              className="w-10 h-10 rounded-xl border border-cyan-500/50 object-cover shrink-0 shadow-md"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center shrink-0">
                              <SteamIcon className="w-5 h-5 text-cyan-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white truncate">{steamAccount.personaName}</span>
                              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40 shrink-0">
                                SteamID: {steamAccount.steamId}
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              Compte lié pour synchronisation multi-PC automatique
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {profile.username || 'Hibou Mystère'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Associez votre compte Steam pour garantir la synchronisation automatique immédiate sur n'importe quel autre PC.
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {!isSteamConnected && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setActiveTab('steam');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                      >
                        <SteamIcon className="w-3.5 h-3.5" />
                        Associer Steam
                      </button>
                    )}
                  </div>

                  {/* Sync Action Button */}
                  <div className="space-y-2">
                    <button
                      onClick={handleSyncCloud}
                      disabled={isAuthLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                    >
                      <RefreshCw className={`w-4 h-4 ${isAuthLoading ? 'animate-spin' : ''}`} />
                      <span>{isAuthLoading ? 'Synchronisation en cours...' : '🔄 Synchroniser & Fusionner Maintenant'}</span>
                    </button>
                    <p className="text-[11px] text-slate-500 text-center">
                      La fusion intelligente conserve le maximum de vos plumes, succès débloqués et records sans jamais écraser vos progrès.
                    </p>
                  </div>

                  {syncStatus && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{syncStatus}</span>
                    </div>
                  )}

                  {/* Supabase Optional Section if active */}
                  {isSupabaseActive && (
                    <div className="border-t border-slate-800/80 pt-3">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Connexion Supabase (Optionnel)
                      </div>
                      {!isAuthenticated ? (
                        <form className="space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="email"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              placeholder="joueur@exemple.com"
                              className="px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="password"
                              value={passwordInput}
                              onChange={(e) => setPasswordInput(e.target.value)}
                              placeholder="••••••••"
                              className="px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          {authError && (
                            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2 rounded-xl border border-rose-900/50">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{authError}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleLogin}
                              disabled={isAuthLoading}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs transition-colors disabled:opacity-50"
                            >
                              Se Connecter
                            </button>
                            <button
                              type="button"
                              onClick={handleSignUp}
                              disabled={isAuthLoading}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors disabled:opacity-50"
                            >
                              Créer un Compte
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b0f19] border border-[#1e293b] text-xs">
                          <span className="text-slate-300 font-mono">{profile.email}</span>
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              logout();
                            }}
                            className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold text-[11px]"
                          >
                            Déconnexion Supabase
                          </button>
                        </div>
                      )}
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

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 pt-1">
                    <button
                      onClick={handleExport}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0b0f19] border border-[#1e293b] hover:border-amber-500/50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors touch-manipulation cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Exporter (Sauvegarde JSON)</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0b0f19] border border-[#1e293b] hover:border-amber-500/50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors touch-manipulation cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Importer un fichier JSON</span>
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
    </AnimatePresence>,
    document.body
  );
};
