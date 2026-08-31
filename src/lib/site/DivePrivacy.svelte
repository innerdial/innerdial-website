<script>
  import { reveal } from '$lib/site/motion.js';

  /**
   * Deep dive: privacy and offline.
   *
   * Treatment — the section arrives blurred and resolves as it is read, which
   * is the one place on the page where a blur is doing an argument's work
   * rather than decorating: what is private is unreadable until it is yours.
   * The lock card unblurs on hover, and only then.
   */

  const GUARANTEES = [
    {
      id: 'lock',
      title: 'Opens with your face',
      body: 'Biometric lock on the vault, on the documents, or on the values alone — you choose which.',
    },
    {
      id: 'offline',
      title: 'Works with no signal',
      body: 'The whole collection is cached on the device. A basement safe deposit box has no bars either.',
    },
    {
      id: 'nomarket',
      title: 'No feed, no marketplace',
      body: 'Nobody sees what you own. There is no social layer to leak one, because there is no social layer.',
    },
    {
      id: 'export',
      title: 'Leaves when you do',
      body: 'Export everything as a spreadsheet with the files attached. Then erase the account, for real.',
    },
  ];
</script>

<section class="dive" id="privacy" aria-labelledby="privacy-heading">
  <div class="shell inner">
    <div class="copy">
      <p class="eyebrow" use:reveal={{ variant: 'fade' }}>Deep dive · Privacy</p>

      <h2 id="privacy-heading" use:reveal={{ variant: 'up', index: 1 }}>
        Nobody needs to know <span class="accent">what you own</span>.
      </h2>

      <p class="lede" use:reveal={{ variant: 'up', index: 2 }}>
        A list of valuable objects, their serial numbers and where they are kept
        is exactly the document you would least like to leak. Innerdial is built
        on that assumption rather than around it.
      </p>

      <ul class="guarantees">
        {#each GUARANTEES as item, i (item.id)}
          <li use:reveal={{ variant: 'up', index: 3 + i }}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        {/each}
      </ul>
    </div>

    <div class="visual" aria-hidden="true">
      <!-- Blurred until hovered: the card is the demonstration, so it must
           actually withhold something. -->
      <div class="locked" data-parallax style="--parallax-from: 2rem; --parallax-to: -2rem"
        use:reveal={{ variant: 'scale' }}>
        <div class="veil">
          <span class="veil-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
              <path d="M8 10.5V7.5a4 4 0 1 1 8 0v3" />
              <circle cx="12" cy="15.5" r="1.3" />
            </svg>
          </span>
          <span class="veil-text">Locked</span>
          <span class="veil-hint">Hover to unlock</span>
        </div>

        <div class="secret">
          <p class="secret-eyebrow">Collection value</p>
          <p class="secret-figure">₹ 48,20,000</p>
          <ul class="secret-rows">
            <li><span>Speedmaster</span><span>₹ 6,40,000</span></li>
            <li><span>Snowflake</span><span>₹ 7,90,000</span></li>
            <li><span>Tank Louis</span><span>₹ 11,20,000</span></li>
            <li><span>Reverso</span><span>₹ 9,60,000</span></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .dive {
    position: relative;
    padding: var(--section-y) 0;
    background: var(--paper-tint);
    border-block: 1px solid var(--color-border);
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
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
    font-size: clamp(1.875rem, 3.8vw, 3rem);
    line-height: 1.08;
  }

  .guarantees {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: var(--space-lg) var(--space-md);
    margin: var(--space-md) 0 0;
    padding: 0;
    list-style: none;
  }

  .guarantees h3 {
    margin: 0 0 0.3rem;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0;
    color: var(--color-ink);
  }

  .guarantees p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  /* --------------------------------------------------------------- locked */

  .visual {
    display: flex;
    justify-content: center;
  }

  .locked {
    position: relative;
    overflow: hidden;
    width: min(100%, 22rem);
    padding: clamp(1.5rem, 3vw, 2rem);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--paper);
    box-shadow: var(--shadow-lg);
  }

  .secret {
    filter: blur(9px);
    /* The values are decorative stand-ins, but a page that says "nobody sees
       this" should not let them be swept into a selection either. */
    user-select: none;
    transition: filter 620ms var(--ease-out);
  }

  .secret-eyebrow {
    margin: 0 0 0.35rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .secret-figure {
    margin: 0 0 var(--space-md);
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 2.75rem);
    font-weight: 600;
    line-height: 1;
    color: var(--color-ink);
    font-variant-numeric: tabular-nums;
  }

  .secret-rows {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    margin: 0;
    padding: var(--space-md) 0 0;
    border-top: 1px solid var(--color-border);
    list-style: none;
  }

  .secret-rows li {
    display: flex;
    justify-content: space-between;
    gap: var(--space-md);
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .veil {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    background: rgb(255 255 255 / 62%);
    backdrop-filter: blur(2px);
    transition: opacity 620ms var(--ease-out);
  }

  .veil-icon {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    margin-bottom: 0.35rem;
    border-radius: 50%;
    background: var(--color-ink);
    color: var(--color-primary);
  }

  .veil-icon svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .veil-text {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .veil-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  /* Pointer only. On touch there is no hover to offer, so the card stays as
     it is and the hint is the whole message. */
  @media (hover: hover) and (pointer: fine) {
    .locked:hover .secret {
      filter: blur(0);
    }

    .locked:hover .veil {
      opacity: 0;
    }
  }

  @media (max-width: 62rem) {
    .inner {
      grid-template-columns: minmax(0, 1fr);
    }

    .visual {
      order: -1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .secret,
    .veil {
      transition-duration: 1ms;
    }
  }
</style>
