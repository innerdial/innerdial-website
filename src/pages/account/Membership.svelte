<script>
  /**
   * The membership: what it costs, what state it is in, and what has been charged.
   *
   * The page never decides whether someone is a paying member. It opens a
   * subscription through the billing function, sends the collector to Razorpay,
   * and afterwards reads a row that only the webhook can write. That gap is
   * deliberate and is the reason for the "waiting for confirmation" state: a
   * browser returning from checkout knows the payment happened, but a browser
   * saying so is not evidence, and Razorpay's word arrives a moment later.
   */
  import { onMount } from 'svelte';

  import AccountShell from '$lib/account/AccountShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import { currentUser } from '$lib/auth/session.svelte.js';
  import { errorMessage } from '$lib/supabase/client.js';
  import { PLAN_BILLING, PLAN_FEATURES, PLAN_PRICE, PLAN_REFUND_NOTE } from '$lib/site/plan.js';
  import {
    cancelMembership,
    fetchMembership,
    formatAmount,
    formatDate,
    isLive,
    isPaid,
    startMembership,
    statusOf,
  } from '$lib/account/subscription.js';

  /** @type {import('$lib/account/subscription.js').Subscription | null} */
  let subscription = $state(null);
  /** @type {import('$lib/account/subscription.js').Payment[]} */
  let payments = $state([]);

  let loading = $state(true);
  let error = $state('');
  let busy = $state('');
  let confirming = $state(false);

  const user = currentUser();

  const state = $derived(statusOf(subscription?.status));
  const live = $derived(isLive(subscription));
  const paid = $derived(isPaid(subscription));

  /** Paid for, but told to stop at the end of the period. */
  const leaving = $derived(paid && subscription?.cancel_at_cycle_end === true);

  /** Set up at Razorpay but never paid — the checkout link is still good. */
  const unpaid = $derived(subscription?.status === 'created' && Boolean(subscription.short_url));

  async function load() {
    try {
      const result = await fetchMembership(user.id);
      subscription = result.subscription;
      payments = result.payments;
      error = '';
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      loading = false;
    }
  }

  onMount(load);

  async function begin() {
    if (busy) return;

    busy = 'begin';
    error = '';

    try {
      const { checkoutUrl } = await startMembership();

      if (!checkoutUrl) {
        error = 'Razorpay did not return a checkout page. Nothing has been charged.';
        busy = '';
        return;
      }

      // A full navigation, not a new tab: Razorpay's hosted checkout is the
      // rest of this flow, and a popup is what a browser blocks.
      location.href = checkoutUrl;
    } catch (cause) {
      error = errorMessage(cause);
      busy = '';
    }
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
    {/if}

    <section class="card status-card">
      <div class="status-head">
        <div>
          <p class="eyebrow">Founding membership</p>
          <p class="status">
            <span class="dot {state.tone}" aria-hidden="true"></span>
            {live || subscription ? state.label : 'Not a member yet'}
          </p>
        </div>

        <p class="price">
          <span class="amount">{PLAN_PRICE}</span>
          <span class="billing">{PLAN_BILLING}</span>
        </p>
      </div>

      <p class="note">
        {#if leaving}
          Cancelled. Your membership stays open until {formatDate(subscription?.current_end)} and will
          not renew after that.
        {:else if subscription}
          {state.note}
        {:else}
          Innerdial is one rate with everything in it. Start whenever you like — the first 30 days
          are refundable in full.
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

      {#if !subscription}
        <p class="fine">{PLAN_REFUND_NOTE}</p>
      {/if}
    </section>

    {#if !paid}
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
