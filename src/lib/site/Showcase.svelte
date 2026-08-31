<script>
  import AppFrame from '$lib/site/AppFrame.svelte';
  import AppScreen from '$lib/site/AppScreen.svelte';
  import { reveal, scrollProgress } from '$lib/site/motion.js';

  /**
   * The pinned walkthrough.
   *
   * A tall section holds a `position: sticky` stage. As the page scrolls
   * through the section the stage stays put and the screens advance, so the
   * device reads as one continuous object being operated rather than four
   * separate pictures scrolling past.
   *
   * `scrollProgress` goes on the tall section, never on the sticky child: the
   * child does not move relative to the viewport and so has no progress of its
   * own to report.
   *
   * With reduced motion the section collapses to a plain stacked list — see the
   * `@media` block at the foot of the styles. There is no pin, no swap, and
   * every screen is simply shown next to the step it belongs to.
   */

  const STEPS = [
    {
      id: 'vault',
      screen: /** @type {const} */ ('vault'),
      title: 'Enter it once',
      body: 'Brand, reference, serial, movement, where it came from and what it cost. Photograph the papers while you are there — or import a spreadsheet and have the whole collection in at once.',
    },
    {
      id: 'dashboard',
      screen: /** @type {const} */ ('dashboard'),
      title: 'It becomes a record',
      body: 'The dashboard reads the collection back to you: what is due for service, what happened recently, and a note from the watchmaker worth knowing before you touch a crown.',
    },
    {
      id: 'wear',
      screen: /** @type {const} */ ('wear'),
      title: 'Live with the collection',
      body: 'Log what is on the wrist in a tap. Over a year it turns into the honest answer to the question every collector avoids: which of these do you actually wear?',
    },
    {
      id: 'tools',
      screen: /** @type {const} */ ('tools'),
      title: 'And the instruments',
      body: 'Set a moonphase to the day. Check the reference second. Measure what a movement gains across a week. Small tools, precisely built, for the details that matter.',
    },
  ];

  let progress = $state(0);

  /*
    Which step the scroll is on. The progress range is divided evenly and
    clamped at the last step — at exactly 1.0 the raw index would overrun the
    array by one.
  */
  const active = $derived(Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length)));
</script>

<section class="showcase" id="showcase" aria-labelledby="showcase-heading">
  <div class="track" use:scrollProgress={(value) => (progress = value)}>
    <div class="stage">
      <div class="shell inner">
        <div class="copy">
          <p class="eyebrow" use:reveal={{ variant: 'fade' }}>A walk through</p>
          <h2 id="showcase-heading" use:reveal={{ variant: 'up', index: 1 }}>
            From a drawer of watches to a <span class="accent">standing record</span>.
          </h2>

          <ol class="steps">
            {#each STEPS as step, i (step.id)}
              <li class="step" class:current={i === active} aria-current={i === active}>
                <span class="rail" aria-hidden="true"><span class="rail-fill"></span></span>
                <span class="step-body">
                  <span class="step-index">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <!-- The inner span is the single grid row the collapse
                       animates; a bare text node gives the grid an anonymous
                       item that cannot be given `min-height: 0`. -->
                  <p><span>{step.body}</span></p>
                </span>
              </li>
            {/each}
          </ol>
        </div>

        <div class="device-column">
          <div class="device">
            <AppFrame label="The Innerdial app, screen by screen">
              {#snippet children()}
                <div class="deck">
                  {#each STEPS as step, i (step.id)}
                    <div
                      class="slide"
                      class:current={i === active}
                      data-state={i === active ? 'current' : i < active ? 'past' : 'future'}
                    >
                      <AppScreen screen={step.screen} />
                    </div>
                  {/each}
                </div>
              {/snippet}
            </AppFrame>
          </div>

          <!-- Which screen of four, for anyone reading the section rather than
               scrolling it. -->
          <p class="counter" aria-live="polite">
            <span class="counter-now">{String(active + 1).padStart(2, '0')}</span>
            <span class="counter-total">/ {String(STEPS.length).padStart(2, '0')}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .showcase {
    position: relative;
    background: var(--paper);
    border-top: 1px solid var(--color-border);
  }

  /*
    The scroll runway. One viewport of travel per step, plus one for the stage
    to arrive and settle before the first swap.
  */
  .track {
    position: relative;
    height: 500vh;
  }

  .stage {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    height: 100vh;
    height: 100svh;
    /*
      The site header is fixed, so it hangs over the pinned stage and clipped
      the top of the device. Reserving its condensed height keeps the whole
      mockup below it for the entire length of the pin.
    */
    padding-top: 4rem;
    overflow: hidden;
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
    align-items: center;
    gap: clamp(2rem, 5vw, 5rem);
    width: 100%;
  }

  .copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .copy h2 {
    margin: var(--space-xs) 0 var(--space-sm);
    font-size: clamp(1.875rem, 3.6vw, 3rem);
    line-height: 1.08;
  }

  /* ---------------------------------------------------------------- steps */

  .steps {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: step;
  }

  .step {
    display: grid;
    grid-template-columns: 2px minmax(0, 1fr);
    gap: 0 var(--space-md);
    padding: 0.9rem 0;
  }

  /* The rail beside each step, filling brass as that step becomes current. */
  .rail {
    position: relative;
    display: block;
    width: 2px;
    border-radius: 2px;
    background: var(--color-border);
  }

  .rail-fill {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--color-primary);
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 620ms var(--ease-page);
  }

  .step.current .rail-fill {
    transform: scaleY(1);
  }

  .step-body {
    display: block;
    /* Dimmed until current — the eye should never have to decide which of four
       paragraphs is the one being illustrated. */
    opacity: 0.34;
    transform: translateX(-0.35rem);
    transition:
      opacity 520ms var(--ease-out),
      transform 520ms var(--ease-out);
  }

  .step.current .step-body {
    opacity: 1;
    transform: translateX(0);
  }

  .step-index {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    color: var(--color-primary);
  }

  .step h3 {
    margin: 0 0 0.3rem;
    font-size: clamp(1.25rem, 1.9vw, 1.625rem);
    line-height: 1.15;
  }

  .step p {
    margin: 0;
    max-width: 32rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-text-muted);
  }

  /*
    Collapsed until current. `grid-template-rows` interpolates to the real
    height, so the list breathes as the scroll moves without a hard-coded
    guess at how tall a paragraph is.
  */
  .step p {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 520ms var(--ease-out);
  }

  .step p span {
    overflow: hidden;
    min-height: 0;
  }

  .step.current p {
    grid-template-rows: 1fr;
  }

  /* --------------------------------------------------------------- device */

  .device-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }

  /*
    Width capped by the height it may spend: the stage is one viewport minus
    the header, and the counter sits under the device. The second term converts
    that height budget into the width that produces it.
  */
  .device {
    width: min(100%, 17rem, calc((100svh - 12rem) * 393 / 830));
  }

  .deck {
    position: relative;
    width: 100%;
    height: 100%;
  }

  /*
    All four screens are mounted and stacked. Swapping by class rather than by
    `{#if}` means no screen is rebuilt mid-scroll — the transition is pure
    compositing, and a fast scroll cannot outrun a remount.
  */
  .slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition:
      opacity 480ms var(--ease-out),
      transform 620ms var(--ease-page);
    /* Off-screen slides must not take pointer or assistive-tech attention. */
    visibility: hidden;
  }

  .slide[data-state='current'] {
    opacity: 1;
    visibility: visible;
    transform: translate3d(0, 0, 0) scale(1);
  }

  /* Screens already visited leave upward; ones still to come wait below. */
  .slide[data-state='past'] {
    transform: translate3d(0, -6%, 0) scale(0.97);
  }

  .slide[data-state='future'] {
    transform: translate3d(0, 6%, 0) scale(0.97);
  }

  .counter {
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.125rem;
    color: var(--color-text-muted);
  }

  .counter-now {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-primary);
  }

  /* --------------------------------------------------------------- narrow */

  @media (max-width: 62rem) {
    .inner {
      grid-template-columns: minmax(0, 1fr);
      justify-items: center;
      gap: var(--space-lg);
    }

    .copy {
      order: 2;
      width: 100%;
    }

    .device-column {
      order: 1;
      /*
        Load-bearing. `justify-items: center` above makes each grid item
        shrink to its content, and the device's own `width: min(100%, …)`
        then resolves its percentage against a parent that is itself sized by
        that child — the column collapses to a sliver. Claiming the track
        breaks the circle.
      */
      width: 100%;
    }

    /*
      The device is sized by the height it may spend, not the width: at the
      phone's aspect ratio every rem across costs two down, and the stage is a
      single viewport that must also hold the copy. The third term converts a
      height budget into the width that produces it.
    */
    .device {
      width: min(100%, 11rem, calc(42svh * 393 / 830));
    }

    /*
      One step at a time. Stacking four headings beside the device does not fit
      a short phone, and shrinking everything until it does makes the section
      unreadable rather than compact. The counter comes back to say where in
      the four you are.
    */
    .step:not(.current) {
      display: none;
    }

    .step {
      grid-template-columns: minmax(0, 1fr);
      padding: 0;
    }

    .rail {
      display: none;
    }

    .counter {
      display: flex;
      font-size: 0.9375rem;
    }

    .counter-now {
      font-size: 1.25rem;
    }

    .copy h2 {
      font-size: clamp(1.5rem, 6vw, 1.875rem);
    }

    .step h3 {
      font-size: 1.0625rem;
    }

    .step p {
      font-size: 0.8125rem;
    }
  }

  /*
    Reduced motion: `scrollProgress` reports 0 and never updates, which would
    otherwise leave a pinned section showing step one for five viewports of
    scrolling. Unpin it, drop the runway, and show every step at once.
  */
  @media (prefers-reduced-motion: reduce) {
    .track {
      height: auto;
    }

    .stage {
      position: static;
      height: auto;
      padding: var(--section-y) 0;
    }

    .step-body,
    .rail-fill {
      opacity: 1;
      transform: none;
    }

    .step p {
      grid-template-rows: 1fr;
    }

    .device-column {
      display: none;
    }
  }
</style>
