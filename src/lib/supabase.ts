import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const publicKey = publishableKey || anonKey;

/**
 * Supabase supports the publishable key for browser clients.
 * ANON_KEY remains supported for backwards compatibility.
 */
export const supabase: SupabaseClient | null =
  url && publicKey
    ? createClient(url, publicKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);

export const ENV_HINT =
  'أضف VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY في ملف .env ثم أعد تشغيل الخادم.';
