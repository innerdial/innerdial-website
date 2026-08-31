<script>
  import Backdrop from '$lib/site/Backdrop.svelte';
  import { reveal } from '$lib/site/motion.js';

  /**
   * What the app holds.
   *
   * Every card is a screen that exists — vault, documents, service, travel,
   * wear log, timeline. The grid is a bento rather than a uniform 3×2 so the
   * two load-bearing features get the room to say more, and the eye has
   * somewhere to land first.
   *
   * The spotlight is one delegated `pointermove` on the grid, not a listener
   * per card: twelve listeners writing the same two custom properties is
   * twelve times the work for an effect only one card can show at a time.
   */

  const FEATURES = [
    {
      id: 'vault',
      size: 'wide',
      title: 'The vault',
      body: 'Every piece, with its reference, serial, movement, purchase and provenance. The record you would want to already have on the day you need it.',
      icon: 'vault',
    },
    {
      id: 'documents',
      size: 'tall',
      title: 'Documents',
      body: 'Invoices, warranty cards, service receipts and valuations — photographed or imported, and filed against the watch they belong to.',
      icon: 'document',
      // The tall card is twice the height of its neighbours. Naming what it
      // actually files earns the extra room; nothing else would fill it
      // without being decoration.
      items: ['Invoice', 'Warranty card', 'Service receipt', 'Valuation', 'Certificate', 'Photographs'],
    },
    {
      id: 'service',
      title: 'Service history',
      body: 'What was done, by whom, and a reminder before the next one falls due.',
      icon: 'service',
    },
    {
      id: 'travel',
      title: 'Travel boxes',
      body: 'Pack a case, and know exactly what is in it and where it is.',
      icon: 'travel',
    },
    {
      id: 'wear',
      title: 'Wear log',
      body: 'What is on the wrist today, what is most worn, and what has been resting too long.',
      icon: 'wear',
    },
    {
      id: 'timeline',
      title: 'Timeline',
      body: 'Acquisitions, services and milestones, in the order they happened.',
      icon: 'timeline',
    },
  ];

  /** @param {PointerEvent} event */
  function onMove(event) {
    const card = /** @type {HTMLElement | null} */ (
      /** @type {HTMLElement} */ (event.target).closest?.('.card')
    );
    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }
</script>

<section class="features" id="features" aria-labelledby="features-heading">
  <Backdrop tone="light" glow="corner" fade="top" cell={64} />

  <div class="shell inner">
    <header class="head">
      <p class="eyebrow" use:reveal={{ variant: 'fade' }}>What it holds</p>
      <h2 id="features-heading" use:reveal={{ variant: 'up', index: 1 }}>
        Six screens that do the <span class="accent">remembering</span>.
      </h2>
      <p class="lede" use:reveal={{ variant: 'up', index: 2 }}>
        Not a note app with watches in it. Every surface is built around the one
        thing a collection actually needs: a record that stays accurate without
        being maintained.
      </p>
    </header>

    <!-- Pointer only; the spotlight is decoration and the cards are not
         interactive targets, so there is no keyboard equivalent to provide. -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <ul class="grid" onpointermove={onMove}>
      {#each FEATURES as feature, i (feature.id)}
        <li
          class="card pane"
          data-size={feature.size ?? 'default'}
          use:reveal={{ variant: 'up', index: i }}
        >
          <span class="spot" aria-hidden="true"></span>

          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              {#if feature.icon === 'vault'}
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="12" cy="12" r="4" />
                <path d="M12 9.6V12l1.6 1.1M7 3v2M17 3v2" />
              {:else if feature.icon === 'document'}
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
                <path d="M14 3v5h5M8.5 13h7M8.5 16.5h4.5" />
              {:else if feature.icon === 'service'}
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7v5l3.2 2M12 3.5v1M20.5 12h-1M12 20.5v-1M3.5 12h1" />
              {:else if feature.icon === 'travel'}
                <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
                <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 13h18" />
              {:else if feature.icon === 'wear'}
                <circle cx="12" cy="12" r="5" />
                <path d="M9 7.2L9.6 3h4.8l.6 4.2M9 16.8l.6 4.2h4.8l.6-4.2M12 10v2l1.4 1" />
              {:else}
                <path d="M5 4v16" />
                <circle cx="5" cy="8" r="1.6" />
                <circle cx="5" cy="15.5" r="1.6" />
                <path d="M9.5 8H19M9.5 15.5H16" />
              {/if}
            </svg>
          </span>

          <h3>{feature.title}</h3>
          <p>{feature.body}</p>

          {#if feature.items}
            <ul class="filed">
              {#each feature.items as item (item)}
                <li>{item}</li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .features {
    position: relative;
    padding: var(--section-y) 0;
    /* A shade off white, so the cards — which are white — lift off the page
       without needing a heavier shadow to do it. */
    background: var(--paper-warm);
    border-top: 1px solid var(--color-border);
  }

  .inner {
    position: relative;
    z-index: 1;
  }

  .head {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    max-width: 44rem;
    margin-bottom: clamp(2.5rem, 5vw, 4rem);
  }

  .head h2 {
    margin: var(--space-xs) 0 0;
    font-size: clamp(2rem, 4.2vw, 3.25rem);
    line-height: 1.08;
  }

  .grid {
    display: grid;
    /* Six columns, so a card can claim two, three or four of them and the
       bento stays on one rhythm. */
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: var(--space-md);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    grid-column: span 2;
    overflow: hidden;
    padding: clamp(1.25rem, 2vw, 1.75rem);
    /* Border, radius and ground come from `.pane` in site.css. */
    isolation: isolate;
    transition:
      translate 460ms var(--ease-out),
      box-shadow 460ms var(--ease-out),
      border-color 460ms var(--ease-out);
  }

  .card[data-size='wide'] {
    grid-column: span 4;
  }

  .card[data-size='tall'] {
    grid-column: span 2;
    grid-row: span 2;
    justify-content: flex-start;
  }

  /*
    The lift uses `translate`, not `transform`. The reveal owns `transform`,
    and hovering a card that is still arriving would otherwise replace the
    travel it is in the middle of with a 4px hop. As separate properties the
    two simply compose.
  */
  .card:hover {
    translate: 0 -4px;
    border-color: rgb(184 147 90 / 40%);
    box-shadow: var(--shadow-md);
  }

  /*
    The spotlight. A brass wash centred on the pointer, revealed by opacity so
    the gradient is composited once and then only faded.
  */
  .spot {
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0;
    background: radial-gradient(
      16rem 16rem at var(--mx, 50%) var(--my, 50%),
      rgb(184 147 90 / 13%) 0%,
      transparent 68%
    );
    transition: opacity 460ms var(--ease-out);
  }

  .card:hover .spot {
    opacity: 1;
  }

  @media (hover: none) {
    .spot {
      display: none;
    }
  }

  .icon {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    margin-bottom: 0.35rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--paper-warm);
    color: var(--color-primary);
    transition:
      background 460ms var(--ease-out),
      border-color 460ms var(--ease-out),
      transform 560ms var(--ease-out);
  }

  .icon svg {
    display: block;
    width: 1.375rem;
    height: 1.375rem;
  }

  .card:hover .icon {
    border-color: transparent;
    background: var(--color-primary);
    color: #fff;
    transform: rotate(-6deg) scale(1.06);
  }

  .card h3 {
    margin: 0;
    font-size: clamp(1.25rem, 1.8vw, 1.625rem);
    line-height: 1.15;
  }

  .card[data-size='wide'] h3 {
    font-size: clamp(1.5rem, 2.4vw, 2rem);
  }

  .card p {
    margin: 0;
    max-width: 32rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-text-muted);
  }

  /* Pushed to the foot of the tall card, so the extra height is spent rather
     than left as a hole under the paragraph. */
  .filed {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: auto 0 0;
    padding: var(--space-md) 0 0;
    border-top: 1px solid var(--color-border);
    list-style: none;
  }

  .filed li {
    padding: 0.3rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 9999px;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    transition:
      border-color 400ms var(--ease-out),
      color 400ms var(--ease-out);
  }

  .card:hover .filed li {
    border-color: rgb(184 147 90 / 40%);
    color: var(--color-text);
  }

  /* --------------------------------------------------------------- narrow */

  @media (max-width: 60rem) {
    .grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .card,
    .card[data-size='wide'],
    .card[data-size='tall'] {
      grid-column: span 2;
      grid-row: auto;
    }
  }

  @media (max-width: 40rem) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .card,
    .card[data-size='wide'],
    .card[data-size='tall'] {
      grid-column: span 1;
    }
  }
</style>
