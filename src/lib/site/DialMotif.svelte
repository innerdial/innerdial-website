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

  <!-- The mark itself: the logo's two arcs, scaled to the figure's centre. -->
  <g class="mark" stroke="currentColor" stroke-width="3.2">
    <path
      d="M236 306c-12-34-13-75 5-111l59 57c-6 14-17 49-15 71M236 306c27 76 117 127 235 74l-77-79c-18 12-67 24-108 22M236 306c11 11 29 16 49 17"
    />
    <path
      d="M551 291c12 34 13 75-5 111l-59-57c6-14 17-49 15-71M551 291c-27-76-117-127-235-74l77 79c18-12 67-24 108-22M551 291c-11-11-29-16-49-17"
      transform="translate(-93 8) scale(0.86) translate(50 42)"
    />
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

  .rings,
  .track,
  .mark {
    transform-origin: 300px 300px;
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
