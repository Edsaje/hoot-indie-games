const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

// Lazy singleton promise
let clientPromise: Promise<any> | null = null;

export async function getSupabaseClient(): Promise<any> {
  if (!isSupabaseConfigured) return null;
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    });
  }
  return clientPromise;
}

// Null fallback for sync references
export const supabase: any = null;
