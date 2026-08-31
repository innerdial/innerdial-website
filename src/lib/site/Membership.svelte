<script>
  import { PLAN_BILLING, PLAN_FEATURES, PLAN_PRICE } from '$lib/site/plan.js';
  import Backdrop from '$lib/site/Backdrop.svelte';
  import { reveal } from '$lib/site/motion.js';

  /**
   * The offer, and the reasons to trust it.
   *
   * Deliberately not a testimonial wall. Innerdial has not shipped publicly
   * yet, and invented quotes over invented names are a fabricated review
   * whatever the intent — so this section is built from terms that are
   * verifiable instead: the price the app itself quotes, the refund window, the
   * export guarantee, the fact that there is no marketplace to sell your data
   * to. When there are real collectors to quote, a testimonial rail belongs
   * directly beneath the guarantees.
   */

  const GUARANTEES = [
    { id: 'refund', label: '30-day full refund', note: 'No conditions and no interview.' },
    { id: 'locked', label: 'Price locked for life', note: 'Founding rate, held while you stay.' },
    { id: 'export', label: 'Export anytime', note: 'Spreadsheet plus every file attached.' },
    { id: 'erase', label: 'Erase for real', note: 'Account and contents, gone on request.' },
  ];
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
      <article class="plan sweep-border" use:reveal={{ variant: 'scale', index: 2 }}>
        <span class="plan-glow" aria-hidden="true"></span>

        <header class="plan-head">
          <p class="plan-tier">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 2.5l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.33l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.95L12 2.5z"
              />
            </svg>
            Founding member
          </p>

          <p class="plan-price">
            <span class="amount">{PLAN_PRICE}</span>
            <span class="billing">{PLAN_BILLING}</span>
          </p>
        </header>

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

        <a class="btn btn-primary plan-cta" href="#top">Begin your collection</a>

        <p class="plan-note">
          Cancel from inside the app. Your export goes with you.
        </p>
      </article>
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
    justify-content: center;
  }

  .plan {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    overflow: hidden;
    width: min(100%, 27rem);
    padding: clamp(1.5rem, 3vw, 2.25rem);
    border-radius: var(--radius-lg);
    /* Border and fill both come from `.sweep-border` in site.css — it paints
       them as one pair and setting either here would break the other. */
    --sweep-fill: var(--paper);
    box-shadow: var(--shadow-lg);
    isolation: isolate;
  }

  /* A brass wash from the top corner — the card should read as the one thing
     on the page being offered, without a coloured border shouting it. */
  .plan-glow {
    position: absolute;
    top: -40%;
    right: -30%;
    z-index: -1;
    width: 26rem;
    height: 26rem;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(184 147 90 / 16%) 0%, transparent 66%);
    pointer-events: none;
  }

  .plan-head {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .plan-tier {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
    padding: 0.35rem 0.75rem;
    border: 1px solid var(--color-primary);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-primary);
  }

  .plan-tier svg {
    width: 0.6875rem;
    height: 0.6875rem;
  }

  .plan-price {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    margin: 0;
  }

  .amount {
    font-family: var(--font-display);
    font-size: clamp(3rem, 6vw, 4rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--color-ink);
  }

  .billing {
    font-size: 0.9375rem;
    color: var(--color-text-muted);
  }

  .plan-features {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin: 0;
    padding: var(--space-lg) 0 0;
    border-top: 1px solid var(--color-border);
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
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .feature-body span {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .plan-column :global(.plan-cta) {
    width: 100%;
  }

  .plan-note {
    margin: -0.5rem 0 0;
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
