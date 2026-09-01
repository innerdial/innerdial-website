<script>
  import { onMount } from 'svelte';

  import { createAmbience } from '$lib/site/ambience.js';

  /**
   * The sound control.
   *
   * It starts off, and that is not a hedge — no browser will play audible sound
   * before a gesture, so a page that wants music has to ask for it either way.
   * Given the ask has to happen, the honest version is a control the visitor
   * presses rather than a listener that waits for their first scroll and then
   * plays sound they did not request.
   *
   * What the button draws is the state: four bars breathing when the bed is
   * running, collapsed to a flat rule when it is not.
   *
   * Colour comes from `--sound-fg`, which the nav sets — the bar is transparent
   * over the hero's ink ground and frosted white once the page moves, and the
   * glyph has to follow it without this component knowing which is the case.
   */

  const STORE_KEY = 'innerdial.sound';
  const HINT_KEY = 'innerdial.sound.hinted';

  /** How long the first-visit hint stays up before withdrawing itself. */
  const HINT_DELAY = 1600;
  const HINT_LIFE = 7000;

  /** The gestures that count as permission to start a suspended context. */
  const GESTURES = ['pointerdown', 'keydown', 'touchstart'];

  /**
   * @param {string} key
   * @returns {string | null}
   */
  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      // Safari in private browsing throws on access rather than returning
      // null. "No preference stored" is a perfectly good answer, and there is
      // nothing here worth telling the visitor about.
      return null;
    }
  }

  /**
   * @param {string} key
   * @param {string} value
   */
  function write(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage is unavailable or full. The choice still holds for this visit,
      // it simply will not survive into the next one — which is a smaller
      // failure than refusing to honour the click at all.
      return false;
    }
    return true;
  }

  const ambience = createAmbience();

  /** The visitor's intent, which is what the button reports. */
  let on = $state(false);
  let hinting = $state(false);

  function dismissHint() {
    hinting = false;
    write(HINT_KEY, '1');
  }

  async function turnOn() {
    on = await ambience.start();
  }

  function toggle() {
    dismissHint();

    if (on) {
      on = false;
      ambience.stop();
      write(STORE_KEY, 'off');
      return;
    }

    write(STORE_KEY, 'on');
    turnOn();
  }

  onMount(() => {
    /** @type {(() => void)[]} */
    const cleanups = [];

    /*
      A returning visitor who left the sound on gets it back — but not at load.
      The context is suspended until a gesture unlocks it, so the resume waits
      for the first click or key and happens then. Deliberately not `scroll`:
      it is not an activation gesture in most browsers, and starting music
      under someone who only moved the page is the behaviour this control
      exists to avoid.
    */
    if (read(STORE_KEY) === 'on') {
      const resume = () => {
        for (const cleanup of cleanups.splice(0)) {
          cleanup();
        }
        turnOn();
      };

      for (const gesture of GESTURES) {
        addEventListener(gesture, resume, { once: true, passive: true });
        cleanups.push(() => removeEventListener(gesture, resume));
      }
    } else if (!read(HINT_KEY)) {
      // First visit, no choice on record: say once that the sound is there.
      // Late enough that it arrives after the hero has settled rather than
      // competing with it.
      const show = setTimeout(() => {
        hinting = true;
      }, HINT_DELAY);
      const hide = setTimeout(dismissHint, HINT_DELAY + HINT_LIFE);
      cleanups.push(() => {
        clearTimeout(show);
        clearTimeout(hide);
      });
    }

    /*
      A background tab should be silent. The bed is fading and suspending, not
      stopping: `on` is untouched, so the button still reads as on and the
      sound comes back with the tab.
    */
    const onVisibility = () => {
      if (!on) {
        return;
      }
      if (document.visibilityState === 'hidden') {
        ambience.stop();
      } else {
        ambience.start();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility));

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
      ambience.destroy();
    };
  });
</script>

<div class="slot">
  <button
    class="sound"
    class:on
    type="button"
    aria-pressed={on}
    aria-label={on ? 'Turn off ambient sound' : 'Play ambient sound'}
    title={on ? 'Sound on' : 'Sound off'}
    onclick={toggle}
  >
    <span class="eq" aria-hidden="true">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </span>
  </button>

  <!-- Outside the button, so it is never read as part of its name. -->
  {#if hinting}
    <span class="hint" aria-hidden="true">Sound</span>
  {/if}
</div>

<style>
  .slot {
    position: relative;
    display: flex;
    align-items: center;
  }

  /*
    44px of target around an 18px glyph, matching the burger beside it. Centred
    rather than left to flex-start, or the bars sit high in the box and read as
    misaligned against the wordmark.
  */
  .sound {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  .sound:focus-visible {
    outline: 3px solid rgb(184 147 90 / 45%);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  .eq {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 1.125rem;
  }

  /*
    The bars are full height and scaled down, never resized: `height` is a
    layout property and animating four of them forever would put the nav into
    layout on every frame. `scaleY` is the compositor's own.
  */
  .bar {
    width: 2px;
    height: 100%;
    border-radius: 2px;
    /* Set by the nav, which knows whether the bar is over ink or paper. */
    background: var(--sound-fg, #fff);
    transform: scaleY(0.14);
    transition:
      transform 520ms var(--ease-out),
      background 420ms var(--ease-out);
  }

  .sound:hover .bar {
    transform: scaleY(0.3);
  }

  /*
    Four rates that do not divide into each other, for the same reason the
    voices use six: bars on a common multiple march in step and read as a
    loading spinner rather than sound.
  */
  .sound.on .bar {
    animation: eq 1.7s var(--ease-out) infinite alternate;
    background: var(--color-primary);
  }

  .sound.on .bar:nth-child(1) {
    animation-duration: 1.9s;
  }

  .sound.on .bar:nth-child(2) {
    animation-duration: 1.1s;
  }

  .sound.on .bar:nth-child(3) {
    animation-duration: 2.3s;
  }

  .sound.on .bar:nth-child(4) {
    animation-duration: 1.4s;
  }

  @keyframes eq {
    from {
      transform: scaleY(0.18);
    }

    to {
      transform: scaleY(1);
    }
  }

  /* ------------------------------------------------------------------ hint */

  .hint {
    position: absolute;
    top: calc(100% - 0.35rem);
    right: 0;
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-full, 9999px);
    /* Brass on ink reads on both of the bar's grounds, so the hint needs no
       state of its own to follow. */
    background: var(--color-primary);
    color: var(--ink-900);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: var(--shadow-sm);
    animation: hint-in 520ms var(--ease-out) both;
  }

  @keyframes hint-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /*
    Reduced motion takes the animation, not the information. The bars hold a
    staggered profile so "on" is still legible at a glance, and the hint simply
    appears.
  */
  @media (prefers-reduced-motion: reduce) {
    .bar,
    .sound.on .bar {
      animation: none;
      transition-duration: 1ms;
    }

    .sound.on .bar:nth-child(1) {
      transform: scaleY(0.5);
    }

    .sound.on .bar:nth-child(2) {
      transform: scaleY(1);
    }

    .sound.on .bar:nth-child(3) {
      transform: scaleY(0.36);
    }

    .sound.on .bar:nth-child(4) {
      transform: scaleY(0.72);
    }

    .hint {
      animation: none;
    }
  }
</style>
