import { getSupabase } from '$lib/supabase/client.js';

/**
 * Permanently delete the signed-in account.
 *
 * Goes through the `delete-account` edge function rather than an RPC, because
 * deletion has to stop a Razorpay mandate first and only that runtime holds the
 * Razorpay secret. The account comes from the session's JWT; there is nothing to
 * pass and nothing a caller could pass to name somebody else.
 *
 * @returns {Promise<void>}
 */
export async function deleteAccount() {
  const { error } = await getSupabase().functions.invoke('delete-account', { body: {} });

  if (!error) {
    return;
  }

  // Same reason as `invokeBilling`: the function's own sentence is in the
  // response body, and the error message is only ever "non-2xx status code".
  const response = /** @type {any} */ (error).context;
  let reason = '';

  if (response && typeof response.json === 'function') {
    try {
      const body = await response.json();
      reason = typeof body?.error === 'string' ? body.error : '';
    } catch (cause) {
      console.warn('[account] delete-account answered without a readable body:', cause);
    }
  }

  throw inputError(
    reason || 'Your account could not be deleted right now. Nothing was removed — try again.',
  );
}

/**
 * The marker `errorMessage` passes through untouched.
 *
 * @param {string} message
 */
function inputError(message) {
  const error = new Error(message);
  error.name = 'AccountInputError';
  return error;
}
