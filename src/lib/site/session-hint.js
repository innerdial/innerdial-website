import { AUTH_STORAGE_KEY } from '$lib/utils/config.js';

/**
 * Whether this browser looks signed in, without asking Supabase.
 *
 * The marketing bundle must not import the session module — it would put
 * supabase-js on the homepage's critical path to decide between two links. So
 * this reads the key supabase-js persists to. A key that is present is a hint
 * and not proof — an expired token leaves one behind — and every `/account`
 * route guards itself and sends anyone stale to /login. The cost of being wrong
 * is one redirect.
 *
 * Call it after mount: storage is not readable during the first render.
 *
 * @returns {boolean}
 */
export function hasSessionHint() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  } catch (cause) {
    // Safari in private browsing throws on access. Default to the answer that
    // promises less: offering "Sign in" to someone signed in costs a redirect.
    console.warn('[site] could not read the session hint:', cause);
    return false;
  }
}
