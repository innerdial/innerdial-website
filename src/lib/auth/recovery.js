/**
 * The half of a password reset that has to run before anything else does.
 *
 * Supabase builds a recovery email from the project's Site URL, and the
 * dashboard's own "send recovery" never passes a `redirectTo` — so the link
 * always lands on `/`, never on the page that can act on it. What it carries is
 * a fragment, not a query: `#access_token=…&refresh_token=…&type=recovery`.
 *
 * Two consequences shape this module. The fragment never reaches Netlify, so no
 * redirect rule can route on it and the forwarding has to happen in the browser.
 * And it is imported by `main.js`, which every visitor to the marketing homepage
 * downloads, so it stays free of Supabase — establishing the session is
 * `$lib/auth/password-reset.js`'s job, inside the reset screen's own chunk.
 */
import { navigate } from 'svelte-routing';

export const RESET_PATH = '/reset-password';

/**
 * @typedef {{ kind: 'session', accessToken: string, refreshToken: string }} RecoverySession
 * @typedef {{ kind: 'failed', expired: boolean }} RecoveryFailure
 */

/**
 * Reads what Supabase appended to the redirect.
 *
 * A failure is reported as a shape, not as the provider's `error_description`.
 * That string arrives from the address bar, where anyone can write it, and a
 * page that renders it verbatim is a page that will say whatever a crafted link
 * tells it to — including "call this number". The two outcomes worth
 * distinguishing are "expired" and "not valid", and both are phrased here.
 *
 * @param {string} hash
 * @returns {RecoverySession | RecoveryFailure | null}
 */
export function readRecoveryFragment(hash = '') {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) {
    return null;
  }

  const params = new URLSearchParams(raw);

  if (params.has('error') || params.has('error_code')) {
    return { kind: 'failed', expired: params.get('error_code') === 'otp_expired' };
  }

  const accessToken = params.get('access_token') ?? '';
  const refreshToken = params.get('refresh_token') ?? '';

  // `type` separates a reset from an email-change confirmation, which arrives
  // in the same shape and must not be answered with a new-password form.
  if (params.get('type') !== 'recovery' || !accessToken || !refreshToken) {
    return null;
  }

  return { kind: 'session', accessToken, refreshToken };
}

/**
 * Moves a recovery link off the site root and onto the screen that handles it,
 * fragment intact, before the router renders anything.
 *
 * Through svelte-routing's `navigate` rather than `history.replaceState`,
 * which looks like it would do: the router's history reads the address once,
 * when its module is first evaluated, and that happens while `main.js` is still
 * resolving its imports — so a bare `replaceState` in the body below changes the
 * address bar and leaves the router rendering the homepage. `navigate` moves
 * both. Replace, not push, so the address holding the token never becomes
 * somewhere the back button can return to.
 */
export function claimRecoveryLink() {
  if (typeof window === 'undefined') {
    return;
  }

  const link = readRecoveryFragment(window.location.hash);
  if (!link || window.location.pathname === RESET_PATH) {
    return;
  }

  const next = `${RESET_PATH}${window.location.search}${window.location.hash}`;

  // Nothing is focused this early, and blurring reaches for `document
  // .activeElement` without checking it is there.
  navigate(next, { replace: true, blurActiveElement: false });
}
