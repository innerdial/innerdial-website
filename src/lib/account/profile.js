import { getSupabase } from '$lib/supabase/client.js';

/**
 * The collector's own account row, and the three things they may change about it.
 *
 * Only one of the three is a table write. The email lives in `auth.users` and is
 * mirrored into `profiles` by a trigger — a profile update that set it directly
 * would be refused by `guard_profile_privileged_columns`, and rightly: an
 * address changed here but not in auth would be an account whose sign-in and
 * whose receipts disagree. Membership tier is guarded by the same trigger and is
 * not offered at all; it is the console's to set.
 *
 * @typedef {{
 *   id: string,
 *   full_name: string | null,
 *   email: string | null,
 *   membership_tier: string,
 *   created_at: string,
 * }} Account
 */

/**
 * @param {string} userId
 * @returns {Promise<Account | null>}
 */
export async function fetchAccount(userId) {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name, email, membership_tier, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * @param {string} userId
 * @param {string} fullName
 */
export async function updateName(userId, fullName) {
  const name = fullName.trim();

  if (!name) {
    throw inputError('Enter the name you would like on your account.');
  }

  if (name.length > 120) {
    throw inputError('That name is longer than the field will hold.');
  }

  const { data, error } = await getSupabase()
    .from('profiles')
    .update({ full_name: name })
    .eq('id', userId)
    .select('id, full_name, email, membership_tier, created_at')
    .single();

  if (error) throw error;

  /*
    The app greets a collector from `user_metadata.full_name` when the profile
    row has not loaded yet, and the signup trigger seeds the profile from that
    same field. Leaving it stale means the new name appears everywhere except
    the first screen after opening the app.
  */
  const { error: metadataError } = await getSupabase().auth.updateUser({
    data: { full_name: name },
  });

  if (metadataError) {
    console.warn('[account] name saved, but the session metadata still has the old one:', metadataError);
  }

  return data;
}

/**
 * Begin an email change. Supabase sends a confirmation to the new address (and,
 * where the project is configured for it, the old one too); nothing moves until
 * that link is followed, so the caller must say so rather than reporting a save.
 *
 * @param {string} email
 */
export async function requestEmailChange(email) {
  const next = email.trim().toLowerCase();

  if (!next || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
    throw inputError('Enter a valid email address.');
  }

  const { error } = await getSupabase().auth.updateUser({ email: next });
  if (error) throw error;
}

/** @param {string} password */
export async function updatePassword(password) {
  if (password.length < 8) {
    throw inputError('Use at least 8 characters.');
  }

  const { error } = await getSupabase().auth.updateUser({ password });
  if (error) throw error;
}

/**
 * A refusal the collector caused, phrased for them.
 *
 * Marked by name so `errorMessage` can pass it through untouched instead of
 * running it past a list of Supabase phrasings it will never match.
 *
 * @param {string} message
 */
function inputError(message) {
  const error = new Error(message);
  error.name = 'AccountInputError';
  return error;
}
