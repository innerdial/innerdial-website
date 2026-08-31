<script>
  import Backdrop from '$lib/site/Backdrop.svelte';
  import { reveal } from '$lib/site/motion.js';

  /**
   * The core proposition, told as a convergence.
   *
   * A collection's record is normally scattered — a serial in a note, an
   * invoice in an inbox, a service card in a drawer, a valuation in a PDF
   * someone emailed once. The visual starts them scattered and rotated and
   * lets them settle into a single ordered column as the section arrives. The
   * argument is the animation; the copy only has to name it.
   *
   * Each chip's starting offset is data, not a stylesheet rule, so the scatter
   * can be tuned without touching CSS and no two chips travel the same path.
   */

  /** `dx`/`dy` are rem off the settled position; `r` is degrees of tilt. */
  const CHIPS = [
    { id: 'serial', label: 'Serial', value: '84 429 117', dx: -9, dy: -7, r: -13 },
    { id: 'invoice', label: 'Invoice', value: 'Retailer · 2019', dx: 10, dy: -5, r: 9 },
    { id: 'warranty', label: 'Warranty', value: 'Card · stamped', dx: -11, dy: 2, r: 7 },
    { id: 'service', label: 'Service', value: 'Full · Mar 2023', dx: 11, dy: 5, r: -8 },
    { id: 'valuation', label: 'Valuation', value: 'Insured to date', dx: -8, dy: 9, r: 11 },
    { id: 'provenance', label: 'Provenance', value: "Father's, 1994", dx: 9, dy: 11, r: -6 },
  ];

  const POINTS = [
    {
      id: 'one',
      title: 'One piece, one record',
      body: 'Everything that proves a watch is yours lives on the watch, not in six places.',
    },
    {
      id: 'two',
      title: 'Written down before it is needed',
      body: 'A claim, a sale or an heir is the wrong moment to start looking for the papers.',
    },
    {
      id: 'three',
      title: 'Private by construction',
      body: 'No feed, no marketplace, no valuations shown to anyone but you.',
    },
  ];
</script>

<section class="intro" id="vault" aria-labelledby="intro-heading">
  <Backdrop tone="light" glow="right" fade="radial" cell={64} />

  <div class="shell inner">
    <div class="copy">
      <p class="eyebrow" use:reveal={{ variant: 'fade' }}>The idea</p>

      <h2 id="intro-heading" use:reveal={{ variant: 'up', index: 1 }}>
        A collection is a <span class="accent">record</span>, not a gallery.
      </h2>

      <p class="lede" use:reveal={{ variant: 'up', index: 2 }}>
        The watches are the easy part. It is everything around them — the serials,
        the papers, the services, the story of how each one arrived — that goes
        missing exactly when it matters.
      </p>

      <ul class="points">
        {#each POINTS as point, i (point.id)}
          <li use:reveal={{ variant: 'up', index: 3 + i }}>
            <span class="point-rule" aria-hidden="true"></span>
            <h3>{point.title}</h3>
            <p>{point.body}</p>
          </li>
        {/each}
      </ul>
    </div>

    <div class="visual" aria-hidden="true">
      <div class="field" data-parallax style="--parallax-from: 2rem; --parallax-to: -2rem">
        <span class="hub">
          <span class="hub-ring"></span>
          <span class="hub-ring"></span>
          <span class="hub-mark">
            <img src="/images/innerdial_logo.svg" alt="" width="44" height="44" />
          </span>
        </span>

        <ul class="chips">
          {#each CHIPS as chip, i (chip.id)}
            <li
              class="chip"
              style="--dx: {chip.dx}rem; --dy: {chip.dy}rem; --r: {chip.r}deg"
              use:reveal={{ variant: 'fade', index: i }}
            >
              <span class="chip-label">{chip.label}</span>
              <span class="chip-value">{chip.value}</span>
              <!-- The hairline running back to the hub, which is what makes
                   the settled ring read as convergence and not as a list. -->
              <span class="chip-leader" aria-hidden="true"></span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</section>

<style>
  .intro {
    position: relative;
    padding: var(--section-y) 0;
    background: var(--paper);
  }

  .inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: clamp(2.5rem, 6vw, 6rem);
  }

  .copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  h2 {
    margin: var(--space-xs) 0 0;
    font-size: clamp(2.125rem, 4.4vw, 3.5rem);
    line-height: 1.06;
  }

  .points {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    margin: var(--space-md) 0 0;
    padding: 0;
    list-style: none;
  }

  .points li {
    position: relative;
    padding-left: var(--space-lg);
  }

  /* A brass hairline that grows down the side of each point as it arrives. */
  .point-rule {
    position: absolute;
    top: 0.35rem;
    bottom: 0.2rem;
    left: 0;
    width: 2px;
    border-radius: 2px;
    background: var(--color-primary);
    /* Driven by the parent's reveal state rather than by selecting on it —
       see the `--revealed` note in site.css. */
    transform: scaleY(var(--revealed, 1));
    transform-origin: top;
    transition: transform 700ms var(--ease-out) 180ms;
  }

  .points h3 {
    margin: 0 0 0.35rem;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 1.0625rem;
    font-weight: 600;
    letter-spacing: 0;
    color: var(--color-ink);
  }

  .points p {
    margin: 0;
    max-width: 30rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-text-muted);
  }

  /* --------------------------------------------------------------- visual */

  .visual {
    display: flex;
    justify-content: center;
  }

  .field {
    /*
      One source of truth for the composition: the hub's diameter, and the
      gutter it stands in. Sizing the two independently left the mark four
      pixels wider than the gap between the columns, so the chips clipped it.
      Container units, not viewport ones — the field is what shrinks when the
      layout stacks, and the page width says nothing about it.
    */
    --hub-size: clamp(6rem, 26cqw, 8.5rem);

    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    max-width: 30rem;
    aspect-ratio: 1;
    container-type: inline-size;
  }

  /* The hub the chips settle around: two rings and the mark. */
  .hub {
    position: absolute;
    display: grid;
    place-items: center;
    width: var(--hub-size);
    height: var(--hub-size);
  }

  .hub-ring {
    position: absolute;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    inset: 0;
  }

  .hub-ring:last-of-type {
    inset: 1.15rem;
    border-color: rgb(184 147 90 / 34%);
  }

  @media (prefers-reduced-motion: no-preference) {
    .hub-ring {
      animation: hub-pulse 6s ease-in-out infinite;
    }

    .hub-ring:last-of-type {
      animation-delay: -3s;
    }
  }

  @keyframes hub-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.6;
    }
  }

  .hub-mark {
    display: grid;
    place-items: center;
    width: 4.25rem;
    height: 4.25rem;
    border-radius: 50%;
    background: var(--paper);
    box-shadow: var(--shadow-md);
  }

  .hub-mark img {
    display: block;
  }

  /*
    Two columns with the hub standing in the gutter between them. A single
    column beside the mark buried it; splitting the six evenly reads as six
    scattered things arriving at one centre, which is the argument the section
    is making.
  */
  .chips {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* The hub plus air on both sides of it, so the columns cannot clip it. */
    column-gap: calc(var(--hub-size) + 1.5rem);
    row-gap: 0.6rem;
    align-items: center;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .chip:nth-child(odd) {
    justify-self: end;
  }

  .chip:nth-child(even) {
    justify-self: start;
  }

  .chip {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.5rem 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--paper);
    box-shadow: var(--shadow-sm);
    white-space: nowrap;
    transition:
      box-shadow 400ms var(--ease-out),
      border-color 400ms var(--ease-out);
  }

  /*
    The scatter. Reveal handles the fade; the travel and the tilt are declared
    here so each chip can carry its own vector rather than sharing one variant.
  */
  @media (prefers-reduced-motion: no-preference) {
    .chip:not([data-revealed]) {
      transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--r)) scale(0.92);
    }

    .chip {
      transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
      /* Slower than the page default: the settling is the point. */
      transition:
        opacity 900ms var(--ease-out),
        transform 1050ms var(--ease-page),
        box-shadow 400ms var(--ease-out),
        border-color 400ms var(--ease-out);
      transition-delay: calc(var(--reveal-i) * 90ms);
    }
  }

  /*
    The leader line back to the hub. It grows from the chip's inner edge as the
    chip lands, so the six appear to hook onto the centre one after another.
  */
  .chip-leader {
    position: absolute;
    top: 50%;
    width: clamp(1rem, 5cqw, 2rem);
    height: 1px;
    background: linear-gradient(
      to var(--leader-dir, right),
      rgb(184 147 90 / 55%),
      rgb(184 147 90 / 0%)
    );
    transform: scaleX(var(--revealed, 1));
    transition: transform 700ms var(--ease-page) calc(var(--reveal-i) * 90ms + 260ms);
  }

  .chip:nth-child(odd) .chip-leader {
    left: 100%;
    transform-origin: left;
  }

  .chip:nth-child(even) .chip-leader {
    right: 100%;
    transform-origin: right;
    --leader-dir: left;
  }

  .chip-label {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .chip-value {
    font-size: 0.8125rem;
    color: var(--color-text);
  }

  @media (max-width: 62rem) {
    .inner {
      grid-template-columns: minmax(0, 1fr);
      gap: clamp(2.5rem, 8vw, 4rem);
    }

    .visual {
      order: -1;
    }

    .field {
      max-width: 26rem;
    }
  }

  /*
    Too narrow for two columns either side of the hub. The mark moves to the
    top of the field and the six stack under it in one column — the same
    convergence, told vertically.
  */
  @media (max-width: 34rem) {
    .field {
      aspect-ratio: auto;
      place-items: stretch;
      gap: var(--space-lg);
      grid-template-rows: auto auto;
    }

    /*
      `relative`, never `static`. The rings inside are absolutely positioned
      against the hub; letting it fall out of the positioning flow re-anchored
      them to `.field` and they blew up into a giant arc across the section.
    */
    .hub {
      position: relative;
      justify-self: center;
      width: 6.5rem;
      height: 6.5rem;
    }

    .hub-mark {
      width: 3.5rem;
      height: 3.5rem;
    }

    .chips {
      grid-template-columns: minmax(0, 1fr);
      column-gap: 0;
    }

    .chip:nth-child(odd),
    .chip:nth-child(even) {
      justify-self: stretch;
    }

    .chip-leader {
      display: none;
    }

    .chip {
      padding: 0.45rem 0.7rem;
    }

    .chip-value {
      font-size: 0.75rem;
    }
  }
</style>
