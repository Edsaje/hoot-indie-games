import { getSupabaseClient } from './supabase';

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

/**
 * Crée un nouveau salon de duel en tant qu'Hôte
 */
export async function createVersusRoom(
  roomCode: string,
  profile: VersusPlayerProfile
): Promise<{ success: boolean; roomCode: string; playerId: string; message?: string }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const cleanRoomCode = roomCode.trim().toUpperCase();
    const hostId = `host_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Delete existing room if any (clean up)
    await supabase.from('versus_rooms').delete().eq('room_code', cleanRoomCode);

    const { error } = await supabase.from('versus_rooms').insert({
      room_code: cleanRoomCode,
      host_id: hostId,
      host_profile: profile,
      status: 'waiting'
    });

    if (error) throw error;

    return { success: true, roomCode: cleanRoomCode, playerId: hostId };
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
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const cleanRoomCode = roomCode.trim().toUpperCase();

    const { data: room, error: fetchError } = await supabase
      .from('versus_rooms')
      .select('*')
      .eq('room_code', cleanRoomCode)
      .single();

    if (fetchError || !room) {
      throw new Error('Salon introuvable ou fermé.');
    }

    let playerId = existingPlayerId;
    let opponent = null;

    if (existingPlayerId && (room.host_id === existingPlayerId || room.guest_id === existingPlayerId)) {
      // Rejoining
      opponent = room.host_id === existingPlayerId ? room.guest_profile : room.host_profile;
      if (opponent) opponent.id = room.host_id === existingPlayerId ? room.guest_id : room.host_id;
    } else {
      // New join
      if (room.guest_id && room.status !== 'waiting') {
        throw new Error('Le salon est complet.');
      }
      playerId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      
      const { error: updateError } = await supabase.from('versus_rooms').update({
        guest_id: playerId,
        guest_profile: profile,
        status: 'playing',
        updated_at: new Date().toISOString()
      }).eq('room_code', cleanRoomCode);

      if (updateError) throw updateError;
      
      opponent = room.host_profile;
      if (opponent) opponent.id = room.host_id;

      // Send a system message that guest joined
      await sendVersusMessage(cleanRoomCode, playerId, { type: 'guest_joined', profile });
    }

    return { success: true, roomCode: cleanRoomCode, playerId: playerId as string, opponent };
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
    const supabase = await getSupabaseClient();
    if (!supabase) return false;

    const cleanRoomCode = roomCode.trim().toUpperCase();

    const { error } = await supabase.from('versus_messages').insert({
      room_code: cleanRoomCode,
      sender_id: playerId,
      payload: message
    });

    if (error) return false;
    
    // Update room timestamp
    await supabase.from('versus_rooms').update({ updated_at: new Date().toISOString() }).eq('room_code', cleanRoomCode);
    
    return true;
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
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const cleanRoomCode = roomCode.trim().toUpperCase();

    // Check room status
    const { data: room, error: roomError } = await supabase
      .from('versus_rooms')
      .select('*')
      .eq('room_code', cleanRoomCode)
      .single();

    if (roomError || !room) {
      return { success: false, events: [], lastMessageId, opponentConnected: false, roomClosed: true };
    }

    const isHost = room.host_id === playerId;
    const opponentConnected = isHost ? Boolean(room.guest_id) : true;
    
    let opponent = null;
    if (opponentConnected) {
      opponent = isHost ? room.guest_profile : room.host_profile;
      if (opponent) opponent.id = isHost ? room.guest_id : room.host_id;
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
      .from('versus_messages')
      .select('*')
      .eq('room_code', cleanRoomCode)
      .gt('id', lastMessageId)
      .neq('sender_id', playerId) // Only opponent messages
      .order('id', { ascending: true });

    if (msgError) throw msgError;

    const events = (messages || []).map((m: any) => m.payload);
    const newLastId = messages?.length ? messages[messages.length - 1].id : lastMessageId;

    return {
      success: true,
      events,
      lastMessageId: newLastId,
      opponent,
      opponentConnected,
      roomClosed: room.status === 'closed'
    };
  } catch (err) {
    return { success: false, events: [], lastMessageId, opponentConnected: false };
  }
}

/**
 * Quitte le salon et prévient l'adversaire
 */
export async function leaveVersusRoom(roomCode: string, playerId: string): Promise<void> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return;

    const cleanRoomCode = roomCode.trim().toUpperCase();

    // Send leave message
    await sendVersusMessage(cleanRoomCode, playerId, { type: 'player_left', playerId });

    // Mark room as closed or just delete it if host leaves
    const { data: room } = await supabase.from('versus_rooms').select('host_id').eq('room_code', cleanRoomCode).single();
    if (room && room.host_id === playerId) {
      await supabase.from('versus_rooms').update({ status: 'closed' }).eq('room_code', cleanRoomCode);
      // Wait a bit before deleting so guest can fetch the event
      setTimeout(() => {
        supabase.from('versus_rooms').delete().eq('room_code', cleanRoomCode).then();
      }, 5000);
    }
  } catch {
    // Ignorer lors de la fermeture
  }
}
