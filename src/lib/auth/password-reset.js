import { getSupabase, inputError } from '$lib/supabase/client.js';
import { updatePassword } from '$lib/account/profile.js';
import { RESET_PATH } from '$lib/auth/recovery.js';

/**
 * The part of a password reset that talks to Supabase.
 *
 * Kept apart from `$lib/auth/recovery.js` on purpose: that module is read by
 * `main.js` on every page load, and importing the client from it would put
 * supabase-js in the bundle a marketing visitor downloads. This one is reached
 * only from the reset screen, which `LazyPage` already loads on demand.
 */

/**
 * Asks Supabase to email a reset link.
 *
 * `redirectTo` is sent even though the dashboard's own recovery email cannot:
 * it is the difference between landing on `/reset-password` and landing on the
 * site root for `claimRecoveryLink()` to forward. The origin is read from the
 * address rather than hardcoded so this works on a deploy preview and on
 * localhost, both of which have to be in the project's Redirect URLs for
 * Supabase to honour it — a URL that is not on that list is quietly replaced
 * with the Site URL rather than refused.
 *
 * Says nothing about whether the address has an account, here or at the call
 * site. Supabase answers the same either way on purpose: a reset form that
 * reports "no such account" is a form for testing whether someone is a
 * customer.
 *
 * @param {string} email
 */
export async function requestPasswordReset(email) {
  const address = email.trim().toLowerCase();

  if (!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    throw inputError('Enter a valid email address.');
  }

  const { error } = await getSupabase().auth.resetPasswordForEmail(address, {
    redirectTo: `${window.location.origin}${RESET_PATH}`,
  });

  if (error) throw error;
}

/**
 * Turns the tokens from a recovery link into a live session.
 *
 * The link is the whole credential — anyone holding it is holding an hour of
 * access to the account — which is why the screen that calls this offers
 * nothing but a password field, and why the reset ends by revoking everything.
 *
 * @param {{ accessToken: string, refreshToken: string }} tokens
 * @returns {Promise<string>} the address the link belongs to, to show who is being changed
 */
export async function startRecoverySession({ accessToken, refreshToken }) {
  const { data, error } = await getSupabase().auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) throw error;

  return data.session?.user?.email ?? '';
}

/**
 * Sets the new password, then signs every session out.
 *
 * The global scope is the point rather than a precaution. Someone resetting a
 * password may be doing it because another person has had it, and a reset that
 * left that person's phone signed in would have changed nothing. The revocation
 * takes this browser with it, so the caller has to send them to /login.
 *
 * @param {string} password
 */
export async function completePasswordReset(password) {
  await updatePassword(password);

  const { error } = await getSupabase().auth.signOut({ scope: 'global' });

  // The password did change; saying it did not would send them round again.
  if (error) {
    console.warn('[auth] password changed, but the other sessions were not revoked:', error);
  }
}
