/**
 * ⚔️ services/versusRelayService.ts
 * Client de communication avec le relais souverain des duels Versus (versus_room.php).
 * Fonctionne à 100% sur le serveur OVH Hoot Indie Games, sans dépendance externe.
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

const RELAY_API = '/api/versus_room.php';

async function postRelay(payload: Record<string, any>): Promise<any> {
  const res = await fetch(RELAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    throw new Error(errJson?.message || `Erreur serveur (${res.status})`);
  }

  return res.json();
}

/**
 * Crée un nouveau salon de duel en tant qu'Hôte
 */
export async function createVersusRoom(
  roomCode: string,
  profile: VersusPlayerProfile
): Promise<{ success: boolean; roomCode: string; playerId: string; message?: string }> {
  try {
    const cleanRoomCode = roomCode.trim().toUpperCase();
    const data = await postRelay({
      action: 'create_room',
      roomCode: cleanRoomCode,
      playerProfile: profile,
    });

    if (!data.success) {
      throw new Error(data.message || 'Impossible de créer le salon.');
    }

    return {
      success: true,
      roomCode: data.roomCode || cleanRoomCode,
      playerId: data.playerId,
      message: data.message,
    };
  } catch (err: any) {
    throw new Error(err.message || 'Impossible de créer le salon.');
  }
}

/**
 * Rejoint un salon de duel existant en tant qu'Invité
 */
export async function joinVersusRoom(
  roomCode: string,
  profile: VersusPlayerProfile,
  existingPlayerId?: string
): Promise<{ success: boolean; roomCode: string; playerId: string; opponent?: any; message?: string }> {
  try {
    const cleanRoomCode = roomCode.trim().toUpperCase();
    const data = await postRelay({
      action: 'join_room',
      roomCode: cleanRoomCode,
      playerProfile: profile,
      playerId: existingPlayerId,
    });

    if (!data.success) {
      throw new Error(data.message || 'Impossible de rejoindre le salon.');
    }

    return {
      success: true,
      roomCode: data.roomCode || cleanRoomCode,
      playerId: data.playerId,
      opponent: data.opponent,
      message: data.message,
    };
  } catch (err: any) {
    throw new Error(err.message || 'Impossible de rejoindre le salon.');
  }
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
    const cleanRoomCode = roomCode.trim().toUpperCase();
    const data = await postRelay({
      action: 'send_message',
      roomCode: cleanRoomCode,
      playerId,
      message,
    });

    return Boolean(data.success);
  } catch (err) {
    console.warn('[VersusRelay] Erreur envoi message:', err);
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
  try {
    const cleanRoomCode = roomCode.trim().toUpperCase();
    const data = await postRelay({
      action: 'poll_events',
      roomCode: cleanRoomCode,
      playerId,
      lastMessageId,
    });

    if (!data.success) {
      return {
        success: false,
        events: [],
        lastMessageId,
        opponentConnected: false,
        roomClosed: Boolean(data.roomClosed),
      };
    }

    return {
      success: true,
      events: data.events || [],
      lastMessageId: typeof data.lastMessageId === 'number' ? data.lastMessageId : lastMessageId,
      opponent: data.opponent,
      opponentConnected: Boolean(data.opponentConnected),
      roomClosed: Boolean(data.roomClosed),
    };
  } catch {
    return {
      success: false,
      events: [],
      lastMessageId,
      opponentConnected: false,
    };
  }
}

/**
 * Quitte le salon et prévient l'adversaire
 */
export async function leaveVersusRoom(roomCode: string, playerId: string): Promise<void> {
  try {
    const cleanRoomCode = roomCode.trim().toUpperCase();
    await postRelay({
      action: 'leave_room',
      roomCode: cleanRoomCode,
      playerId,
    });
  } catch {
    // Ignorer les erreurs réseau lors de la fermeture
  }
}
