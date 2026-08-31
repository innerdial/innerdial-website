<script>
  import { reveal } from '$lib/site/motion.js';

  /**
   * Deep dive: the instruments.
   *
   * Treatment — the visual is not a picture of the tools, it is the tools
   * running. The moonphase actually cycles, the seconds hand actually sweeps.
   * A static screenshot of a precision instrument makes the opposite of the
   * point.
   *
   * Both are pure CSS animation on transforms, one of them on a 24-second
   * cycle, so the cost is two composited layers and no script at all.
   */

  const TOOLS = [
    { id: 'world', name: 'World Time', note: 'A second zone on the 24-hour hand.' },
    { id: 'accuracy', name: 'Accuracy', note: 'Seconds a day, gained or lost.' },
    { id: 'discount', name: 'Discount', note: 'What a sale price really is.' },
  ];

  /** The 24-hour ring's labels, at every third hour. */
  const HOURS = [0, 3, 6, 9, 12, 15, 18, 21];
</script>

<section class="dive on-ink" id="tools" aria-labelledby="tools-heading">
  <div class="shell inner">
    <div class="copy">
      <p class="eyebrow" use:reveal={{ variant: 'fade' }}>Deep dive · Tools</p>

      <h2 id="tools-heading" use:reveal={{ variant: 'up', index: 1 }}>
        Instruments, not <span class="accent">widgets</span>.
      </h2>

      <p class="lede" use:reveal={{ variant: 'up', index: 2 }}>
        Five small tools that do one thing exactly. Set a moonphase to the right
        day without turning the crown thirty times. Check a movement against the
        reference second. Find out what a week actually costs you.
      </p>

      <ul class="chips">
        {#each TOOLS as tool, i (tool.id)}
          <li class="chip" use:reveal={{ variant: 'up', index: 3 + i }}>
            <span class="chip-name">{tool.name}</span>
            <span class="chip-note">{tool.note}</span>
          </li>
        {/each}
      </ul>
    </div>

    <div class="panel" aria-hidden="true" data-parallax
      style="--parallax-from: 3rem; --parallax-to: -3rem">
      <div class="instrument moonphase" use:reveal={{ variant: 'scale' }}>
        <span class="instrument-label">Moonphase</span>

        <span class="aperture">
          <span class="sky"></span>
          <span class="moon">
            <!-- The maria, so the disc reads as a moon rather than a dot. -->
            <i style="--x: 34%; --y: 30%; --d: 22%"></i>
            <i style="--x: 62%; --y: 52%; --d: 15%"></i>
            <i style="--x: 40%; --y: 66%; --d: 11%"></i>
          </span>
          <!-- The terminator: an ink disc crossing the moon, which is what
               actually produces the phases. -->
          <span class="terminator"></span>
        </span>

        <span class="instrument-read">Waxing gibbous · day 11</span>
      </div>

      <div class="instrument clock" use:reveal={{ variant: 'scale', index: 1 }}>
        <span class="instrument-label">Atomic clock</span>

        <span class="ring">
          {#each HOURS as hour (hour)}
            <span class="hour" style="--a: {hour * 15}deg">
              <b>{String(hour).padStart(2, '0')}</b>
            </span>
          {/each}
          <span class="hand"></span>
          <span class="pin"></span>
        </span>

        <span class="instrument-read">±0.00s · synced</span>
      </div>
    </div>
  </div>
</section>

<style>
  .dive {
    position: relative;
    overflow: hidden;
    padding: var(--section-y) 0;
    background: linear-gradient(160deg, var(--ink-800) 0%, var(--ink-900) 100%);
  }

  .inner {
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
    font-size: clamp(1.875rem, 3.8vw, 3rem);
    line-height: 1.08;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    margin: var(--space-sm) 0 0;
    padding: 0;
    list-style: none;
  }

  .chip {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.7rem 1rem;
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: var(--radius-md);
    background: rgb(255 255 255 / 4%);
    transition:
      border-color 400ms var(--ease-out),
      transform 400ms var(--ease-out);
  }

  .chip:hover {
    border-color: rgb(184 147 90 / 45%);
    transform: translateY(-2px);
  }

  .chip-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #fff;
  }

  .chip-note {
    font-size: 0.75rem;
    color: rgb(255 255 255 / 52%);
  }

  /* ---------------------------------------------------------------- panel */

  .panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .instrument {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: clamp(1.25rem, 2.4vw, 1.85rem) var(--space-md);
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: var(--radius-lg);
    background:
      radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 7%) 0%, transparent 60%),
      rgb(255 255 255 / 3%);
    text-align: center;
  }

  .instrument-label {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--brass-300);
  }

  .instrument-read {
    font-size: 0.75rem;
    color: rgb(255 255 255 / 55%);
    font-variant-numeric: tabular-nums;
  }

  /* ------------------------------------------------------------ moonphase */

  .aperture {
    position: relative;
    display: block;
    overflow: hidden;
    width: min(100%, 8.5rem);
    aspect-ratio: 1;
    border-radius: 50%;
    box-shadow:
      inset 0 0 0 1px rgb(184 147 90 / 45%),
      inset 0 2px 14px rgb(0 0 0 / 55%);
  }

  .sky {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 30%, #16233a 0%, #070d17 78%);
  }

  .moon {
    position: absolute;
    inset: 14%;
    border-radius: 50%;
    background: radial-gradient(circle at 36% 30%, #fdf6e6 0%, #e9dcc1 48%, #c9b896 100%);
  }

  /* The maria — soft darker patches on the moon's face. */
  .moon i {
    position: absolute;
    top: var(--y);
    left: var(--x);
    width: var(--d);
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgb(160 143 110 / 45%);
    filter: blur(1px);
    transform: translate(-50%, -50%);
  }

  /*
    The phase. An opaque disc the colour of the sky crosses the moon; where it
    overlaps, the moon is dark. Travelling a little more than twice the
    aperture's width covers new moon through full and back.
  */
  .terminator {
    position: absolute;
    top: -6%;
    left: 0;
    width: 112%;
    height: 112%;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 30%, #16233a 0%, #070d17 78%);
  }

  @media (prefers-reduced-motion: no-preference) {
    .terminator {
      animation: moon-phase 24s ease-in-out infinite;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /* Held at the gibbous the readout names. */
    .terminator {
      transform: translateX(-82%);
    }
  }

  @keyframes moon-phase {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  /* ---------------------------------------------------------------- clock */

  .ring {
    position: relative;
    display: block;
    width: min(100%, 8.5rem);
    aspect-ratio: 1;
    border: 1px solid rgb(255 255 255 / 14%);
    border-radius: 50%;
    background:
      repeating-conic-gradient(
        from 0deg,
        rgb(255 255 255 / 22%) 0deg 0.4deg,
        transparent 0.4deg 15deg
      ),
      radial-gradient(circle at 50% 34%, rgb(255 255 255 / 6%) 0%, transparent 62%);
  }

  /* Each label is rotated out to the ring, then counter-rotated so it reads
     upright rather than lying on the circumference. */
  .hour {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: rotate(var(--a)) translateY(-3.05rem) rotate(calc(var(--a) * -1));
  }

  .hour b {
    display: block;
    font-size: 0.5625rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: rgb(255 255 255 / 48%);
    transform: translate(-50%, -50%);
    font-variant-numeric: tabular-nums;
  }

  .hand {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1.5px;
    height: 38%;
    border-radius: 2px;
    background: linear-gradient(var(--color-primary), var(--brass-200));
    transform-origin: 50% 100%;
    transform: translate(-50%, -100%);
  }

  @media (prefers-reduced-motion: no-preference) {
    .hand {
      animation: sweep 60s linear infinite;
    }
  }

  @keyframes sweep {
    to {
      transform: translate(-50%, -100%) rotate(360deg);
    }
  }

  .pin {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: var(--color-primary);
    transform: translate(-50%, -50%);
  }

  /* --------------------------------------------------------------- narrow */

  @media (max-width: 62rem) {
    .inner {
      grid-template-columns: minmax(0, 1fr);
    }

    .panel {
      max-width: 30rem;
      margin-inline: auto;
    }
  }

  @media (max-width: 26rem) {
    .panel {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
