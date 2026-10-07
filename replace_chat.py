# -*- coding: utf-8 -*-
import re

with open('src/services/chatService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'getSupabaseClient' not in content:
    content = "import { getSupabaseClient } from './supabase';\n" + content


fetch_chat = """export async function fetchChatMessages(
  channel: ChatChannel | 'all' = 'all',
  since: number = 0
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
      username: row.user_profiles?.username || 'Inconnu',
      avatarId: 'default', // Need join to get avatars
      text: row.content,
      timestamp: Math.floor(new Date(row.created_at).getTime() / 1000),
      isDeleted: row.is_deleted
    }));

    return { success: true, messages: messages.reverse(), serverTime: Math.floor(Date.now() / 1000) };
  } catch (err) {
    return { success: false, messages: [], serverTime: 0 };
  }
}"""

send_chat = """export async function sendMessage(msg: {
  channel: ChatChannel;
  username: string;
  avatarId: string;
  text: string;
  title?: string;
  activeFrame?: string;
  category?: FeedbackCategory;
  userId?: string;
  steamId?: string;
  scoreData?: { game: string; score: number; mode: string } | null;
}, auth?: { token?: string; isAdmin?: boolean }): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Connexion requise' };

    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      room_id: msg.channel,
      content: msg.text
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}"""

content = re.sub(r'export async function fetchChatMessages.*?catch \{.*?\}\s*return \{.*?unacknowledgedCount: 0,\s*\}\s*\}', fetch_chat, content, flags=re.DOTALL)
content = re.sub(r'export async function fetchChatMessages.*?\n\}\n', fetch_chat + '\n', content, flags=re.DOTALL)
content = re.sub(r'export async function sendMessage.*?return \{ success: false.*?\}', send_chat, content, flags=re.DOTALL)


with open('src/services/chatService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')