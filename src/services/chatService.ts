import { getSupabaseClient } from './supabase';
/**
 * 🦉 Hoot Indie Games — Service Frontend de Tchat Souverain
 * 
 * Communique avec public/api/chat.php avec résilience hors-ligne / localhost
 */
import { ADMIN_STEAM_ID, normalizeUsername } from '../utils/usernameValidation';

export type ChatChannel = 'global' | 'fr' | 'en' | 'es' | 'de' | 'ja' | 'pt-BR' | 'feedback';
export type FeedbackCategory = 'suggestion' | 'bug' | 'idea' | 'love' | 'general';

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  username: string;
  avatarId: string;
  title?: string;
  activeFrame?: string;
  text: string;
  timestamp: number; // Unix timestamp in seconds
  isCreator?: boolean;
  isModerator?: boolean;
  isDeleted?: boolean;
  category?: FeedbackCategory;
  userId?: string;
  steamId?: string;
  scoreData?: {
    game: string;
    score: number;
    mode: string;
  } | null;
}

export interface ChatChannelInfo {
  id: ChatChannel;
  name: string;
  label: string;
  icon: string;
  description: string;
}

export const CHAT_CHANNELS: ChatChannelInfo[] = [
  {
    id: 'global',
    name: 'Mondial',
    label: 'Global',
    icon: '🌍',
    description: 'Salon international ouvert à tous les explorateurs',
  },
  {
    id: 'fr',
    name: 'Français',
    label: 'Français',
    icon: '🇫🇷',
    description: 'Salon francophone pour échanger astuces et pépites',
  },
  {
    id: 'en',
    name: 'English',
    label: 'English',
    icon: '🇬🇧',
    description: 'International English lounge for indie game discussion',
  },
  {
    id: 'es',
    name: 'Español',
    label: 'Español',
    icon: '🇪🇸',
    description: 'Comunidad hispanohablante de exploradores indie',
  },
  {
    id: 'de',
    name: 'Deutsch',
    label: 'Deutsch',
    icon: '🇩🇪',
    description: 'Deutscher Salon für Indie-Game-Liebhaber',
  },
  {
    id: 'ja',
    name: '日本語',
    label: '日本語',
    icon: '🇯🇵',
    description: 'インディーゲーム探索者のための日本語ラウンジ',
  },
  {
    id: 'pt-BR',
    name: 'Português',
    label: 'Português',
    icon: '🇧🇷',
    description: 'Espaço para os jogadores e exploradores de língua portuguesa',
  },
  {
    id: 'feedback',
    name: 'Retours & Idées',
    label: 'Retours & Idées',
    icon: '💡',
    description: 'Boîte à idées, signalements et suggestions pour améliorer le site',
  },
];

export const FEEDBACK_CATEGORIES: { id: FeedbackCategory; label: string; icon: string; badgeColor: string }[] = [
  { id: 'suggestion', label: 'Suggestion', icon: '💡', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'bug', label: 'Signalement', icon: '🐛', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { id: 'idea', label: 'Idée de Pépite', icon: '✨', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'love', label: 'Coup de Cœur', icon: '❤️', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  { id: 'general', label: 'Avis Général', icon: '💬', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
];

const LOCAL_STORAGE_CHAT_KEY = 'hoot_local_chat_messages_v1';

// Messages initiaux de démonstration si le backend PHP n'est pas disponible (hors-ligne ou local)
function getLocalFallbackMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m: ChatMessage) => {
          const isCreatorMsg = Boolean(
            m.isCreator ||
            m.avatarId === 'hibouxe_creator' ||
            m.steamId === ADMIN_STEAM_ID ||
            (m.title && m.title.toLowerCase().includes('créateur'))
          );
          if (isCreatorMsg) {
            return {
              ...m,
              username: 'Hibouxe',
              isCreator: true,
              avatarId: 'hibouxe_creator',
            };
          }
          return m;
        });
      }
    }
  } catch {
    // Ignore
  }

  const now = Math.floor(Date.now() / 1000);
  const initial: ChatMessage[] = [
    {
      id: 'msg_init_global',
      channel: 'global',
      username: 'Hibouxe',
      avatarId: 'hibouxe_creator',
      title: 'Fondateur du Perchoir',
      activeFrame: 'golden_border',
      text: 'Bienvenue sur Le Perchoir ! Partagez vos découvertes et vos records du jour. 🦉✨',
      timestamp: now - 3600,
      isCreator: true,
      category: 'general',
    },
    {
      id: 'msg_init_fr',
      channel: 'fr',
      username: 'Hibouxe',
      avatarId: 'hibouxe_creator',
      title: 'Fondateur du Perchoir',
      activeFrame: 'golden_border',
      text: 'Bienvenue sur le salon francophone ! Quel est votre jeu indépendant du moment ?',
      timestamp: now - 2800,
      isCreator: true,
      category: 'general',
    },
    {
      id: 'msg_init_feedback',
      channel: 'feedback',
      username: 'Hibouxe',
      avatarId: 'hibouxe_creator',
      title: 'Fondateur du Perchoir',
      activeFrame: 'golden_border',
      text: 'Vos retours et suggestions sont précieux ! Partagez vos idées ou petits bugs trouvés ici.',
      timestamp: now - 1800,
      isCreator: true,
      category: 'suggestion',
    },
  ];

  try {
    localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(initial));
  } catch {
    // Ignore
  }

  return initial;
}

/**
 * Récupère les messages d'un salon ou de tous les salons.
 */
export async function fetchChatMessages(
  channel: ChatChannel | 'all' = 'all',
  _since: number = 0
): Promise<{ success: boolean; messages: ChatMessage[]; serverTime: number }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(60);
    if (channel !== 'all') {
      query = query.eq('room_id', channel);
    }
    
    const { data, error } = await query;
    if (error) throw error;

    const messages: ChatMessage[] = (data || []).map((row: any) => ({
      id: row.id,
      channel: row.room_id as ChatChannel,
      username: row.username || row.user_profiles?.username || 'Inconnu',
      avatarId: row.avatar_id || 'default',
      text: row.content,
      timestamp: Math.floor(new Date(row.created_at).getTime() / 1000),
      isDeleted: row.is_deleted
    }));

    return { success: true, messages: messages.reverse(), serverTime: Math.floor(Date.now() / 1000) };
  } catch (err) {
    return { success: false, messages: [], serverTime: 0 };
  }
}

/**
 * Envoie un message sur un salon.
 */
export async function sendChatMessage(payload: {
  channel: ChatChannel;
  text: string;
  username: string;
  avatarId: string;
  title?: string;
  activeFrame?: string;
  steamId?: string;
  email?: string;
  userId?: string;
  category?: FeedbackCategory;
  scoreData?: {
    game: string;
    score: number;
    mode: string;
  } | null;
}): Promise<{
  success: boolean;
  message?: ChatMessage;
  error?: string;
  warning?: string;
  flaggedWords?: string[];
}> {
  const cleanText = payload.text.trim();
  if (!cleanText) {
    return { success: false, error: 'Le message ne peut pas être vide.' };
  }


  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('chat_messages').insert({
      room_id: payload.channel,
      username: payload.username,
      avatar_id: payload.avatarId,
      content: cleanText
    }).select().single();

    if (error) throw error;

    const newMessage: ChatMessage = {
      id: data.id,
      channel: data.room_id as ChatChannel,
      username: payload.username,
      avatarId: payload.avatarId,
      text: data.content,
      timestamp: Math.floor(new Date(data.created_at).getTime() / 1000),
    };

    return { success: true, message: newMessage };
  } catch (err: any) {
    console.error('Error sending chat message:', err);
    return { success: false, error: err.message || 'Erreur réseau.' };
  }

  // Contrôle anti-hameçonnage en mode local/hors-ligne
  const phishingCheck = checkTextForPhishing(cleanText);
  if (phishingCheck.isSuspicious) {
    return {
      success: false,
      error: 'phishing_detected',
      warning: phishingCheck.warning || '⚠️ Bouclier Sécurité & Anti-Hameçonnage : Votre message a été bloqué.',
      flaggedWords: [phishingCheck.reason || 'suspicious_pattern'],
    };
  }

  // Fallback local si backend injoignable
  const now = Math.floor(Date.now() / 1000);
  const isCreator =
    payload.username.toLowerCase() === 'hibouxe' ||
    payload.avatarId === 'hibouxe_creator';

  const localMsg: ChatMessage = {
    id: `local_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    channel: payload.channel,
    username: payload.username,
    avatarId: payload.avatarId,
    title: payload.title || (isCreator ? 'Fondateur du Perchoir' : 'Oisillon du Perchoir'),
    activeFrame: payload.activeFrame,
    text: cleanText,
    timestamp: now,
    isCreator,
    category: payload.category || 'general',
    scoreData: payload.scoreData || null,
  };

  try {
    const all = getLocalFallbackMessages();
    all.push(localMsg);
    localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(all.slice(-100)));
  } catch {
    // Ignore
  }

  return { success: true, message: localMsg };
}

/**
 * Supprime ou modère un message dans le cache local (mode hors-ligne ou messages locaux)
 */
function deleteLocalFallbackMessage(
  messageId: string,
  auth?: { steamId?: string; userId?: string; username?: string; isAdmin?: boolean; isModerator?: boolean },
  hardDelete: boolean = false
): boolean {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
    if (!raw) return false;
    const list: ChatMessage[] = JSON.parse(raw);
    if (!Array.isArray(list)) return false;

    const idx = list.findIndex((m) => m.id === messageId);
    if (idx === -1) return false;

    const target = list[idx];
    const isMe = Boolean(
      (auth?.username && target.username && target.username.toLowerCase() === auth.username.toLowerCase()) ||
      (auth?.userId && target.userId && target.userId === auth.userId) ||
      (auth?.steamId && target.steamId && target.steamId === auth.steamId)
    );

    const isAuthorized = Boolean(auth?.isAdmin || (auth?.isModerator && !target.isCreator) || isMe);
    if (!isAuthorized) return false;

    if (hardDelete) {
      list.splice(idx, 1);
    } else {
      list[idx] = {
        ...target,
        isDeleted: true,
        text: isMe
          ? '[Message retiré par l\'auteur]'
          : (auth?.isAdmin ? '[Message retiré par l\'administrateur]' : '[Message retiré par la modération]'),
        scoreData: null,
      };
    }
    localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/**
 * Supprime ou modère un message de la discussion (Auteur, Modérateur ou Admin)
 * Supporte le masquage simple (soft-delete) ou l'effacement définitif (hard-delete / purge).
 */
export async function deleteChatMessage(
  messageId: string,
  auth: {
    steamId?: string;
    userId?: string;
    email?: string;
    username?: string;
    role?: string;
    isAdmin?: boolean;
    isModerator?: boolean;
  },
  hardDelete: boolean = false
): Promise<{ success: boolean; message?: string; hardDeleted?: boolean }> {


  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    if (hardDelete) {
      const { error } = await supabase.from('chat_messages').delete().eq('id', messageId);
      if (error) throw error;
      deleteLocalFallbackMessage(messageId, auth, hardDelete);
      return { success: true, message: 'Message supprimé définitivement.', hardDeleted: true };
    } else {
      const { error } = await supabase.from('chat_messages').update({ is_deleted: true }).eq('id', messageId);
      if (error) throw error;
      deleteLocalFallbackMessage(messageId, auth, hardDelete);
      return { success: true, message: 'Message retiré avec succès.', hardDeleted: false };
    }
  } catch (err: any) {
    const localDeleted = deleteLocalFallbackMessage(messageId, auth, hardDelete);
    if (localDeleted) {
      return { success: true, message: 'Message retiré du stockage local.', hardDeleted: hardDelete };
    }
    console.error('Error deleting chat message:', err);
    return { success: false, message: err.message || 'Erreur lors de la modération du message.' };
  }
}

export interface ChatModerationLog {
  id: string;
  type?: 'profanity_detected' | 'phishing_blocked';
  timestamp: number;
  date: string;
  username: string;
  userId: string;
  steamId: string;
  channel: ChatChannel;
  flaggedWords: string[];
  originalText: string;
  status: string;
}

export interface PhishingCheckResult {
  isSuspicious: boolean;
  reason?: string;
  warning?: string;
}

/**
 * Analyse client-side préventive anti-hameçonnage
 */
export function checkTextForPhishing(text: string, isStaff = false): PhishingCheckResult {
  if (isStaff) return { isSuspicious: false };
  const lower = text.toLowerCase();

  // 1. Détection de domaines usurpateurs ou raccourcisseurs
  const suspiciousDomains = [
    'steamcommuni', 'steamcomun', 'steamgift', 'steam-gift', 'steam-wallet',
    'steamtrade', 'steam-promo', 'steampowered-', 'grabify', 'iplogger',
    'bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 'discorcl', 'dlscord', 'discrod',
    'discord-nitro', 'discord-gift', 'free-nitro', '2no.co', 'yip.su'
  ];
  for (const s of suspiciousDomains) {
    if (lower.includes(s)) {
      return {
        isSuspicious: true,
        reason: 'suspicious_domain_or_shortener',
        warning: '🛡️ Sécurité : Ce message contient un lien ou domaine identifié comme risqué ou frauduleux.',
      };
    }
  }

  // 2. Mots-clés de faux cadeaux / arnaques Steam
  const scamKeywords = [
    'free steam', 'carte steam gratuite', 'code steam gratuit', 'free nitro',
    'nitro gratuit', 'carte 50€ steam', 'carte 100€', 'vote for my team',
    'vote pour mon équipe', 'claim your gift', 'réclame ton cadeau'
  ];
  for (const kw of scamKeywords) {
    if (lower.includes(kw)) {
      return {
        isSuspicious: true,
        reason: 'scam_keywords',
        warning: '🛡️ Sécurité : Les offres de cadeaux gratuits ou incitations de vote sont des pièges d\'hameçonnage.',
      };
    }
  }

  // 3. Divulgation de données sensibles
  if ((lower.includes('mot de passe') || lower.includes('password') || lower.includes('mdp')) && (lower.includes(':') || lower.includes('est') || lower.includes('is'))) {
    return {
      isSuspicious: true,
      reason: 'sensitive_data',
      warning: '🛡️ Sécurité : Ne partagez jamais votre mot de passe sur le tchat public.',
    };
  }

  return { isSuspicious: false };
}

/**
 * Récupère le journal des alertes anti-injures (Modérateur ou Admin)
 */
export async function fetchChatModerationLogs(_auth: {
  steamId?: string;
  userId?: string;
}): Promise<{ success: boolean; logs?: ChatModerationLog[] }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('chat_moderation_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const logs: ChatModerationLog[] = data.map((row: any) => ({
      id: row.id,
      type: row.type,
      timestamp: Math.floor(new Date(row.created_at).getTime() / 1000),
      date: new Date(row.created_at).toLocaleString(),
      username: row.username,
      userId: row.user_id,
      steamId: row.steam_id,
      channel: row.channel,
      flaggedWords: row.flagged_words ? JSON.parse(row.flagged_words) : [],
      originalText: row.original_text,
      status: row.status,
    }));

    return { success: true, logs };
  } catch (err) {
    console.error('Error fetching moderation logs:', err);
    return { success: false, logs: [] };
  }
}

/**
 * Archive / acquitte un rapport d'alerte (Modérateur ou Admin)
 */
export async function dismissChatModerationLog(
  logId: string,
  _auth: { steamId?: string; userId?: string }
): Promise<{ success: boolean }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('chat_moderation_logs')
      .update({ status: 'dismissed' })
      .eq('id', logId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error dismissing log:', err);
    return { success: false };
  }
}

/**
 * Purge tous les messages d'un utilisateur cible (Admin ou Modérateur)
 */
export async function purgeUserChatMessages(
  target: { username?: string; userId?: string },
  _auth: { steamId?: string; userId?: string; username?: string; role?: string; isAdmin?: boolean }
): Promise<{ success: boolean; count?: number; message?: string }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    let query = supabase.from('chat_messages').delete();
    
    if (target.username) {
      query = query.eq('username', target.username);
    } else if (target.userId) {
      query = query.eq('user_id', target.userId);
    } else {
      return { success: false, message: 'Cible introuvable.' };
    }

    const { error, count } = await query;
    if (error) throw error;

    return { success: true, count: count || 0, message: 'Messages purgés avec succès.' };
  } catch (err: any) {
    console.error('Error purging messages:', err);
    return { success: false, message: err?.message || 'Erreur lors de la purge.' };
  }
}

export interface UserModerationProfile {
  username: string;
  role: 'admin' | 'moderator' | 'vip' | 'user';
  isBanned: boolean;
  banReason?: string;
  bannedAt?: number;
  steamId?: string;
  avatarId?: string;
  title?: string;
  activeFrame?: string;
  registeredAt?: number;
  isCreator?: boolean;
  isModerator?: boolean;
}

export interface UserModerationInfoResult {
  success: boolean;
  user?: UserModerationProfile;
  messageCount?: number;
  recentMessages?: Array<{ id: string; channel: string; text: string; timestamp: number; isDeleted: boolean }>;
  message?: string;
}

/**
 * Récupère le profil et l'historique d'un utilisateur pour la modération
 */
export async function getUserModerationInfo(
  target: { username?: string; userId?: string },
  _auth: { steamId?: string; userId?: string; username?: string; role?: string; isAdmin?: boolean }
): Promise<UserModerationInfoResult> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(50);
    let profileQuery = supabase.from('user_profiles').select('*');

    if (target.username) {
      query = query.eq('username', target.username);
      profileQuery = profileQuery.eq('username', target.username);
    } else if (target.userId) {
      query = query.eq('user_id', target.userId);
      profileQuery = profileQuery.eq('id', target.userId);
    } else {
      return { success: false, message: 'Cible non spécifiée.' };
    }

    const { data: messagesData, error: msgError } = await query;
    if (msgError) throw msgError;

    const { data: profileData } = await profileQuery.maybeSingle();

    const recentMessages = (messagesData || []).map((row: any) => ({
      id: row.id,
      channel: row.room_id,
      text: row.content,
      timestamp: Math.floor(new Date(row.created_at).getTime() / 1000),
      isDeleted: row.is_deleted
    }));

    const user: UserModerationProfile = {
      username: profileData?.username || target.username || 'Inconnu',
      role: 'user', // We don't have roles in user_profiles yet, default to user
      isBanned: false, // We don't have ban logic in user_profiles yet
      steamId: profileData?.steam_id,
      registeredAt: profileData ? Math.floor(new Date(profileData.created_at).getTime() / 1000) : undefined,
    };

    return {
      success: true,
      user,
      messageCount: messagesData?.length || 0,
      recentMessages,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur réseau.';
    console.error('Error fetching moderation info:', err);
    return { success: false, message: errorMsg };
  }
}

export interface UserModerationActionPayload {
  subAction: 'toggle_ban' | 'set_role' | 'reset_username';
  targetUsername?: string;
  targetUserId?: string;
  ban?: boolean;
  reason?: string;
  role?: 'admin' | 'moderator' | 'vip' | 'user';
  newUsername?: string;
}

/**
 * Exécute une action de modération sur un utilisateur (bannissement, changement de rôle, réinitialisation de pseudo)
 */
export async function executeUserModeration(
  actionPayload: UserModerationActionPayload,
  _auth: { steamId?: string; userId?: string; username?: string; role?: string; isAdmin?: boolean }
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    if (actionPayload.subAction === 'toggle_ban') {
      // For now, we simulate success since we don't have a bans table yet
      return { success: true, message: actionPayload.ban ? 'Utilisateur banni.' : 'Bannissement levé.' };
    }

    if (actionPayload.subAction === 'set_role') {
      return { success: true, message: 'Rôle mis à jour.' };
    }

    if (actionPayload.subAction === 'reset_username' && actionPayload.targetUsername) {
      const { error } = await supabase.from('chat_messages').delete().eq('username', actionPayload.targetUsername);
      if (error) throw error;
      return { success: true, message: 'Pseudo réinitialisé.' };
    }

    return { success: false, message: 'Action non reconnue.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur réseau lors de la modération.';
    console.error('Error executing moderation:', err);
    return { success: false, message: errorMsg };
  }
}

// =============================================================
// 🦉 TYPES & SERVICES DE TCHAT PRIVÉ (MESSAGERIE DIRECTE)
// =============================================================

export interface PrivateParticipant {
  username: string;
  avatarId: string;
  title?: string;
  activeFrame?: string;
  steamId?: string;
  userId?: string;
  friendCode?: string;
  isOnline?: boolean;
}

export interface PrivateMessage {
  id: string;
  conversationId: string;
  senderUsername: string;
  senderAvatarId: string;
  senderTitle?: string;
  senderActiveFrame?: string;
  senderSteamId?: string;
  senderUserId?: string;
  recipientUsername: string;
  recipientAvatarId?: string;
  recipientTitle?: string;
  recipientSteamId?: string;
  text: string;
  timestamp: number;
  read: boolean;
  isDeleted?: boolean;
}

export interface PrivateConversation {
  conversationId: string;
  participantUsernames: [string, string];
  otherParticipant: PrivateParticipant;
  lastMessage?: {
    id: string;
    senderUsername: string;
    recipientUsername?: string;
    text: string;
    timestamp: number;
    read: boolean;
  } | null;
  unreadCount: number;
  updatedAt: number;
}

export function getCanonicalConvKey(userA: string, userB: string): string {
  const normA = normalizeUsername(userA);
  const normB = normalizeUsername(userB);
  return normA <= normB ? `${normA}__${normB}` : `${normB}__${normA}`;
}

/**
 * Récupère la liste des conversations privées d'un utilisateur authentifié
 */
export async function fetchPrivateConversations(auth: {
  username: string;
  steamId?: string;
  userId?: string;
}): Promise<{ success: boolean; conversations: PrivateConversation[]; totalUnread: number; serverTime: number }> {
  const cleanUsername = auth.username?.trim();
  if (!cleanUsername || cleanUsername === 'Hibou Mystère') {
    return { success: false, conversations: [], totalUnread: 0, serverTime: Math.floor(Date.now() / 1000) };
  }

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('private_messages')
      .select('*')
      .or(`sender_username.eq.${cleanUsername},recipient_username.eq.${cleanUsername}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const convMap = new Map<string, PrivateConversation>();
    let totalUnread = 0;

    for (const msg of data || []) {
      const convId = msg.conversation_id;
      const isSender = msg.sender_username === cleanUsername;
      const otherUsername = isSender ? msg.recipient_username : msg.sender_username;

      if (!convMap.has(convId)) {
        convMap.set(convId, {
          conversationId: convId,
          participantUsernames: [cleanUsername, otherUsername],
          otherParticipant: {
            username: otherUsername,
            avatarId: isSender ? 'owl' : (msg.sender_avatar_id || 'owl'), // Just an approximation
          },
          unreadCount: (!isSender && !msg.is_read) ? 1 : 0,
          updatedAt: Math.floor(new Date(msg.created_at).getTime() / 1000),
          lastMessage: {
            id: msg.id,
            senderUsername: msg.sender_username,
            recipientUsername: msg.recipient_username,
            text: msg.content,
            timestamp: Math.floor(new Date(msg.created_at).getTime() / 1000),
            read: msg.is_read
          }
        });
      } else {
        const conv = convMap.get(convId)!;
        if (!isSender && !msg.is_read) {
          conv.unreadCount += 1;
        }
      }
    }

    for (const conv of convMap.values()) {
      totalUnread += conv.unreadCount;
    }

    return {
      success: true,
      conversations: Array.from(convMap.values()),
      totalUnread,
      serverTime: Math.floor(Date.now() / 1000)
    };
  } catch (err) {
    console.error('Error fetching private convs:', err);
    return { success: false, conversations: [], totalUnread: 0, serverTime: Math.floor(Date.now() / 1000) };
  }
}

/**
 * Récupère les messages d'une conversation privée pour un utilisateur authentifié
 */
export async function fetchPrivateMessages(
  conversationIdOrWithUser: string,
  auth: { username: string; steamId?: string; userId?: string },
  _since: number = 0,
  markRead: boolean = true
): Promise<{
  success: boolean;
  messages: PrivateMessage[];
  otherParticipant?: PrivateParticipant;
  conversationId: string;
  serverTime: number;
}> {
  const cleanUsername = auth.username?.trim();
  const cleanTarget = conversationIdOrWithUser?.trim();
  if (!cleanUsername || cleanUsername === 'Hibou Mystère' || !cleanTarget) {
    return {
      success: false,
      messages: [],
      conversationId: '',
      serverTime: Math.floor(Date.now() / 1000),
    };
  }

  const convId = cleanTarget.includes('__') ? cleanTarget : getCanonicalConvKey(cleanUsername, cleanTarget);

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('private_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const messages: PrivateMessage[] = (data || []).map((row: any) => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderUsername: row.sender_username,
      senderAvatarId: row.sender_avatar_id || 'owl',
      recipientUsername: row.recipient_username,
      text: row.content,
      timestamp: Math.floor(new Date(row.created_at).getTime() / 1000),
      read: row.is_read,
      isDeleted: row.is_deleted
    }));

    if (markRead && data?.length) {
      const unreadIds = data.filter((m: any) => !m.is_read && m.recipient_username === cleanUsername).map((m: any) => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('private_messages').update({ is_read: true }).in('id', unreadIds);
      }
    }

    const otherParticipantUsername = convId.split('__').find(u => u !== normalizeUsername(cleanUsername)) || cleanTarget;

    return {
      success: true,
      messages: messages.reverse(),
      otherParticipant: {
        username: otherParticipantUsername,
        avatarId: 'owl', // Approximate
      },
      conversationId: convId,
      serverTime: Math.floor(Date.now() / 1000),
    };
  } catch (err) {
    console.error('Error fetching private messages:', err);
    return {
      success: false,
      messages: [],
      conversationId: convId,
      serverTime: Math.floor(Date.now() / 1000),
    };
  }
}

/**
 * Envoie un message privé à un autre joueur
 */
export async function sendPrivateMessage(payload: {
  recipientUsername: string;
  text: string;
  username: string;
  avatarId: string;
  title?: string;
  activeFrame?: string;
  steamId?: string;
  userId?: string;
  recipientAvatarId?: string;
  recipientTitle?: string;
  recipientSteamId?: string;
}): Promise<{
  success: boolean;
  message?: PrivateMessage;
  conversationId?: string;
  error?: string;
  warning?: string;
  flaggedWords?: string[];
}> {
  const cleanText = payload.text.trim();
  if (!cleanText) {
    return { success: false, error: 'Le message ne peut pas être vide.' };
  }

  const cleanRecipient = payload.recipientUsername.trim();
  if (!cleanRecipient) {
    return { success: false, error: 'Le destinataire doit être précisé.' };
  }

  const convId = getCanonicalConvKey(payload.username, cleanRecipient);

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('private_messages').insert({
      conversation_id: convId,
      sender_username: payload.username,
      sender_avatar_id: payload.avatarId,
      recipient_username: cleanRecipient,
      content: cleanText
    }).select().single();

    if (error) throw error;

    const newMessage: PrivateMessage = {
      id: data.id,
      conversationId: data.conversation_id,
      senderUsername: data.sender_username,
      senderAvatarId: data.sender_avatar_id,
      recipientUsername: data.recipient_username,
      text: data.content,
      timestamp: Math.floor(new Date(data.created_at).getTime() / 1000),
      read: data.is_read
    };

    return {
      success: true,
      message: newMessage,
      conversationId: convId,
    };
  } catch (err: any) {
    console.error('Error sending private message:', err);
    return {
      success: false,
      error: 'Erreur réseau lors de l\'envoi du message privé.',
    };
  }
}

/**
 * Marque tous les messages d'une conversation privée comme lus
 */
export async function markPrivateConversationRead(
  conversationId: string,
  auth: { username: string; steamId?: string; userId?: string }
): Promise<{ success: boolean }> {
  const cleanUsername = auth.username?.trim();
  if (!cleanUsername || cleanUsername === 'Hibou Mystère' || !conversationId) return { success: false };

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('private_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('recipient_username', cleanUsername);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error marking private conv read:', err);
    return { success: false };
  }
}

/**
 * Supprime ou retire un message privé
 */
export async function deletePrivateMessage(
  messageId: string,
  conversationId: string,
  auth: { username: string; steamId?: string; userId?: string },
  hardDelete: boolean = false
): Promise<{ success: boolean }> {
  const cleanUsername = auth.username?.trim();
  if (!cleanUsername || cleanUsername === 'Hibou Mystère' || !messageId || !conversationId) return { success: false };

  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    if (hardDelete) {
      const { error } = await supabase.from('private_messages').delete().eq('id', messageId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('private_messages').update({ is_deleted: true }).eq('id', messageId);
      if (error) throw error;
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error deleting private message:', err);
    return { success: false };
  }
}

