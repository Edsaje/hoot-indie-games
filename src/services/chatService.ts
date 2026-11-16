/**
 * 🦉 Hoot Indie Games — Service Frontend de Tchat & Messagerie Souveraine
 * 
 * Communique à 100% avec public/api/chat.php sur le serveur OVH Hoot Indie Games,
 * avec résilience et stockage local en mode hors-ligne.
 */

import { normalizeUsername } from '../utils/usernameValidation';

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
    description: 'インディーゲーム愛好家のための日本語ラウンジ',
  },
  {
    id: 'pt-BR',
    name: 'Português',
    label: 'Português',
    icon: '🇧🇷',
    description: 'Salão lusófono para os exploradores de jogos indie',
  },
  {
    id: 'feedback',
    name: 'Suggestions & Bugs',
    label: 'Feedback',
    icon: '💡',
    description: 'Proposez des pépites, signalez un bug ou partagez vos idées',
  },
];

export const FEEDBACK_CATEGORIES: { id: FeedbackCategory; label: string; icon: string; badgeColor: string }[] = [
  { id: 'suggestion', label: 'Suggestion', icon: '💡', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'bug', label: 'Signalement', icon: '🐛', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { id: 'idea', label: 'Idée de Pépite', icon: '✨', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'love', label: 'Coup de Cœur', icon: '❤️', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  { id: 'general', label: 'Avis Général', icon: '💬', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
];

const CHAT_API = '/api/chat.php';
const LOCAL_STORAGE_CHAT_KEY = 'hoot_local_chat_messages_v1';

function getLocalFallbackMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
  since: number = 0
): Promise<{ success: boolean; messages: ChatMessage[]; serverTime: number }> {
  try {
    const params = new URLSearchParams({
      action: 'get_messages',
      channel,
      since: since.toString(),
    });

    const res = await fetch(`${CHAT_API}?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.messages)) {
        return {
          success: true,
          messages: json.messages,
          serverTime: json.serverTime || Math.floor(Date.now() / 1000),
        };
      }
    }
  } catch (_err) {
    // Fallback local en cas de déconnexion réseau
  }

  const local = getLocalFallbackMessages();
  const filtered = channel === 'all' ? local : local.filter((m) => m.channel === channel);
  return { success: true, messages: filtered, serverTime: Math.floor(Date.now() / 1000) };
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
  emailVerified?: boolean;
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
  if (payload.emailVerified === false) {
    throw new Error('email_not_verified');
  }

  const cleanText = payload.text.trim();
  if (!cleanText) {
    return { success: false, error: 'Le message ne peut pas être vide.' };
  }

  // Contrôle anti-hameçonnage préventif
  const phishingCheck = checkTextForPhishing(cleanText);
  if (phishingCheck.isSuspicious) {
    return {
      success: false,
      error: 'phishing_detected',
      warning: phishingCheck.warning || '⚠️ Bouclier Sécurité & Anti-Hameçonnage : Votre message a été bloqué.',
      flaggedWords: [phishingCheck.reason || 'suspicious_pattern'],
    };
  }

  try {
    const res = await fetch(`${CHAT_API}?action=send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.success && json.message) {
      return { success: true, message: json.message };
    } else if (json?.error) {
      return {
        success: false,
        error: json.error,
        warning: json.message,
        flaggedWords: json.flaggedWords,
      };
    }
  } catch (_err) {
    // Fallback local
  }

  // Fallback local si serveur hors-ligne
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
    userId: payload.userId,
    steamId: payload.steamId,
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
 * Supprime ou modère un message de la discussion (Auteur, Modérateur ou Admin)
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
    const res = await fetch(`${CHAT_API}?action=delete_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        messageId,
        hardDelete,
        ...auth,
      }),
    });

    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      deleteLocalFallbackMessage(messageId, auth, hardDelete);
      return { success: true, message: json.message || 'Message supprimé avec succès.', hardDeleted: Boolean(json.hardDeleted) };
    }
  } catch (_err) {
    // Fallback local
  }

  const localDeleted = deleteLocalFallbackMessage(messageId, auth, hardDelete);
  if (localDeleted) {
    return { success: true, message: 'Message retiré du stockage local.', hardDeleted: hardDelete };
  }

  return { success: false, message: 'Erreur lors de la modération du message.' };
}

function deleteLocalFallbackMessage(
  messageId: string,
  auth: { username?: string; userId?: string; steamId?: string; isAdmin?: boolean; isModerator?: boolean },
  hardDelete: boolean
): boolean {
  try {
    const list = getLocalFallbackMessages();
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

  const suspiciousDomains = [
    'steamcommuni', 'steamcomun', 'steamgift', 'steam-gift', 'steam-wallet',
    'steamtrade', 'steam-promo', 'steampowered-', 'grabify', 'iplogger',
    'bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 'discorcl', 'dlscord', 'discrod',
    'discord-nitro', 'discord-gift', 'free-nitro', '2no.co', 'yip.su',
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

  const scamKeywords = [
    'free steam', 'carte steam gratuite', 'code steam gratuit', 'free nitro',
    'nitro gratuit', 'carte 50€ steam', 'carte 100€', 'vote for my team',
    'vote pour mon équipe', 'claim your gift', 'réclame ton cadeau',
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

  if (
    (lower.includes('mot de passe') || lower.includes('password') || lower.includes('mdp')) &&
    (lower.includes(':') || lower.includes('est') || lower.includes('is'))
  ) {
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
export async function fetchChatModerationLogs(auth: {
  steamId?: string;
  userId?: string;
}): Promise<{ success: boolean; logs?: ChatModerationLog[] }> {
  try {
    const params = new URLSearchParams({
      action: 'get_moderation_logs',
      steamId: auth.steamId || '',
      userId: auth.userId || '',
    });

    const res = await fetch(`${CHAT_API}?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.logs)) {
        return { success: true, logs: json.logs };
      }
    }
  } catch (err) {
    console.error('Error fetching moderation logs:', err);
  }
  return { success: false, logs: [] };
}

/**
 * Archive / acquitte un rapport d'alerte (Modérateur ou Admin)
 */
export async function dismissChatModerationLog(
  logId: string,
  auth: { steamId?: string; userId?: string }
): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${CHAT_API}?action=dismiss_moderation_log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ logId, ...auth }),
    });

    const json = await res.json().catch(() => null);
    return { success: Boolean(json?.success) };
  } catch {
    return { success: false };
  }
}

/**
 * Purge tous les messages d'un utilisateur cible (Admin ou Modérateur)
 */
export async function purgeUserChatMessages(
  target: { username?: string; userId?: string },
  auth: { steamId?: string; userId?: string; username?: string; role?: string; isAdmin?: boolean }
): Promise<{ success: boolean; count?: number; message?: string }> {
  try {
    const res = await fetch(`${CHAT_API}?action=purge_user_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ...target, ...auth }),
    });

    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      return { success: true, count: json.count || 0, message: json.message };
    }
    return { success: false, message: json?.message || 'Erreur lors de la purge.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erreur réseau.' };
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
  auth: { steamId?: string; userId?: string; username?: string; role?: string; isAdmin?: boolean }
): Promise<UserModerationInfoResult> {
  try {
    const params = new URLSearchParams({
      action: 'get_user_moderation_info',
      targetUsername: target.username || '',
      targetUserId: target.userId || '',
      steamId: auth.steamId || '',
      userId: auth.userId || '',
    });

    const res = await fetch(`${CHAT_API}?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return json;
      }
    }
  } catch (err: unknown) {
    console.error('Error fetching moderation info:', err);
  }
  return { success: false, message: 'Impossible de récupérer les informations de modération.' };
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
 * Exécute une action de modération sur un utilisateur
 */
export async function executeUserModeration(
  actionPayload: UserModerationActionPayload,
  auth: { steamId?: string; userId?: string; username?: string; role?: string; isAdmin?: boolean }
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${CHAT_API}?action=execute_user_moderation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ...actionPayload, ...auth }),
    });

    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      return { success: true, message: json.message };
    }
    return { success: false, message: json?.message || 'Erreur lors de la modération.' };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur réseau.' };
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
    const params = new URLSearchParams({
      action: 'fetch_private_conversations',
      username: cleanUsername,
    });

    const res = await fetch(`${CHAT_API}?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.conversations)) {
        return {
          success: true,
          conversations: json.conversations,
          totalUnread: json.totalUnread || 0,
          serverTime: json.serverTime || Math.floor(Date.now() / 1000),
        };
      }
    }
  } catch (err) {
    console.error('[Chat] Erreur récupération conversations privées:', err);
  }

  return { success: false, conversations: [], totalUnread: 0, serverTime: Math.floor(Date.now() / 1000) };
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
    const params = new URLSearchParams({
      action: 'fetch_private_messages',
      conversationId: convId,
      username: cleanUsername,
      markRead: markRead ? '1' : '0',
    });

    const res = await fetch(`${CHAT_API}?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.messages)) {
        const otherParticipantUsername = convId.split('__').find((u) => u !== normalizeUsername(cleanUsername)) || cleanTarget;
        return {
          success: true,
          messages: json.messages,
          conversationId: convId,
          serverTime: json.serverTime || Math.floor(Date.now() / 1000),
          otherParticipant: {
            username: otherParticipantUsername,
            avatarId: 'owl',
          },
        };
      }
    }
  } catch (err) {
    console.error('[Chat] Erreur récupération messages privés:', err);
  }

  return {
    success: false,
    messages: [],
    conversationId: convId,
    serverTime: Math.floor(Date.now() / 1000),
  };
}

/**
 * Envoie un message privé à un autre joueur
 */
export async function sendPrivateMessage(payload: {
  username: string;
  avatarId: string;
  recipientUsername: string;
  text: string;
  title?: string;
  activeFrame?: string;
  steamId?: string;
  userId?: string;
  emailVerified?: boolean;
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
  if (payload.emailVerified === false) {
    throw new Error('email_not_verified');
  }

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
    const res = await fetch(`${CHAT_API}?action=send_private_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        senderUsername: payload.username,
        senderAvatarId: payload.avatarId,
        conversationId: convId,
      }),
    });

    const json = await res.json().catch(() => null);
    if (res.ok && json?.success && json.message) {
      return {
        success: true,
        message: json.message,
        conversationId: convId,
      };
    } else if (json?.error) {
      return { success: false, error: json.error };
    }
  } catch (err: any) {
    console.error('Error sending private message:', err);
  }

  return {
    success: false,
    error: 'Erreur réseau lors de l\'envoi du message privé.',
  };
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
    const res = await fetch(`${CHAT_API}?action=mark_private_read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ conversationId, username: cleanUsername }),
    });

    const json = await res.json().catch(() => null);
    return { success: Boolean(json?.success) };
  } catch {
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
    const res = await fetch(`${CHAT_API}?action=delete_private_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        messageId,
        conversationId,
        username: cleanUsername,
        hardDelete,
      }),
    });

    const json = await res.json().catch(() => null);
    return { success: Boolean(json?.success) };
  } catch {
    return { success: false };
  }
}
