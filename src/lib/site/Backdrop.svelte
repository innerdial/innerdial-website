<script>
  /**
   * The engraved ground every section sits on.
   *
   * A watch dial is a ruled surface — guilloché, minute tracks, tachymeter
   * scales — so the site's background is a fine drawn grid rather than the
   * soft blobs a SaaS page would use. Three layers, all of them painted by the
   * compositor and none of them costing a request:
   *
   *   grid   a hairline lattice, radially masked so it fades out before the
   *          section edges instead of tiling flat to the corners
   *   rule   a heavier line every fourth cell, which is what stops the grid
   *          reading as graph paper
   *   glow   one or two brass blooms that give the flat ground some depth
   *
   * The mask is the part that matters. An unmasked grid reads as a wireframe;
   * masked, it reads as a surface catching light, and text stays legible
   * because the lattice is weakest exactly where the copy sits.
   *
   * @type {{
   *   tone?: 'light' | 'ink',
   *   grid?: boolean,
   *   glow?: 'none' | 'center' | 'left' | 'right' | 'corner',
   *   fade?: 'radial' | 'top' | 'bottom' | 'none',
   *   cell?: number,
   *   drift?: boolean,
   * }}
   */
  let {
    tone = 'light',
    grid = true,
    glow = 'none',
    fade = 'radial',
    cell = 64,
    drift = false,
  } = $props();
</script>

<div
  class="backdrop"
  data-tone={tone}
  data-fade={fade}
  data-glow={glow}
  class:drift
  style="--cell: {cell}px"
  aria-hidden="true"
>
  {#if grid}
    <span class="grid"></span>
    <span class="rule"></span>
  {/if}

  {#if glow !== 'none'}
    <span class="glow"></span>
  {/if}
</div>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    /* Its own stacking context, so a section's content only has to clear
       z-index 0 to sit above every layer in here. */
    isolation: isolate;
  }

  .grid,
  .rule {
    position: absolute;
    /* Overscanned, so a drifting grid never exposes an edge. */
    inset: -10%;
  }

  .grid {
    background-image:
      linear-gradient(to right, var(--line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--line) 1px, transparent 1px);
    background-size: var(--cell) var(--cell);
  }

  /* Every fourth line, heavier — the beat that turns a lattice into a scale. */
  .rule {
    background-image:
      linear-gradient(to right, var(--line-strong) 1px, transparent 1px),
      linear-gradient(to bottom, var(--line-strong) 1px, transparent 1px);
    background-size: calc(var(--cell) * 4) calc(var(--cell) * 4);
  }

  .backdrop[data-tone='light'] {
    --line: rgb(14 27 44 / 4.5%);
    --line-strong: rgb(14 27 44 / 7%);
    --bloom: rgb(184 147 90 / 16%);
  }

  /*
    Far weaker than the light tone, and not by eye — by Weber.

    Matching the two by contrast ratio (both land near 1.10) is what made the
    dark sections look gridded over. What the eye actually tracks is the step
    relative to the ground it is adapted to: the same ~10/255 line is a 4%
    change on paper and a 64% change on --ink-900. Equal on paper, fifteen
    times louder in the room.

    1.5% puts the step at roughly 3.5/255, which is quiet against ink while
    still catching the light. Going further toward a true Weber match would
    erase the figure altogether.
  */
  .backdrop[data-tone='ink'] {
    --line: rgb(255 255 255 / 1.5%);
    --bloom: rgb(184 147 90 / 22%);
  }

  /*
    No heavier fourth line on ink either. That accent is what turns a lattice
    into a ruled scale, which is exactly the structure that shouts on a dark
    ground — the plain hairlines carry the texture there on their own.
  */
  .backdrop[data-tone='ink'] .rule {
    display: none;
  }

  /* ------------------------------------------------------------------ fade */

  .backdrop[data-fade='radial'] .grid,
  .backdrop[data-fade='radial'] .rule {
    mask-image: radial-gradient(ellipse 75% 65% at 50% 45%, #000 20%, transparent 78%);
  }

  .backdrop[data-fade='top'] .grid,
  .backdrop[data-fade='top'] .rule {
    mask-image: linear-gradient(to bottom, #000 0%, #000 35%, transparent 88%);
  }

  .backdrop[data-fade='bottom'] .grid,
  .backdrop[data-fade='bottom'] .rule {
    mask-image: linear-gradient(to top, #000 0%, #000 35%, transparent 88%);
  }

  /* ------------------------------------------------------------------ glow */

  .glow {
    position: absolute;
    width: min(60rem, 130%);
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle, var(--bloom) 0%, transparent 62%);
    filter: blur(12px);
  }

  .backdrop[data-glow='center'] .glow {
    top: 50%;
    left: 50%;
    translate: -50% -50%;
  }

  .backdrop[data-glow='left'] .glow {
    top: 50%;
    left: 0;
    translate: -45% -50%;
  }

  .backdrop[data-glow='right'] .glow {
    top: 50%;
    right: 0;
    translate: 45% -50%;
  }

  .backdrop[data-glow='corner'] .glow {
    top: 0;
    right: 0;
    translate: 30% -45%;
  }

  /* ----------------------------------------------------------------- drift */

  /*
    One cell of travel, looped — the grid slides exactly one square and starts
    again, so the motion is continuous with no seam. Slow enough to register as
    drift rather than movement.
  */
  @media (prefers-reduced-motion: no-preference) {
    .backdrop.drift .grid {
      animation: grid-drift 34s linear infinite;
    }

    .backdrop.drift .glow {
      animation: glow-breathe 14s ease-in-out infinite;
    }
  }

  @keyframes grid-drift {
    to {
      background-position: var(--cell) var(--cell);
    }
  }

  @keyframes glow-breathe {
    0%,
    100% {
      opacity: 0.75;
      scale: 1;
    }
    50% {
      opacity: 1;
      scale: 1.08;
    }
  }

  /* The lattice is finer on a phone, where a 64px cell reads as four huge
     squares rather than as a surface. */
  @media (max-width: 40rem) {
    .backdrop {
      --cell-scale: 0.62;
    }

    .grid {
      background-size: calc(var(--cell) * 0.62) calc(var(--cell) * 0.62);
    }

    .rule {
      background-size: calc(var(--cell) * 2.48) calc(var(--cell) * 2.48);
    }
  }
</style>
