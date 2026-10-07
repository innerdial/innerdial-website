<script>
  import { onMount } from 'svelte';

  import { PLAN_FEATURES, PLAN_LIST } from '$lib/site/plan.js';
  import Backdrop from '$lib/site/Backdrop.svelte';
  import { reveal } from '$lib/site/motion.js';
  import { hasSessionHint } from '$lib/site/session-hint.js';

  /**
   * The offer, and the reasons to trust it.
   *
   * Deliberately not a testimonial wall. Innerdial has not shipped publicly
   * yet, and invented quotes over invented names are a fabricated review
   * whatever the intent — so this section is built from terms that are
   * verifiable instead: the price the app itself quotes, the trial every account starts with, the
   * export guarantee, the fact that there is no marketplace to sell your data
   * to. When there are real collectors to quote, a testimonial rail belongs
   * directly beneath the guarantees.
   */

  const GUARANTEES = [
    { id: 'trial', label: '14-day free trial', note: 'Every feature, and no card to start.' },
    { id: 'locked', label: 'Price locked for life', note: 'Founding rate, held while you stay.' },
    { id: 'export', label: 'Export anytime', note: 'Spreadsheet plus every file attached.' },
    { id: 'erase', label: 'Erase for real', note: 'Account and contents, gone on request.' },
  ];

  /*
    Each card leads to checkout on the account's membership page, carrying the
    plan that was clicked so it opens already chosen. Signed out, it goes via
    sign-in, which returns there afterwards. Starts on the sign-in route: a
    signed-in visitor sent there is forwarded on, so the first render is safe
    before storage can be read.
  */
  let signedIn = $state(false);

  onMount(() => {
    signedIn = hasSessionHint();
  });

  /** @param {import('$lib/site/plan.js').BillingPeriod} period */
  function checkoutHref(period) {
    const target = `/account/membership?plan=${period}`;
    return signedIn ? target : `/login?next=${encodeURIComponent(target)}`;
  }
</script>

<section class="membership" id="membership" aria-labelledby="membership-heading">
  <Backdrop tone="light" glow="right" fade="radial" cell={64} />

  <div class="shell inner">
    <div class="copy">
      <p class="eyebrow" use:reveal={{ variant: 'fade' }}>Founding membership</p>

      <h2 id="membership-heading" use:reveal={{ variant: 'up', index: 1 }}>
        One rate. Everything in it. <span class="accent">Held for life.</span>
      </h2>

      <p class="lede" use:reveal={{ variant: 'up', index: 2 }}>
        There is no free tier that caps your collection at ten pieces, and no
        upgrade that unlocks the feature you actually needed. Founding members
        get the whole app, and the rate they join at, for as long as they stay.
      </p>

      <ul class="guarantees">
        {#each GUARANTEES as item, i (item.id)}
          <li use:reveal={{ variant: 'left', index: 3 + i }}>
            <span class="seal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="guarantee-body">
              <strong>{item.label}</strong>
              <span>{item.note}</span>
            </span>
          </li>
        {/each}
      </ul>
    </div>

    <div class="plan-column">
      <!--
        Both plans in view at once, rather than one behind a switch: the yearly
        saving is the reason to choose it, and a saving nobody sees until they
        click is no reason at all. Yearly carries the emphasis because it is
        the better deal, not because it is the default.
      -->
      <div class="plans">
        {#each PLAN_LIST as plan, i (plan.id)}
          {@const featured = plan.saving !== null}
          <article
            class="plan"
            class:featured
            class:sweep-border={featured}
            aria-labelledby="plan-{plan.id}"
            use:reveal={{ variant: 'scale', index: 2 + i }}
          >
            {#if featured}
              <span class="plan-glow" aria-hidden="true"></span>
            {/if}

            <header class="plan-head">
              <h3 class="plan-name" id="plan-{plan.id}">{plan.label}</h3>
              {#if plan.saving}
                <span class="plan-saving">{plan.saving}</span>
              {/if}
            </header>

            <p class="plan-price">
              <span class="amount">{plan.price}</span>
              <span class="billing">{plan.billing}</span>
            </p>

            <p class="plan-billed">{plan.note}</p>

            <a class="btn {featured ? 'btn-primary' : 'btn-secondary'} plan-cta" href={checkoutHref(plan.id)}>
              Begin your collection
            </a>
          </article>
        {/each}
      </div>

      <div class="included" use:reveal={{ variant: 'up', index: 4 }}>
        <p class="included-title">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 2.5l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.33l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.95L12 2.5z"
            />
          </svg>
          Founding member · both plans include
        </p>

        <ul class="plan-features">
          {#each PLAN_FEATURES as feature (feature.id)}
            <li>
              <span class="mark" aria-hidden="true"></span>
              <span class="feature-body">
                <strong>{feature.label}</strong>
                <span>{feature.detail}</span>
              </span>
            </li>
          {/each}
        </ul>

        <p class="plan-note">Cancel from inside the app. Your export goes with you.</p>
      </div>
    </div>
  </div>
</section>

<style>
  .membership {
    position: relative;
    padding: var(--section-y) 0;
    background: var(--paper-warm);
  }

  .inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
    align-items: center;
    gap: clamp(2.5rem, 6vw, 5rem);
  }

  .copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .copy h2 {
    margin: var(--space-xs) 0 0;
    font-size: clamp(2rem, 4.2vw, 3.25rem);
    line-height: 1.06;
  }

  .guarantees {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: var(--space-md);
    margin: var(--space-md) 0 0;
    padding: 0;
    list-style: none;
  }

  .guarantees li {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
  }

  .seal {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 1.375rem;
    height: 1.375rem;
    margin-top: 0.1rem;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
  }

  .seal svg {
    width: 0.8125rem;
    height: 0.8125rem;
  }

  .guarantee-body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .guarantee-body strong {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .guarantee-body span {
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--color-text-muted);
  }

  /* ----------------------------------------------------------------- plan */

  .plan-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    width: min(100%, 34rem);
    justify-self: center;
  }

  .plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13.5rem), 1fr));
    gap: var(--space-md);
  }

  .plan {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    overflow: hidden;
    padding: clamp(1.25rem, 2.5vw, 1.75rem);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    isolation: isolate;
  }

  /* Border and fill both come from `.sweep-border` in site.css on the featured
     card — it paints them as one pair, and a scoped rule setting either here
     would out-rank it and break the effect. So only the plain card sets them. */
  .plan:not(.featured) {
    border: 1px solid var(--color-border);
    background: var(--paper);
  }

  .plan.featured {
    --sweep-fill: var(--paper);
    box-shadow: var(--shadow-lg);
  }

  /* A brass wash from the top corner — the featured card should read as the
     one being recommended, without a coloured border shouting it. */
  .plan-glow {
    position: absolute;
    top: -50%;
    right: -45%;
    z-index: -1;
    width: 20rem;
    height: 20rem;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(184 147 90 / 16%) 0%, transparent 66%);
    pointer-events: none;
  }

  .plan-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xs);
  }

  .plan-name {
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .featured .plan-name {
    color: var(--color-primary);
  }

  .plan-saving {
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    background: var(--color-primary);
    font-size: 0.6875rem;
    font-weight: 600;
    color: #fff;
  }

  .plan-price {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem;
    margin: var(--space-xs) 0 0;
  }

  .amount {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 4.5vw, 3rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--color-ink);
  }

  .billing {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .plan-billed {
    flex: 1;
    margin: 0 0 var(--space-sm);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .plan :global(.plan-cta) {
    width: 100%;
  }

  /* ------------------------------------------------------------- included */

  .included {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: clamp(1.25rem, 2.5vw, 1.75rem);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--paper);
  }

  .included-title {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-primary);
  }

  .included-title svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .plan-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: var(--space-md);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .plan-features li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .mark {
    flex: 0 0 auto;
    width: 0.4375rem;
    height: 0.4375rem;
    margin-top: 0.45rem;
    border-radius: 50%;
    background: var(--color-primary);
  }

  .feature-body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .feature-body strong {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .feature-body span {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .plan-note {
    margin: 0;
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
    text-align: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  @media (max-width: 62rem) {
    .inner {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
