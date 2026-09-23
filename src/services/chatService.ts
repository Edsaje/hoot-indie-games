/**
 * 🦉 Hoot Indie Games — Service Frontend de Tchat Souverain
 * 
 * Communique avec public/api/chat.php avec résilience hors-ligne / localhost
 * et gestion des canaux multilingues et retours joueurs.
 */

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
  category?: FeedbackCategory;
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
    label: '🌍 Global',
    icon: '🌍',
    description: 'Salon international ouvert à tous les explorateurs',
  },
  {
    id: 'fr',
    name: 'Français',
    label: '🇫🇷 Français',
    icon: '🇫🇷',
    description: 'Salon francophone pour échanger astuces et pépites',
  },
  {
    id: 'en',
    name: 'English',
    label: '🇬🇧 English',
    icon: '🇬🇧',
    description: 'International English lounge for indie game discussion',
  },
  {
    id: 'es',
    name: 'Español',
    label: '🇪🇸 Español',
    icon: '🇪🇸',
    description: 'Comunidad hispanohablante de exploradores indie',
  },
  {
    id: 'de',
    name: 'Deutsch',
    label: '🇩🇪 Deutsch',
    icon: '🇩🇪',
    description: 'Deutscher Salon für Indie-Game-Liebhaber',
  },
  {
    id: 'ja',
    name: '日本語',
    label: '🇯🇵 日本語',
    icon: '🇯🇵',
    description: 'インディーゲーム探索者のための日本語ラウンジ',
  },
  {
    id: 'pt-BR',
    name: 'Português',
    label: '🇧🇷 Português',
    icon: '🇧🇷',
    description: 'Espaço para os jogadores e exploradores de língua portuguesa',
  },
  {
    id: 'feedback',
    name: 'Retours & Idées',
    label: '💡 Retours & Idées',
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
    const url = `/api/chat.php?action=get_messages&channel=${encodeURIComponent(channel)}&since=${since}&limit=60`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.messages)) {
        return {
          success: true,
          messages: data.messages,
          serverTime: data.serverTime || Math.floor(Date.now() / 1000),
        };
      }
    }
  } catch {
    // Échec de connexion au serveur PHP (ex: vite dev sans proxy PHP) -> fallback local
  }

  // Fallback localstorage
  const allFallback = getLocalFallbackMessages();
  let filtered = allFallback;
  if (channel !== 'all') {
    filtered = filtered.filter((m) => m.channel === channel);
  }
  if (since > 0) {
    filtered = filtered.filter((m) => m.timestamp > since);
  }

  return {
    success: true,
    messages: filtered,
    serverTime: Math.floor(Date.now() / 1000),
  };
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
  category?: FeedbackCategory;
  scoreData?: {
    game: string;
    score: number;
    mode: string;
  } | null;
}): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  const cleanText = payload.text.trim();
  if (!cleanText) {
    return { success: false, error: 'Le message ne peut pas être vide.' };
  }

  try {
    const res = await fetch('/api/chat.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        action: 'send_message',
        channel: payload.channel,
        text: cleanText,
        username: payload.username,
        avatarId: payload.avatarId,
        title: payload.title,
        activeFrame: payload.activeFrame,
        steamId: payload.steamId,
        category: payload.category || 'general',
        scoreData: payload.scoreData || null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.message) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data?.error || 'Erreur lors de l\'envoi.' };
    } else if (res.status === 429) {
      return { success: false, error: 'Veuillez patienter quelques secondes entre chaque message.' };
    }
  } catch {
    // Fallback local
  }

  // Fallback local si backend injoignable
  const now = Math.floor(Date.now() / 1000);
  const isCreator =
    payload.username.toLowerCase() === 'hibouxe' ||
    payload.username.toLowerCase() === 'edsaje' ||
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
