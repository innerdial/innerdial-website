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
 * Open a membership, and hand back what checkout needs to take payment for it.
 *
 * `keyId` is the public Razorpay key, sent by the function rather than read from
 * this build's env so it always matches the secret that made the subscription.
 * `checkoutUrl` is the hosted page, kept for when the modal cannot load.
 *
 * @returns {Promise<{ status: string, checkoutUrl: string | null, subscriptionId: string, keyId: string }>}
 */
export async function startMembership() {
  return invokeBilling('create');
}

/** Cancel at the end of the period already paid for. */
export async function cancelMembership() {
  return invokeBilling('cancel');
}

/**
 * Send checkout's signed response to the billing function to be checked.
 *
 * A pass means the payment really was made against this account's subscription
 * — it does not make anyone a member. That still waits on the webhook, and the
 * page reads the row to find out.
 *
 * @param {CheckoutSuccess} response
 * @returns {Promise<{ verified: true, status: string }>}
 */
export async function verifyMembershipPayment(response) {
  return invokeBilling('verify', {
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_subscription_id: response.razorpay_subscription_id,
    razorpay_signature: response.razorpay_signature,
  });
}

/**
 * @typedef {{
 *   razorpay_payment_id: string,
 *   razorpay_subscription_id: string,
 *   razorpay_signature: string,
 * }} CheckoutSuccess
 *
 * @typedef {{ kind: 'paid', response: CheckoutSuccess }
 *   | { kind: 'dismissed' }
 *   | { kind: 'failed', message: string }} CheckoutOutcome
 */

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

/** @type {Promise<void> | null} */
let checkoutScript = null;

/**
 * Razorpay's checkout script, loaded the first time someone reaches for it.
 *
 * Not a tag in `index.html`: every page of the marketing site would fetch a
 * payment script only this button uses. A failed load is forgotten so the next
 * click tries again rather than inheriting the rejection.
 */
function loadCheckoutScript() {
  if (/** @type {any} */ (window).Razorpay) {
    return Promise.resolve();
  }

  checkoutScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      checkoutScript = null;
      reject(new Error('Razorpay checkout could not be loaded.'));
    };
    document.head.append(script);
  });

  return checkoutScript;
}

/**
 * Open Razorpay's checkout modal on a subscription, and settle once it closes.
 *
 * `payment.failed` does not close the modal — Razorpay lets the collector try
 * another card from inside it — so the most recent failure is held and
 * reported only if they then dismiss it. Resolving on the first failure would
 * show an error beside a modal that is still taking a second attempt.
 *
 * Rejects only when the script itself cannot load, which is the caller's cue to
 * fall back to the hosted checkout page.
 *
 * @param {{ keyId: string, subscriptionId: string, email?: string, color?: string }} options
 * @returns {Promise<CheckoutOutcome>}
 */
export async function openCheckout({ keyId, subscriptionId, email, color }) {
  await loadCheckoutScript();

  return new Promise((resolve) => {
    /** @type {string} */
    let lastFailure = '';

    const Razorpay = /** @type {any} */ (window).Razorpay;
    const checkout = new Razorpay({
      key: keyId,
      subscription_id: subscriptionId,
      name: 'Innerdial',
      description: 'Elite Member',
      prefill: email ? { email } : undefined,
      theme: color ? { color } : undefined,
      /** @param {CheckoutSuccess} response */
      handler: (response) => resolve({ kind: 'paid', response }),
      modal: {
        ondismiss: () =>
          resolve(lastFailure ? { kind: 'failed', message: lastFailure } : { kind: 'dismissed' }),
      },
    });

    checkout.on('payment.failed', (/** @type {any} */ event) => {
      lastFailure =
        event?.error?.description || 'The payment did not go through. Nothing has been charged.';
    });

    checkout.open();
  });
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
 * @param {'create' | 'cancel' | 'verify'} action
 * @param {Record<string, string>} [fields]  sent alongside the action; never the account
 */
async function invokeBilling(action, fields = {}) {
  const { data, error } = await getSupabase().functions.invoke('razorpay-subscription', {
    body: { ...fields, action },
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
