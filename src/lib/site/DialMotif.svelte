<script>
  /**
   * The concentric guilloché figure that runs behind the dark sections.
   *
   * It is the brand mark's geometry rather than a generic gradient blob: rings,
   * a minute track, and the two counter-rotating arcs the Innerdial logo is
   * built from. Drawn as one inline SVG so it inherits the current colour and
   * costs no request.
   *
   * Rotation is CSS on two groups, at different speeds and directions, which
   * gives the figure a slow drift no single spin would. Both are transforms, so
   * the compositor carries them and the section can still scroll at 60fps on a
   * mid-range phone.
   *
   * @type {{ opacity?: number }}
   */
  let { opacity = 1 } = $props();

  /** The minute track: 60 ticks, every fifth one long. */
  const TICKS = Array.from({ length: 60 }, (_, i) => ({
    angle: i * 6,
    major: i % 5 === 0,
  }));

  /** Concentric guilloché rings, tightening toward the centre. */
  const RINGS = [236, 210, 186, 164, 144, 126, 110, 96, 84, 74, 66, 60];
</script>

<svg
  class="motif"
  viewBox="0 0 600 600"
  fill="none"
  aria-hidden="true"
  style="--motif-opacity: {opacity}"
>
  <g class="rings">
    {#each RINGS as r, i (r)}
      <circle cx="300" cy="300" r={r} stroke="currentColor" stroke-width={i % 3 === 0 ? 0.9 : 0.4} />
    {/each}
  </g>

  <g class="track">
    {#each TICKS as tick (tick.angle)}
      <line
        x1="300"
        y1={tick.major ? 42 : 50}
        x2="300"
        y2="60"
        stroke="currentColor"
        stroke-width={tick.major ? 1.6 : 0.7}
        transform="rotate({tick.angle} 300 300)"
      />
    {/each}
  </g>

  <!--
    The mark itself, verbatim from `public/images/innerdial_logo.svg`.

    The path data is the logo's own and is not retyped or redrawn — an earlier
    version approximated these two arcs by hand in the 600-unit viewBox and got
    the curves wrong, which is what put a broken mark behind every dark section.
    Placement is a transform instead: centre on the figure, scale up, then pull
    the logo's own centre (38.4, 38.4 in its 77-unit box) back to the origin.

    The white disc the logo carries is deliberately dropped. Here the mark is a
    watermark drawn in line only, so a filled ground would black out the rings
    behind it.
  -->
  <g transform="translate(300 300) scale(5.2) translate(-38.4 -38.4)">
    <!-- Nested so the breathing scale below cannot replace the placement: a
         CSS transform overrides the presentation attribute outright. -->
    <g class="mark" stroke="currentColor" stroke-width="0.5" fill="none">
      <path
        d="M17.7884 39.3577C16.2419 34.9512 16.1584 29.6307 18.4269 24.9951L26.0868 32.3359C25.3421 34.2067 23.9164 38.6637 24.1718 41.5255M17.7884 39.3577C21.2463 49.2104 32.8924 55.7694 48.1095 48.9327L38.2153 38.7193C35.8572 40.2199 29.4675 41.8645 24.1718 41.5255M17.7884 39.3577C19.2555 40.72 21.5829 41.3598 24.1718 41.5255"
      />
      <path
        d="M58.4802 37.4426C60.0266 41.849 60.1102 47.1695 57.8416 51.8052L50.1818 44.4643C50.9265 42.5935 52.3521 38.1365 52.0968 35.2747M58.4802 37.4426C55.0223 27.5898 43.3762 21.0308 28.159 27.8675L38.0532 38.0809C40.4113 36.5803 46.8011 34.9357 52.0968 35.2747M58.4802 37.4426C57.013 36.0802 54.6856 35.4405 52.0968 35.2747"
      />
    </g>
  </g>
</svg>

<style>
  .motif {
    display: block;
    width: 100%;
    height: 100%;
    opacity: var(--motif-opacity, 1);
    /* Decorative and behind live text — never intercept a pointer. */
    pointer-events: none;
  }

  /* Both spin about the figure's centre, in the 600-unit viewBox. */
  .rings,
  .track {
    transform-origin: 300px 300px;
  }

  /*
    The mark breathes about the logo's own centre instead. It sits inside the
    placement transform, so its local coordinate system is the logo's 77-unit
    box — 300,300 would be far outside it and the scale would throw the mark
    off across the figure.
  */
  .mark {
    transform-origin: 38.4px 38.4px;
  }

  @media (prefers-reduced-motion: no-preference) {
    .track {
      animation: motif-spin 240s linear infinite;
    }

    /* Counter-rotating, and far slower — the two together read as drift rather
       than as a spinning wheel. */
    .rings {
      animation: motif-spin 400s linear infinite reverse;
    }

    .mark {
      animation: motif-breathe 18s ease-in-out infinite;
    }
  }

  @keyframes motif-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes motif-breathe {
    0%,
    100% {
      opacity: 0.85;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.015);
    }
  }
</style>
