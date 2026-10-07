# -*- coding: utf-8 -*-
import re

with open('src/services/userCloudSyncService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'getSupabaseClient' not in content:
    content = content.replace("import type { OdysseySaveState } from '../types/odyssey';",
"import type { OdysseySaveState } from '../types/odyssey';\nimport { getSupabaseClient } from './supabase';")


fetch_replacement = """export async function fetchUserCloudSave(identifiers: {
  steamId?: string;
  userId?: string;
  username?: string;
}): Promise<{ success: boolean; exists: boolean; data?: UserCloudSavePayload; message?: string }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('save_data')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { success: true, exists: false };
      throw error;
    }

    return { success: true, exists: !!data, data: data?.save_data };
  } catch (err: any) {
    return { success: false, exists: false, message: err.message };
  }
}"""

push_replacement = """export async function pushUserCloudSave(
  identifiers: { steamId?: string; userId?: string; username?: string },
  payload: UserCloudSavePayload,
  options?: { strategy?: 'merge' | 'replace'; odysseyStrategy?: 'replace' }
): Promise<{ success: boolean; message: string; data?: UserCloudSavePayload }> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    payload.syncedAt = new Date().toISOString();

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        username: identifiers.username || 'unknown',
        steam_id: identifiers.steamId,
        save_data: payload,
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;

    return { success: true, message: 'Sauvegarde Cloud effectuee', data: payload };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}"""

ack_replacement = """export async function acknowledgeAdminReward(rewardId?: string): Promise<boolean> {
  return true;
}"""

content = re.sub(r'export async function fetchUserCloudSave.*?return response\.json\(\);\s*\}', fetch_replacement, content, flags=re.DOTALL)
content = re.sub(r'export async function pushUserCloudSave.*?return response\.json\(\);\s*\}', push_replacement, content, flags=re.DOTALL)
content = re.sub(r'export async function acknowledgeAdminReward.*?return res\.ok;\s*\} catch \(err\) \{.*?return false;\s*\}\s*\}', ack_replacement, content, flags=re.DOTALL)


with open('src/services/userCloudSyncService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')