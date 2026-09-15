<script>
  import Backdrop from '$lib/site/Backdrop.svelte';
  import DialMotif from '$lib/site/DialMotif.svelte';
  import { PLAN_TRIAL_NOTE } from '$lib/site/plan.js';
  import { magnetic, reveal } from '$lib/site/motion.js';

  /**
   * The close.
   *
   * Ink, the mark at full size behind the words, and one thing to do. It
   * deliberately echoes the hero's ground so the page ends where it opened —
   * the last section should feel like the first one answered.
   */
</script>

<section class="cta on-ink" aria-labelledby="cta-heading">
  <Backdrop tone="ink" glow="none" fade="radial" cell={72} drift />

  <span class="motif" aria-hidden="true"><DialMotif opacity={0.16} /></span>
  <span class="bloom" aria-hidden="true"></span>

  <div class="shell inner">
    <p class="eyebrow" use:reveal={{ variant: 'fade' }}>Begin</p>

    <h2 id="cta-heading">
      <span class="reveal-line" use:reveal={{ variant: 'clip', index: 1 }}>
        <span>Your collection deserves</span>
      </span>
      <span class="reveal-line" use:reveal={{ variant: 'clip', index: 2 }}>
        <span>a <em class="accent">record</em> as considered</span>
      </span>
      <span class="reveal-line" use:reveal={{ variant: 'clip', index: 3 }}>
        <span>as the watches in it.</span>
      </span>
    </h2>

    <p class="lede" use:reveal={{ variant: 'up', index: 5 }}>
      Enter one piece tonight, or bring the whole collection across in an
      afternoon. Either way, it is written down from here.
    </p>

    <div class="actions" use:reveal={{ variant: 'up', index: 6 }}>
      <a class="btn btn-primary" href="#membership" use:magnetic><span>Begin your collection</span></a>
      <a class="btn btn-secondary" href="#features"><span>Look through it first</span></a>
    </div>

    <p class="note" use:reveal={{ variant: 'fade', index: 7 }}>{PLAN_TRIAL_NOTE}</p>
  </div>
</section>

<style>
  .cta {
    position: relative;
    overflow: hidden;
    padding: clamp(5rem, 13vw, 10rem) 0;
    background: linear-gradient(200deg, var(--ink-700) 0%, var(--ink-800) 44%, var(--ink-900) 100%);
    isolation: isolate;
  }

  .motif {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 0;
    display: block;
    width: min(130vh, 62rem);
    aspect-ratio: 1;
    color: var(--brass-300);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .bloom {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 0;
    width: 54rem;
    height: 54rem;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(184 147 90 / 18%) 0%,
      rgb(184 147 90 / 6%) 40%,
      transparent 68%
    );
    filter: blur(18px);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-lg);
    text-align: center;
  }

  h2 {
    margin: 0;
    font-size: clamp(2.25rem, 5.6vw, 4.5rem);
    line-height: 1.04;
    letter-spacing: -0.025em;
  }

  h2 .reveal-line {
    display: block;
  }

  h2 em {
    font-style: italic;
  }

  .lede {
    margin: 0;
    max-width: 34rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-sm);
  }

  .note {
    margin: 0;
    font-size: 0.8125rem;
    color: rgb(255 255 255 / 46%);
  }
</style>
