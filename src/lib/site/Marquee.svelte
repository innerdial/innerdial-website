<script>
  import { reveal } from '$lib/site/motion.js';

  /**
   * The ledger strip.
   *
   * Two rows of field names travelling in opposite directions, between the
   * feature grid and the walkthrough. It does a job no static block does: it
   * shows the *breadth* of what a record holds without asking anyone to read a
   * list of thirty items. The eye takes the density as the message.
   *
   * Every entry is a field the app actually records — movements and occasions
   * come straight from `vault/fields.js` in the collector app.
   *
   * Mechanically it is one animation on a doubled track. The list is rendered
   * twice and the track travels exactly -50%, so the moment it wraps, the
   * second copy is sitting where the first began and the seam is invisible.
   */

  /** @type {string[]} */
  const TOP = [
    'Reference',
    'Serial number',
    'Movement',
    'Case size',
    'Lug width',
    'Dial',
    'Bracelet',
    'Purchase date',
    'Retailer',
    'Purchase price',
    'Box & papers',
    'Warranty expiry',
  ];

  /** @type {string[]} */
  const BOTTOM = [
    'Service interval',
    'Last serviced',
    'Watchmaker',
    'Next due',
    'Valuation',
    'Insurer',
    'Provenance',
    'Occasion',
    'Days worn',
    'Travel box',
    'Photographs',
    'Notes',
  ];
</script>

<section class="marquee" aria-labelledby="ledger-heading">
  <div class="shell head" use:reveal={{ variant: 'fade' }}>
    <p class="eyebrow">The ledger</p>
    <h2 id="ledger-heading">Everything a record holds.</h2>
  </div>

  <!--
    The rows are decorative repetition of the heading's claim; a screen reader
    reading thirty field names twice over would be noise, so the accessible
    summary is the heading and the rows are hidden.
  -->
  <div class="rows" aria-hidden="true">
    {#each [TOP, BOTTOM] as row, i (i)}
      <div class="row" data-dir={i === 0 ? 'left' : 'right'}>
        <div class="track">
          <!-- Rendered twice: the second copy is what the first wraps onto. -->
          {#each [0, 1] as copy (copy)}
            <ul class="run">
              {#each row as field (field)}
                <li>
                  <span class="tick"></span>
                  {field}
                </li>
              {/each}
            </ul>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .marquee {
    position: relative;
    overflow: hidden;
    padding: clamp(3rem, 7vw, 5rem) 0 clamp(3.5rem, 8vw, 6rem);
    background: var(--paper);
    border-top: 1px solid var(--color-border);
  }

  .head {
    position: relative;
    z-index: 1;
    margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
    text-align: center;
  }

  .head h2 {
    margin: var(--space-sm) 0 0;
    font-size: clamp(1.75rem, 3.6vw, 2.75rem);
    line-height: 1.1;
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 1.6vw, 1rem);
  }

  .row {
    overflow: hidden;
    /*
      Fades the strip out at both edges instead of letting words be guillotined
      by the viewport. Without it the whole effect reads as a clipped overflow
      bug rather than as continuous travel.
    */
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      #000 var(--fade, 12%),
      #000 calc(100% - var(--fade, 12%)),
      transparent 100%
    );
  }

  /* 12% of a phone is 45px — barely a character, so the words still read as
     guillotined. The fade has to be a larger share of a smaller screen. */
  @media (max-width: 48rem) {
    .row {
      --fade: 22%;
    }
  }

  .track {
    display: flex;
    width: max-content;
  }

  .run {
    display: flex;
    align-items: center;
    gap: clamp(1.25rem, 3vw, 2.5rem);
    margin: 0;
    padding: 0 clamp(0.625rem, 1.5vw, 1.25rem);
    list-style: none;
  }

  .run li {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    white-space: nowrap;
    font-family: var(--font-display);
    font-size: clamp(1.375rem, 3vw, 2.125rem);
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-ink);
  }

  /* The brass lozenge between entries — a separator, not a bullet. */
  .tick {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: var(--color-primary);
  }

  /* The second row is quieter, so the pair reads as one texture with a
     foreground rather than as two competing strips. */
  .row[data-dir='right'] .run li {
    color: var(--color-text-muted);
    font-size: clamp(1.125rem, 2.4vw, 1.625rem);
  }

  .row[data-dir='right'] .tick {
    background: var(--color-border);
  }

  @media (prefers-reduced-motion: no-preference) {
    .track {
      animation: marquee-run 46s linear infinite;
    }

    .row[data-dir='right'] .track {
      animation-duration: 58s;
      animation-direction: reverse;
    }

    /* Slows rather than stops: a hard halt mid-travel reads as a stall. */
    .marquee:hover .track {
      animation-play-state: paused;
    }
  }

  /*
    -50% and not -100%. The track holds two identical copies, so half its width
    is exactly one full list — at that point copy two occupies the position
    copy one started from and the reset is invisible.
  */
  @keyframes marquee-run {
    to {
      transform: translateX(-50%);
    }
  }

  /*
    Nothing travels, so a strip that runs off the edge would simply be text the
    reader cannot reach. One row, wrapped, still makes the density point.
  */
  @media (prefers-reduced-motion: reduce) {
    .row {
      mask-image: none;
    }

    .track {
      width: 100%;
    }

    .row[data-dir='right'] {
      display: none;
    }

    .run {
      flex-wrap: wrap;
      justify-content: center;
    }

    .run:last-child {
      display: none;
    }
  }
</style>
