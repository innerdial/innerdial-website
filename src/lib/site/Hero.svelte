<script>
  import AppFrame from '$lib/site/AppFrame.svelte';
  import AppScreen from '$lib/site/AppScreen.svelte';
  import DialMotif from '$lib/site/DialMotif.svelte';
  import { PLAN_BILLING, PLAN_PRICE } from '$lib/site/plan.js';
  import { reveal, tilt } from '$lib/site/motion.js';

  /**
   * The opening statement.
   *
   * Ink ground, because the app's own accent surfaces — the nav pill, the
   * primary CTA — are ink, and opening on the colour the product uses for
   * emphasis says more about the brand than a white page would.
   *
   * The headline reveals a line at a time from behind its own baseline, the
   * device leans toward the pointer, and three cards drawn from real app
   * surfaces drift around it. Everything is a transform or an opacity, so the
   * whole hero composites without touching layout.
   */

  /** The three cards orbiting the device — each one a real app surface. */
  const ORBIT = [
    { id: 'service', side: 'left', label: 'Service due', value: 'Speedmaster · 21 days' },
    { id: 'papers', side: 'right', label: 'Papers filed', value: 'Warranty · Invoice · Receipt' },
    { id: 'wears', side: 'left', label: 'Worn this year', value: '214 days logged' },
  ];
</script>

<section class="hero on-ink" id="top" aria-labelledby="hero-heading">
  <div class="ground" aria-hidden="true">
    <span class="motif"><DialMotif opacity={0.14} /></span>
    <span class="bloom"></span>
    <span class="grain"></span>
  </div>

  <div class="inner shell">
    <div class="copy">
      <p class="eyebrow" use:reveal={{ variant: 'fade', index: 0 }}>For the serious collector</p>

      <!-- The reveal sits on the clipping line, not on the text inside it —
           see the clip note in site.css. -->
      <h1 id="hero-heading" class="headline">
        <span class="reveal-line" use:reveal={{ variant: 'clip', index: 1 }}>
          <span>The <em class="accent">record</em></span>
        </span>
        <span class="reveal-line" use:reveal={{ variant: 'clip', index: 2 }}>
          <span>your watches</span>
        </span>
        <span class="reveal-line" use:reveal={{ variant: 'clip', index: 3 }}>
          <span>never had.</span>
        </span>
      </h1>

      <p class="lede" use:reveal={{ variant: 'up', index: 5 }}>
        Serials, papers, provenance, service history and every day on the wrist — one
        private vault for the collection you have spent a lifetime assembling.
      </p>

      <div class="actions" use:reveal={{ variant: 'up', index: 6 }}>
        <a class="btn btn-primary" href="#membership">Begin your collection</a>
        <a class="btn btn-secondary" href="#vault">
          See how it works
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 5v14m0 0l-6-6m6 6l6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>

      <ul class="trust" use:reveal={{ variant: 'fade', index: 7 }}>
        <li><strong>{PLAN_PRICE}</strong>{PLAN_BILLING}</li>
        <li>30-day full refund</li>
        <li>Export your data anytime</li>
      </ul>
    </div>

    <div class="stage" use:reveal={{ variant: 'blur', index: 4 }}>
      <div class="device" use:tilt={{ strength: 7 }} data-parallax>
        <AppFrame glow label="The Innerdial dashboard: greeting, watchmaker's note, wear log, timeline and a service reminder">
          <AppScreen screen="dashboard" />
        </AppFrame>
      </div>

      {#each ORBIT as card, i (card.id)}
        <div class="orbit" data-side={card.side} data-card={card.id} style="--orbit-i: {i}">
          <span class="orbit-label">{card.label}</span>
          <span class="orbit-value">{card.value}</span>
        </div>
      {/each}
    </div>
  </div>

  <a class="scroll-cue" href="#vault" aria-label="Scroll to what Innerdial holds">
    <span class="cue-rail"><span class="cue-dot"></span></span>
  </a>
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    /* Tall enough to command the screen, capped so a 4K display does not open
       on a field of empty ink. */
    min-height: min(100svh, 60rem);
    padding: clamp(7rem, 14vh, 11rem) 0 clamp(4rem, 9vh, 7rem);
    background: linear-gradient(168deg, var(--ink-700) 0%, var(--ink-800) 46%, var(--ink-900) 100%);
    isolation: isolate;
  }

  .ground {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .motif {
    position: absolute;
    top: 50%;
    left: 62%;
    display: block;
    width: min(140vh, 72rem);
    aspect-ratio: 1;
    color: var(--brass-300);
    transform: translate(-50%, -50%);
  }

  .bloom {
    position: absolute;
    top: -20%;
    left: 46%;
    width: 70rem;
    height: 70rem;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(184 147 90 / 20%) 0%,
      rgb(184 147 90 / 7%) 38%,
      transparent 66%
    );
    filter: blur(20px);
    transform: translateX(-50%);
  }

  /*
    A very fine tonal noise. Large flat fields of ink band badly on 8-bit
    panels, and a little grain breaks the gradient up without reading as
    texture. Drawn as an SVG data URI so it costs no request.
  */
  .grain {
    position: absolute;
    inset: 0;
    opacity: 0.5;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E");
  }

  .inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    align-items: center;
    gap: clamp(2rem, 5vw, 4.5rem);
  }

  .copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-lg);
  }

  .headline {
    margin: 0;
    /* The display serif carries the whole hero, so it is allowed to get large.
       1.5rem at the floor keeps three lines readable on a 320px screen. */
    font-size: clamp(2.75rem, 6.4vw, 5.25rem);
    line-height: 1.02;
    letter-spacing: -0.028em;
  }

  .headline .reveal-line {
    /* Each line is its own mask, so the three wipe in sequence rather than the
       block sliding as one. */
    display: block;
  }

  .headline em {
    font-style: italic;
  }

  .lede {
    margin: 0;
    max-width: 32rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .actions svg {
    width: 1rem;
    height: 1rem;
    transition: transform 300ms var(--ease-out);
  }

  /* One global sequence: `:global()` may open or close a selector, never sit
     in the middle of one. */
  .actions :global(.btn-secondary:hover svg) {
    transform: translateY(3px);
  }

  .trust {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem var(--space-md);
    margin: var(--space-xs) 0 0;
    padding: 0;
    list-style: none;
    font-size: 0.8125rem;
    color: rgb(255 255 255 / 52%);
  }

  .trust li {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  /* A hairline between items instead of a bullet — quieter, and it disappears
     cleanly when the list wraps. */
  .trust li + li::before {
    content: '';
    width: 1px;
    height: 0.75rem;
    background: rgb(255 255 255 / 18%);
  }

  .trust strong {
    font-weight: 600;
    color: var(--brass-300);
  }

  /* ---------------------------------------------------------------- stage */

  .stage {
    position: relative;
    display: flex;
    justify-content: center;
  }

  .device {
    position: relative;
    z-index: 1;
    width: min(100%, 20.5rem);
    --parallax-from: 2.5rem;
    --parallax-to: -2.5rem;
  }

  .orbit {
    position: absolute;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.7rem 0.95rem;
    border: 1px solid rgb(184 147 90 / 30%);
    border-radius: var(--radius-md);
    /*
      Solid ink, not frosted glass. These cards cross the device's edge, and a
      translucent white panel over a white app screen loses its own border and
      reads as a smudge on the mockup. Ink separates cleanly from both grounds.
    */
    background: rgb(10 18 30 / 94%);
    backdrop-filter: blur(6px);
    box-shadow: 0 16px 40px rgb(7 15 25 / 55%);
    white-space: nowrap;
  }

  .orbit-label {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--brass-300);
  }

  .orbit-value {
    font-size: 0.8125rem;
    color: #fff;
  }

  /*
    Placed to cross the device's edge rather than its middle: each card sits
    mostly outside the silhouette and clips a bezel, so the mockup's own
    content stays readable behind them.
  */
  .orbit[data-card='service'] {
    top: 7%;
    left: -16%;
  }

  .orbit[data-card='papers'] {
    top: 46%;
    right: -16%;
  }

  .orbit[data-card='wears'] {
    bottom: 11%;
    left: -12%;
  }

  /*
    The drift. Each card gets the same 9s cycle offset by its index, so the
    three never travel together and the group never resolves into a pattern.
  */
  @media (prefers-reduced-motion: no-preference) {
    .orbit {
      animation: orbit-float 9s ease-in-out infinite;
      animation-delay: calc(var(--orbit-i) * -3s);
    }
  }

  @keyframes orbit-float {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -0.75rem, 0);
    }
  }

  /* ------------------------------------------------------------ scroll cue */

  .scroll-cue {
    position: absolute;
    bottom: clamp(1.25rem, 3vh, 2.25rem);
    left: 50%;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    transform: translateX(-50%);
  }

  .cue-rail {
    display: block;
    width: 1px;
    height: 2.25rem;
    background: linear-gradient(rgb(255 255 255 / 6%), rgb(255 255 255 / 26%));
  }

  .cue-dot {
    display: block;
    width: 3px;
    height: 3px;
    margin-left: -1px;
    border-radius: 50%;
    background: var(--color-primary);
  }

  @media (prefers-reduced-motion: no-preference) {
    .cue-dot {
      animation: cue-fall 2.6s var(--ease-out) infinite;
    }
  }

  @keyframes cue-fall {
    0% {
      opacity: 0;
      transform: translateY(0);
    }
    35% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(2.25rem);
    }
  }

  .scroll-cue:focus-visible {
    outline: 3px solid rgb(184 147 90 / 45%);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  /* --------------------------------------------------------------- narrow */

  @media (max-width: 62rem) {
    .inner {
      grid-template-columns: minmax(0, 1fr);
      justify-items: center;
      text-align: center;
    }

    .copy {
      align-items: center;
      order: 1;
    }

    .lede,
    .trust {
      justify-content: center;
    }

    .actions {
      justify-content: center;
    }

    .stage {
      order: 2;
      /*
        The device is the payoff, not the opener, once the copy is centred —
        and at the phone's own aspect ratio every rem of width costs two of
        height, so it is held well below the copy's measure.
      */
      width: min(100%, 17rem);
      margin-top: var(--space-lg);
    }

    /* Two cards, tucked to the edges — three would crowd a narrow stage. */
    .orbit[data-card='wears'] {
      display: none;
    }

    .orbit[data-card='service'] {
      left: -4%;
    }

    .orbit[data-card='papers'] {
      right: -4%;
    }
  }

  @media (max-width: 30rem) {
    .orbit {
      display: none;
    }

    .scroll-cue {
      display: none;
    }
  }
</style>
