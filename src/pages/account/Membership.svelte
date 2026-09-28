<script>
  /**
   * The membership: what it costs, what state it is in, and what has been charged.
   *
   * The page never decides whether someone is a paying member. It opens a
   * subscription through the billing function, takes payment in Razorpay's
   * checkout modal, has the function check the signature that comes back, and
   * afterwards reads a row that only the webhook can write. That gap is
   * deliberate and is the reason for the "waiting for confirmation" state: a
   * browser returning from checkout knows the payment happened, but a browser
   * saying so is not evidence, and Razorpay's word arrives a moment later.
   */
  import { onMount } from 'svelte';

  import AccountShell from '$lib/account/AccountShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import PlanSwitch from '$lib/components/PlanSwitch.svelte';
  import { currentUser } from '$lib/auth/session.svelte.js';
  import { errorMessage } from '$lib/supabase/client.js';
  import { PLAN_FEATURES, PLAN_TRIAL_NOTE, PLANS } from '$lib/site/plan.js';
  import {
    cancelMembership,
    daysLeft,
    fetchMembership,
    formatAmount,
    formatDate,
    isLive,
    isPaid,
    openCheckout,
    startMembership,
    statusOf,
    verifyMembershipPayment,
  } from '$lib/account/subscription.js';

  /** @type {import('$lib/account/subscription.js').Subscription | null} */
  let subscription = $state(null);
  /** @type {import('$lib/account/subscription.js').Payment[]} */
  let payments = $state([]);

  let loading = $state(true);
  let error = $state('');
  let notice = $state('');
  let busy = $state('');
  let confirming = $state(false);

  /**
   * The period checkout will open on. Follows the subscription once there is
   * one, so the price quoted beside a membership is the one it is billed at.
   *
   * @type {import('$lib/site/plan.js').BillingPeriod}
   */
  let period = $state('monthly');
  const plan = $derived(PLANS[period]);

  const user = currentUser();

  const state = $derived(statusOf(subscription?.status));
  const live = $derived(isLive(subscription));
  const paid = $derived(isPaid(subscription));

  /** Paid for, but told to stop at the end of the period. */
  const leaving = $derived(paid && subscription?.cancel_at_cycle_end === true);

  /** Set up at Razorpay but never paid — the checkout link is still good. */
  const unpaid = $derived(subscription?.status === 'created' && Boolean(subscription.short_url));

  /** @type {import('$lib/account/subscription.js').Licence | null} */
  let licence = $state(null);

  /*
    A membership held by licence rather than bought — a Founder. Checked only
    when nothing is being paid: a paying member is owed their renewal date and
    cancel button, which a licence has no way to give them.
  */
  const granted = $derived(!paid && !unpaid && licence?.access === true && !licence.trial);

  /** In a trial, and not yet paying. Still offered the membership, but told the clock is running. */
  const trialing = $derived(!paid && !unpaid && licence?.trial === true);

  /*
    Never subscribed, and the trial every account starts with has run out. The
    licence no longer grants anything, but the expiry stays on the profile.
  */
  const trialEnded = $derived(
    !subscription &&
      licence?.access !== true &&
      Boolean(licence?.expiresAt) &&
      daysLeft(licence?.expiresAt ?? null) === 0,
  );

  /*
    The same names the app's `membershipBadge()` gives: the licence's own badge
    for a member — so a Founder is called one — falling back to Elite Member,
    and a trial that counts down. Other subscription states keep Razorpay's
    words, because this is the page that has to explain a failed charge.
  */
  const headline = $derived.by(() => {
    if (paid || granted) return licence?.badge ?? 'Elite Member';
    if (trialing) {
      const days = daysLeft(licence?.expiresAt ?? null);
      return `Trial · ${days} ${days === 1 ? 'day' : 'days'} left`;
    }
    if (trialEnded) return 'Trial ended';
    return live || subscription ? state.label : 'Not a member yet';
  });

  const tone = $derived(granted ? 'good' : trialing ? 'pending' : trialEnded ? 'ended' : state.tone);

  async function load() {
    try {
      const result = await fetchMembership(user.id);
      subscription = result.subscription;
      if (result.subscription?.billing_period) {
        period = result.subscription.billing_period;
      }
      payments = result.payments;
      licence = result.licence;
      error = '';
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      loading = false;
    }
  }

  onMount(load);

  /** How often, and how many times, to look for the webhook after a verified payment. */
  const CONFIRM_INTERVAL_MS = 2500;
  const CONFIRM_ATTEMPTS = 6;

  async function begin() {
    if (busy) return;

    busy = 'begin';
    error = '';
    notice = '';

    try {
      const { checkoutUrl, subscriptionId, keyId } = await startMembership(period);

      let outcome;
      try {
        if (!subscriptionId || !keyId) {
          throw new Error('The billing function returned no subscription to check out against.');
        }

        outcome = await openCheckout({
          keyId,
          subscriptionId,
          email: user.email,
          // Razorpay wants a literal colour; the token is the only source for it.
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
        });
      } catch (cause) {
        console.warn('[billing] checkout modal unavailable, using the hosted page:', cause);

        if (!checkoutUrl) {
          error = 'Razorpay checkout could not be opened. Nothing has been charged.';
          return;
        }

        // A full navigation, not a new tab: a popup is what a browser blocks.
        location.href = checkoutUrl;
        return;
      }

      if (outcome.kind === 'dismissed') {
        // The subscription now exists unpaid; reading it back offers to finish it.
        await load();
        return;
      }

      if (outcome.kind === 'failed') {
        // After the read, which clears `error` when it succeeds.
        await load();
        error = outcome.message;
        return;
      }

      busy = 'confirming';
      await verifyMembershipPayment(outcome.response);
      notice = 'Payment received. Confirming your membership with Razorpay…';
      await awaitConfirmation();
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      busy = '';
    }
  }

  /**
   * Re-read the row until the webhook has written it, for a short while.
   *
   * The signature says the money moved; the row is what says the membership is
   * live, and it lands a few seconds later. Past the last attempt the page stops
   * waiting and says so rather than spinning — the "check again" button is there.
   */
  async function awaitConfirmation() {
    for (let attempt = 0; attempt < CONFIRM_ATTEMPTS; attempt += 1) {
      await load();
      if (isPaid(subscription)) {
        notice = '';
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, CONFIRM_INTERVAL_MS));
    }

    notice =
      'Payment received. Your membership will show here as soon as Razorpay confirms it — usually within a minute.';
  }

  async function confirmCancel() {
    if (busy) return;

    busy = 'cancel';
    confirming = false;
    error = '';

    try {
      await cancelMembership();
      await load();
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      busy = '';
    }
  }

  async function refresh() {
    if (busy) return;
    busy = 'refresh';
    await load();
    busy = '';
  }
</script>

<AccountShell
  title="Membership"
  lede="What you pay, when it renews, and every charge against this account."
>
  {#if loading}
    <Loader label="Loading your membership" />
  {:else}
    {#if error}
      <Callout tone="error" message={error} />
    {:else if notice}
      <Callout tone="success" message={notice} />
    {/if}

    <section class="card status-card">
      <div class="status-head">
        <div>
          <!-- The plan's name as the app's Membership screen prints it; a granted tier is not that plan. -->
          <p class="eyebrow">{granted ? 'Membership' : 'Elite Member'}</p>
          <p class="status">
            <span class="dot {tone}" aria-hidden="true"></span>
            {headline}
          </p>
        </div>

        <!-- Nothing is charged on a granted membership, so no rate is quoted at it. -->
        {#if !granted}
          <p class="price">
            <span class="amount">{plan.price}</span>
            <span class="billing">{plan.billing}</span>
          </p>
        {/if}
      </div>

      <p class="note">
        {#if granted}
          Your membership was granted to this account, so there is nothing to pay. Everything
          Innerdial offers is open to you.
        {:else if trialing}
          Everything is open while your trial runs. Begin your membership to keep it once the trial
          ends.
        {:else if leaving}
          Cancelled. Your membership stays open until {formatDate(subscription?.current_end)} and will
          not renew after that.
        {:else if subscription}
          {state.note}
        {:else if trialEnded}
          Your collection is still here and still yours to read and export. Adding new pieces needs a
          membership.
        {:else}
          One membership with everything in it, billed monthly or yearly. Start whenever you like.
        {/if}
      </p>

      {#if paid && !leaving}
        <dl class="facts">
          <div>
            <dt>Started</dt>
            <dd>{formatDate(subscription?.current_start)}</dd>
          </div>
          <div>
            <dt>Renews</dt>
            <dd>{formatDate(subscription?.charge_at ?? subscription?.current_end)}</dd>
          </div>
        </dl>
      {/if}

      <!-- A granted membership has nothing to buy, renew or cancel here. -->
      {#if !granted}
      <!-- Only while there is still a choice to make: a paid or failing membership keeps its period. -->
      {#if unpaid || !live}
        <div class="period">
          <PlanSwitch bind:value={period} disabled={Boolean(busy)} />
        </div>
      {/if}

      <div class="actions">
        {#if unpaid}
          <Button variant="primary" onclick={begin} disabled={Boolean(busy)}>
            {busy === 'begin' ? 'Opening checkout…' : 'Complete your payment'}
          </Button>
          <Button variant="secondary" onclick={refresh} disabled={Boolean(busy)}>
            {busy === 'refresh' ? 'Checking…' : 'I have paid — check again'}
          </Button>
        {:else if paid && !leaving}
          <!--
            The confirm is a small popover on the button rather than a dialog
            over the page: cancelling a membership is a decision to slow down,
            not an interruption to clear out of the way.
          -->
          <div class="confirm-anchor">
            <Button variant="danger" onclick={() => (confirming = !confirming)} disabled={Boolean(busy)}>
              {busy === 'cancel' ? 'Cancelling…' : 'Cancel membership'}
            </Button>

            {#if confirming}
              <div class="confirm" role="dialog" aria-label="Confirm cancellation">
                <p>
                  Your membership stays open until
                  {formatDate(subscription?.current_end)} and will not renew.
                </p>
                <div class="confirm-actions">
                  <Button variant="ghost" size="sm" onclick={() => (confirming = false)}>
                    Keep it
                  </Button>
                  <Button variant="danger" size="sm" onclick={confirmCancel}>Cancel it</Button>
                </div>
              </div>
            {/if}
          </div>
        {:else if !live}
          <Button variant="primary" onclick={begin} disabled={Boolean(busy)}>
            {busy === 'begin' ? 'Opening checkout…' : 'Begin your membership'}
          </Button>
        {:else}
          <Button variant="secondary" onclick={refresh} disabled={Boolean(busy)}>
            {busy === 'refresh' ? 'Checking…' : 'Check for an update'}
          </Button>
        {/if}
      </div>
      {/if}

      <!-- The trial is offered only to someone who has not had it: a running one counts down above, a spent one is over. -->
      {#if !subscription && !granted && !trialing && !trialEnded}
        <p class="fine">{PLAN_TRIAL_NOTE}</p>
      {/if}
    </section>

    {#if !paid && !granted}
      <section class="card">
        <h2>What is included</h2>
        <ul class="features">
          {#each PLAN_FEATURES as feature (feature.id)}
            <li>
              <strong>{feature.label}</strong>
              <span>{feature.detail}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <section class="card">
      <h2>Payments</h2>

      {#if payments.length === 0}
        <p class="note empty">Nothing has been charged to this account yet.</p>
      {:else}
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Amount</th>
                <th scope="col">Method</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {#each payments as payment (payment.id)}
                <tr>
                  <td>{formatDate(payment.paid_at)}</td>
                  <td>{formatAmount(payment.amount_minor, payment.currency)}</td>
                  <td class="muted">{payment.method ?? '—'}</td>
                  <td class="muted">{payment.status}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  {/if}
</AccountShell>

<style>
  .card {
    padding: var(--space-xl);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background);
    box-shadow: 0 1px 2px rgb(14 27 44 / 5%), 0 2px 10px rgb(14 27 44 / 4%);
  }

  .card + .card,
  :global(.callout) + .card {
    margin-top: var(--space-lg);
  }

  .status-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
  }

  .eyebrow {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: var(--space-xs) 0 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  /* The one place the status is a colour rather than a word — the word is
     always beside it, so the colour is never carrying the meaning alone. */
  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--color-text-muted);
  }

  .dot.good {
    background: #2f7a4d;
  }

  .dot.pending {
    background: var(--color-primary);
  }

  .dot.warn {
    background: #b4762a;
  }

  .dot.ended {
    background: #9a9a95;
  }

  .period {
    margin-top: var(--space-lg);
  }

  .period + .actions {
    margin-top: var(--space-md);
  }

  .price {
    margin: 0;
    text-align: right;
    white-space: nowrap;
  }

  .price .amount {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .price .billing {
    margin-left: 0.2rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .note {
    max-width: 38rem;
    margin: var(--space-md) 0 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-text-muted);
  }

  .note.empty {
    margin-top: var(--space-sm);
  }

  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xl);
    margin: var(--space-lg) 0 0;
  }

  .facts dt {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .facts dd {
    margin: var(--space-xs) 0 0;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--color-ink);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
  }

  .fine {
    margin: var(--space-md) 0 0;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  /* ------------------------------------------------------------- confirm */

  .confirm-anchor {
    position: relative;
  }

  .confirm {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    z-index: 5;
    width: max-content;
    max-width: min(20rem, calc(100vw - 3rem));
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    box-shadow: 0 4px 12px rgb(14 27 44 / 10%), 0 20px 44px rgb(14 27 44 / 14%);
  }

  .confirm p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text);
  }

  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-xs);
    margin-top: var(--space-md);
  }

  /* ------------------------------------------------------------- content */

  h2 {
    margin: 0 0 var(--space-md);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .features {
    display: grid;
    gap: var(--space-md);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .features li {
    display: grid;
    gap: 0.15rem;
    padding-left: var(--space-md);
    border-left: 2px solid var(--color-primary);
  }

  .features strong {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .features span {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  /* A payment list is four short columns, but a narrow phone still wants the
     table to scroll rather than the page. */
  .table-scroll {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th {
    padding: 0 var(--space-md) var(--space-sm) 0;
    border-bottom: 1px solid var(--color-border);
    text-align: left;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  td {
    padding: var(--space-sm) var(--space-md) var(--space-sm) 0;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  td.muted {
    color: var(--color-text-muted);
    text-transform: capitalize;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
</style>
