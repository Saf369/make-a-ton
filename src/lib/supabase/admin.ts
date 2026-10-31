import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates an elevated Supabase client for trusted server-side administrative operations
 * (e.g., billing engine execution, user management, background cron tasks).
 * 
 * CRITICAL SAFETY RULES:
 * 1. This client must NEVER be called from browser / client-side components.
 * 2. Never expose service role or secret keys to frontend bundles.
 * 3. Normal user operations must use authenticated user-scoped client in `server.ts` or `client.ts`.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('FATAL: createAdminClient cannot be executed in browser context.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required administrative Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local'
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
