import { createClient } from '@supabase/supabase-js';
import { appConfig } from '$lib/utils/config.js';

const { url, anonKey } = appConfig.supabase;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/**
 * The console reaches Supabase with the anon key and nothing else.
 *
 * This is a static site: a service-role key placed here would be served to
 * every visitor. Every admin capability is therefore a Postgres policy keyed on
 * `is_admin()`, and an operator's own JWT is what satisfies it.
 */
export function getSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
    );
  }

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // The console is reached by URL, never by an auth redirect carrying a
        // token, so parsing one out of the address bar has nothing to find.
        detectSessionInUrl: false,
        storageKey: 'innerdial-admin-auth',
      },
    });
  }

  return client;
}

/**
 * Turns a PostgREST or auth failure into something an operator can act on.
 * Anything unrecognised is passed through rather than flattened to "went wrong".
 *
 * @param {unknown} error
 * @returns {string}
 */
export function errorMessage(error) {
  if (!error) {
    return 'Something failed without saying why.';
  }

  const message = typeof error === 'string' ? error : (/** @type {any} */ (error).message ?? '');

  if (/invalid login credentials/i.test(message)) {
    return 'That email and password do not match an account.';
  }

  if (/user is banned/i.test(message)) {
    return 'This account has been blocked.';
  }

  if (/blocked_at|admin_delete_user/i.test(message) && /does not exist|schema cache/i.test(message)) {
    return 'Block and delete need the admin_user_moderation migration applied to this Supabase project.';
  }

  if (/email not confirmed/i.test(message)) {
    return 'That account has not confirmed its email address yet.';
  }

  // Raised by the admin_* functions and by every RLS policy refusal.
  if (/admin privileges required/i.test(message) || /row-level security/i.test(message)) {
    return 'This account does not hold admin privileges.';
  }

  if (/failed to fetch|networkerror/i.test(message)) {
    return 'Could not reach Supabase. Check the connection and try again.';
  }

  return message || 'Something failed without saying why.';
}
