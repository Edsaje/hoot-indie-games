/**
 * Service de Relais Multijoueur Souverain (Versus 1v1) — Hoot Indie Games
 * Remplace WebRTC P2P par une communication HTTPS sécurisée sur OVHcloud :
 * - Aucun popup d'autorisation réseau local (zéro permission navigateur)
 * - Fiabilité 100% même derrière pare-feux, VPNs et connexions mobiles
 */

export interface VersusPlayerProfile {
  name: string;
  avatarId: string;
  elo: number;
}

export interface VersusPollResponse {
  success: boolean;
  events: any[];
  lastMessageId: number;
  opponent?: {
    id: string;
    name: string;
    avatarId: string;
    elo: number;
  } | null;
  opponentConnected: boolean;
  roomClosed?: boolean;
}

const API_ENDPOINT = '/api/versus_room.php';

/**
 * Crée un nouveau salon de duel en tant qu'Hôte
 */
export async function createVersusRoom(
  roomCode: string,
  profile: VersusPlayerProfile
): Promise<{ success: boolean; roomCode: string; playerId: string; message?: string }> {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create_room',
      roomCode: roomCode.trim().toUpperCase(),
      playerProfile: profile,
    }),
  });

  if (!res.ok) {
    throw new Error(`Erreur réseau HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data || !data.success) {
    throw new Error(data?.message || 'Impossible de créer le salon.');
  }

  return data;
}

/**
 * Rejoint un salon de duel existant en tant qu'Invité
 */
export async function joinVersusRoom(
  roomCode: string,
  profile: VersusPlayerProfile,
  existingPlayerId?: string
): Promise<{ success: boolean; roomCode: string; playerId: string; opponent?: any; message?: string }> {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'join_room',
      roomCode: roomCode.trim().toUpperCase(),
      playerProfile: profile,
      playerId: existingPlayerId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Erreur réseau HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data || !data.success) {
    throw new Error(data?.message || 'Impossible de rejoindre le salon.');
  }

  return data;
}

/**
 * Envoie un message de synchronisation de jeu (démarrage, réponses, score, manche)
 */
export async function sendVersusMessage(
  roomCode: string,
  playerId: string,
  message: any
): Promise<boolean> {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_message',
        roomCode: roomCode.trim().toUpperCase(),
        playerId,
        message,
      }),
    });

    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    console.warn('Erreur envoi message relais souverain:', err);
    return false;
  }
}

/**
 * Récupère en direct les nouveaux événements de l'adversaire
 */
export async function pollVersusEvents(
  roomCode: string,
  playerId: string,
  lastMessageId: number
): Promise<VersusPollResponse> {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'poll_events',
      roomCode: roomCode.trim().toUpperCase(),
      playerId,
      lastMessageId,
    }),
  });

  if (!res.ok) {
    return {
      success: false,
      events: [],
      lastMessageId,
      opponentConnected: false,
    };
  }

  const data = await res.json().catch(() => null);
  if (!data || !data.success) {
    return {
      success: false,
      events: [],
      lastMessageId,
      opponentConnected: false,
      roomClosed: data?.roomClosed,
    };
  }

  return data as VersusPollResponse;
}

/**
 * Quitte le salon et prévient l'adversaire
 */
export async function leaveVersusRoom(roomCode: string, playerId: string): Promise<void> {
  try {
    await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'leave_room',
        roomCode: roomCode.trim().toUpperCase(),
        playerId,
      }),
    });
  } catch {
    // Ignorer lors de la fermeture
  }
}
