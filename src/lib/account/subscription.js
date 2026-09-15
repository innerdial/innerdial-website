import { getSupabase } from '$lib/supabase/client.js';

/**
 * The membership, as the account page needs to talk about it.
 *
 * Reading is a plain select — the row policy already limits it to the caller's
 * own subscription. Writing is not offered, because there is no write policy to
 * offer it against: opening and cancelling both go through the
 * `razorpay-subscription` edge function, which is the only party holding the
 * Razorpay secret, and the status that comes back afterwards is written by the
 * webhook rather than by this browser saying so.
 *
 * @typedef {{
 *   id: string,
 *   status: string,
 *   provider_subscription_id: string,
 *   short_url: string | null,
 *   current_start: string | null,
 *   current_end: string | null,
 *   charge_at: string | null,
 *   ended_at: string | null,
 *   cancel_at_cycle_end: boolean,
 *   created_at: string,
 * }} Subscription
 *
 * @typedef {{
 *   id: string,
 *   provider_payment_id: string,
 *   amount_minor: number,
 *   currency: string,
 *   status: string,
 *   method: string | null,
 *   paid_at: string | null,
 * }} Payment
 */

const SUBSCRIPTION_COLUMNS =
  'id, status, provider_subscription_id, short_url, current_start, current_end, charge_at, ended_at, cancel_at_cycle_end, created_at';

/** Razorpay's statuses, and what each one means for someone reading their account page. */
const STATES = {
  created: {
    label: 'Awaiting payment',
    tone: 'pending',
    note: 'Your membership is set up but has not been paid for yet.',
  },
  authenticated: {
    label: 'Confirmed',
    tone: 'pending',
    note: 'Your mandate is approved. The first charge is on its way.',
  },
  active: {
    label: 'Active',
    tone: 'good',
    note: 'Your membership is live.',
  },
  pending: {
    label: 'Payment failed',
    tone: 'warn',
    note: 'The last charge did not go through. Razorpay will try again.',
  },
  halted: {
    label: 'Halted',
    tone: 'warn',
    note: 'Repeated charges failed and billing has stopped. Start again to resume.',
  },
  cancelled: {
    label: 'Cancelled',
    tone: 'ended',
    note: 'This membership has been cancelled.',
  },
  completed: {
    label: 'Completed',
    tone: 'ended',
    note: 'This membership ran its full term.',
  },
  expired: {
    label: 'Expired',
    tone: 'ended',
    note: 'This membership expired without being renewed.',
  },
};

/** Statuses in which there is a membership in flight, matching the partial unique index. */
const LIVE = new Set(['created', 'authenticated', 'active', 'pending']);

/** @param {string | null | undefined} status */
export function statusOf(status) {
  return (
    STATES[/** @type {keyof STATES} */ (status ?? '')] ?? {
      label: status || 'Unknown',
      tone: 'ended',
      note: '',
    }
  );
}

/** @param {Subscription | null} subscription */
export function isLive(subscription) {
  return Boolean(subscription && LIVE.has(subscription.status));
}

/** Whether the collector is paid up right now, whatever happens at the next renewal. */
export function isPaid(subscription) {
  return Boolean(subscription && (subscription.status === 'active' || subscription.status === 'authenticated'));
}

/**
 * The membership to show, and what has been charged for it.
 *
 * The newest row, not the live one: a collector whose subscription ended still
 * needs to see that it ended, and be offered a new one. `isLive` is what the
 * page uses to decide which of those it is looking at.
 *
 * The licence is read alongside it, because a subscription is not the only way
 * in. A Founder is granted from the admin console and never goes near Razorpay,
 * and a page that read only `subscriptions` offered them a checkout for the
 * membership they already hold. `effective_features` is the same function the
 * app's gate and the RLS policy on `watches` call, so this page cannot come to a
 * different conclusion from either about who is a member.
 *
 * @param {string} userId
 * @returns {Promise<{ subscription: Subscription | null, payments: Payment[], licence: Licence }>}
 */
export async function fetchMembership(userId) {
  const supabase = getSupabase();

  const [
    { data: subscription, error },
    { data: featureMap, error: featureError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase
      .from('subscriptions')
      .select(SUBSCRIPTION_COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.rpc('effective_features'),
    // The expiry belongs to this collector's grant, not to the licence itself.
    supabase.from('profiles').select('license_expires_at').eq('id', userId).maybeSingle(),
  ]);

  if (error) throw error;
  if (featureError) throw featureError;
  if (profileError) throw profileError;

  const licence = toLicence(featureMap, profile?.license_expires_at ?? null);

  if (!subscription) {
    return { subscription: null, payments: [], licence };
  }

  const { data: payments, error: paymentsError } = await supabase
    .from('subscription_payments')
    .select('id, provider_payment_id, amount_minor, currency, status, method, paid_at')
    .eq('subscription_id', subscription.id)
    .order('paid_at', { ascending: false, nullsFirst: false });

  if (paymentsError) throw paymentsError;

  return { subscription, payments: payments ?? [], licence };
}

/**
 * What the collector's licence says about their membership.
 *
 * `access` is absent rather than false on the free tier, so only `true` counts.
 * A trial grants access too, and is kept apart so it is never called a
 * membership.
 *
 * @typedef {{ access: boolean, trial: boolean, badge: string | null, expiresAt: string | null }} Licence
 *
 * @param {unknown} featureMap
 * @param {string | null} expiresAt
 * @returns {Licence}
 */
function toLicence(featureMap, expiresAt) {
  const map = /** @type {Record<string, unknown>} */ (featureMap ?? {});
  const badge = map['membership.badge'];

  return {
    access: map['membership.access'] === true,
    trial: map['membership.trial'] === true,
    badge: typeof badge === 'string' && badge ? badge : null,
    expiresAt,
  };
}

/**
 * Whole days left on a licence that expires, rounded up so the last day reads
 * "1 day left"; zero once it has run out or when it never expires.
 *
 * @param {string | null} expiresAt
 */
export function daysLeft(expiresAt) {
  const ends = expiresAt ? Date.parse(expiresAt) : Number.NaN;
  if (Number.isNaN(ends)) return 0;

  const remaining = ends - Date.now();
  return remaining > 0 ? Math.ceil(remaining / (24 * 60 * 60 * 1000)) : 0;
}

/**
 * Open a membership, and hand back the checkout page to send the collector to.
 *
 * @returns {Promise<{ status: string, checkoutUrl: string | null }>}
 */
export async function startMembership() {
  return invokeBilling('create');
}

/** Cancel at the end of the period already paid for. */
export async function cancelMembership() {
  return invokeBilling('cancel');
}

/**
 * Call the billing function and surface what it actually said.
 *
 * `functions.invoke` reports a non-2xx as a `FunctionsHttpError` whose message
 * is only ever "Edge Function returned a non-2xx status code" — the reason is
 * in the response body it carries on `context`. Without reading that, every
 * refusal from Razorpay ("International cards are not supported", "This account
 * already holds a membership") reaches the collector as the same empty sentence.
 *
 * @param {'create' | 'cancel'} action
 */
async function invokeBilling(action) {
  const { data, error } = await getSupabase().functions.invoke('razorpay-subscription', {
    body: { action },
  });

  if (!error) {
    return data;
  }

  const response = /** @type {any} */ (error).context;

  if (response && typeof response.json === 'function') {
    try {
      const body = await response.json();
      if (body?.error) {
        throw billingError(body.error);
      }
    } catch (cause) {
      if (/** @type {any} */ (cause)?.name === 'AccountInputError') {
        throw cause;
      }
      // The body was not JSON, or was already consumed. Fall through to the
      // generic message rather than reporting a parse failure to a collector.
    }
  }

  throw billingError(
    'Billing is unavailable right now. Nothing has been charged — try again in a moment.',
  );
}

/**
 * Reuses the marker `errorMessage` already passes through untouched, so a
 * sentence written here for a collector is not rewritten as a Supabase one.
 *
 * @param {string} message
 */
function billingError(message) {
  const error = new Error(message);
  error.name = 'AccountInputError';
  return error;
}

/**
 * @param {number} amountMinor  paise, as Razorpay reports it
 * @param {string} currency
 */
export function formatAmount(amountMinor, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
  }).format(amountMinor / 100);
}

/** @param {string | null | undefined} iso */
export function formatDate(iso) {
  if (!iso) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
