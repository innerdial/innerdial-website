import { createClient } from '@supabase/supabase-js';
import { appConfig, AUTH_STORAGE_KEY } from '$lib/utils/config.js';

const { url, anonKey } = appConfig.supabase;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/**
 * This site reaches Supabase with the anon key and nothing else.
 *
 * It is a static build: a service-role key placed here would be served to every
 * visitor. Every admin capability is therefore a Postgres policy keyed on
 * `is_admin()`, and an operator's own JWT is what satisfies it. Billing is the
 * same argument taken one step further — the subscription tables have no client
 * write policy at all, and the only writer is an edge function holding the
 * Razorpay secret where a browser cannot read it.
 *
 * One client serves both surfaces. A collector signing in at /login and an
 * operator signing in at /admin/login are the same Supabase account system;
 * what separates them is `is_admin()`, not a second session.
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
        // Both surfaces are reached by URL, never by an auth redirect carrying
        // a token, so parsing one out of the address bar has nothing to find.
        // A password-reset link would change that and this with it.
        detectSessionInUrl: false,
        storageKey: AUTH_STORAGE_KEY,
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

  // A refusal this site raised itself is already written for the person about
  // to read it. Running it past the Supabase phrasings below risks a false
  // match turning a clear sentence into an unrelated one.
  if (/** @type {any} */ (error)?.name === 'AccountInputError') {
    return /** @type {any} */ (error).message;
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

  if (/new password should be different/i.test(message)) {
    return 'That is already your password.';
  }

  if (/already registered|already been registered|email address is already/i.test(message)) {
    return 'Another account already uses that email address.';
  }

  // Supabase rate-limits password and email changes per account, and phrases it
  // as "For security purposes, you can only request this after N seconds".
  if (/for security purposes|rate limit|too many requests/i.test(message)) {
    return 'Too many attempts just now. Wait a minute and try again.';
  }

  if (/failed to fetch|networkerror/i.test(message)) {
    return 'Could not reach Supabase. Check the connection and try again.';
  }

  return message || 'Something failed without saying why.';
}
