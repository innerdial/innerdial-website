<script>
  import { onMount } from 'svelte';

  import { appConfig } from '$lib/utils/config.js';
  import { pageProgress } from '$lib/site/motion.js';
  import { hasSessionHint } from '$lib/site/session-hint.js';
  import SoundToggle from '$lib/site/SoundToggle.svelte';

  /**
   * The site header.
   *
   * It starts transparent over the hero's ink ground and condenses into a
   * frosted bar once the page moves. The state comes from an
   * IntersectionObserver on a sentinel at the very top rather than a scroll
   * handler — the browser reports the crossing itself, so nothing runs on the
   * frames in between.
   */

  const LINKS = [
    { label: 'The vault', href: '#vault' },
    { label: 'Features', href: '#features' },
    { label: 'Tools', href: '#tools' },
    { label: 'Membership', href: '#membership' },
  ];

  let condensed = $state(false);
  let menuOpen = $state(false);

  /*
    Whether to offer the account or the way in to it — a storage hint, not the
    session module; see `hasSessionHint`. In an effect rather than at module
    scope because the server-rendered and first client render must agree, and
    storage is not readable in the first.
  */
  let signedIn = $state(false);

  onMount(() => {
    signedIn = hasSessionHint();
  });

  /** @param {HTMLElement} node */
  function sentinel(node) {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        condensed = !entry.isIntersecting;
      },
      { threshold: 0 },
    );

    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }
</script>

<!-- Sits in the document flow at the top; the header above it is fixed. -->
<div class="sentinel" use:sentinel aria-hidden="true"></div>

<header class="nav" class:condensed class:open={menuOpen}>
  <div class="inner shell">
    <a class="brand" href="#top">
      <img src="/images/innerdial_logo.svg" alt="" width="36" height="36" />
      <span class="brand-name">{appConfig.appName}</span>
    </a>

    <nav class="links" aria-label="Sections">
      <!-- One wrapper, so the mobile sheet has a single grid row to collapse. -->
      <div class="links-inner">
        {#each LINKS as link (link.href)}
          <a href={link.href} onclick={() => (menuOpen = false)}>{link.label}</a>
        {/each}
      </div>
    </nav>

    <div class="actions">
      <SoundToggle />

      <!--
        A plain anchor, not a routed Link: /login and /account are their own
        bundle, so the navigation fetches a chunk either way and a full document
        load is the simpler thing that cannot go stale.

        Styled as the site's secondary button so the bar ends in a matched pair
        rather than a loose word pressed against a pill.
      -->
      <a class="btn btn-secondary compact" href={signedIn ? '/account' : '/login'}>
        {signedIn ? 'Account' : 'Sign in'}
      </a>

      <a class="btn btn-primary compact" href="#membership">Begin your collection</a>
      <button
        class="burger"
        type="button"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onclick={() => (menuOpen = !menuOpen)}
      >
        <span></span>
        <span></span>
      </button>
    </div>
  </div>

  <!-- How far through the page the reader is. Sits on the bar's lower edge, so
       it doubles as the rule that separates the bar from the page. -->
  <span class="progress" use:pageProgress aria-hidden="true"></span>
</header>

<style>
  .sentinel {
    position: absolute;
    top: 0;
    height: 1px;
    width: 100%;
  }

  .nav {
    /*
      The bar's height, in one place. The wrapped layout needs it on the first
      flex line as well as on the container, and a second copy of the number is
      how the two drift apart.
    */
    --bar-h: 4.75rem;

    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 50;
    /* Transparent over the hero, so only the logo and links read. */
    background: transparent;
    border-bottom: 1px solid transparent;
    transition:
      background 420ms var(--ease-out),
      border-color 420ms var(--ease-out),
      backdrop-filter 420ms var(--ease-out);
  }

  .nav.condensed {
    background: rgb(255 255 255 / 82%);
    border-bottom-color: var(--color-border);
    backdrop-filter: blur(16px) saturate(160%);
  }

  /*
    An open menu needs a ground.

    Over the hero the bar is transparent on purpose — there is nothing to
    separate it from, and the wordmark reads against the ink on its own. That
    holds right up until the sheet drops, at which point four links are lying
    directly on the hero's own headline with nothing in between. Condensed, the
    frosted white above already solves this; this is the same rule for the top
    of the page, drawn in the palette the top of the page is actually in.

    Ink rather than white because everything in the bar is still in its on-ink
    colours here: white links, a white outline on the secondary button, white
    burger. Reaching for the frosted white would mean restating all four.
  */
  .nav.open:not(.condensed) {
    background: rgb(7 15 25 / 94%);
    border-bottom-color: rgb(255 255 255 / 14%);
    backdrop-filter: blur(16px) saturate(140%);
  }

  .inner {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    min-height: var(--bar-h);
    transition: min-height 420ms var(--ease-out);
  }

  .nav.condensed {
    --bar-h: 4rem;
  }

  .brand {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
  }

  .brand img {
    display: block;
    /* The mark is a white disc with brass arcs — over ink it needs no help, but
       a soft ring keeps it from floating once the bar goes light. */
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgb(14 27 44 / 6%);
    transition: transform 420ms var(--ease-out);
  }

  .brand:hover img {
    transform: rotate(-14deg);
  }

  .brand-name {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #fff;
    transition: color 420ms var(--ease-out);
  }

  .nav.condensed .brand-name {
    color: var(--color-ink);
  }

  .links {
    flex: 1 1 auto;
  }

  .links-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(1rem, 2.4vw, 2.25rem);
  }

  .links a {
    position: relative;
    padding: 0.35rem 0;
    font-size: 0.9375rem;
    color: rgb(255 255 255 / 72%);
    text-decoration: none;
    transition: color 260ms var(--ease-out);
  }

  .nav.condensed .links a {
    color: var(--color-text-muted);
  }

  .links a:hover {
    color: #fff;
  }

  .nav.condensed .links a:hover {
    color: var(--color-ink);
  }

  /* A brass rule that wipes in from the left rather than simply appearing. */
  .links a::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 1px;
    background: var(--color-primary);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 320ms var(--ease-out);
  }

  .links a:hover::after {
    transform: scaleX(1);
  }

  .links a:focus-visible,
  .brand:focus-visible {
    outline: 3px solid rgb(184 147 90 / 45%);
    outline-offset: 4px;
    border-radius: var(--radius-sm);
  }

  .actions {
    /*
      The sound control draws itself in this colour. It is a custom property
      rather than a :global rule because the bar's two states are this
      component's business — the toggle only needs to be told the answer, and
      custom properties inherit into its scoped styles without either file
      reaching into the other.
    */
    --sound-fg: #fff;

    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--space-sm);
    /*
      Holds the actions against the right edge. Below the breakpoint the links
      wrap to their own row, which leaves the brand and the burger alone on the
      first one — without this they sit shoulder to shoulder on the left and
      the burger reads as part of the wordmark.
    */
    margin-left: auto;
  }

  /* --------------------------------------------------------------- progress */

  .progress {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(to right, var(--color-primary), var(--brass-200));
    /* `--progress` is written by the action on every rAF-coalesced scroll. */
    transform: scaleX(var(--progress, 0));
    transform-origin: left;
    opacity: 0;
    transition: opacity 420ms var(--ease-out);
  }

  /* Hidden over the hero, where there is no progress worth reporting yet. */
  .nav.condensed .progress {
    opacity: 1;
  }

  /*
    The bar ends in a pair: a way back to an existing membership and a way into
    a new one. Both are the site's button at the same height, radius and type
    size — smaller than the page's, because the bar is a reminder of the offer
    and not the offer itself — so the only difference left for the eye to read
    is which of them is filled.

    `.compact` carries the measurements the two share. Everything below it is
    colour, and colour is the one thing that has to change twice: once per
    variant, and again when the bar leaves the hero's ink for frosted white.
  */
  .actions :global(.btn.compact) {
    min-height: 2.75rem;
    padding: 0 1.15rem;
    font-size: 0.875rem;
    /* In step with the bar's own condense, so nothing snaps mid-scroll. Short
       enough that it still reads as a hover when that is what it is. */
    transition:
      background 260ms var(--ease-out),
      border-color 260ms var(--ease-out),
      color 260ms var(--ease-out);
  }

  .actions :global(.btn-primary.compact) {
    background: var(--color-primary);
    color: var(--ink-900);
  }

  .actions :global(.btn-primary.compact:hover) {
    background: var(--brass-300);
  }

  /*
    Over the hero the outline is the only thing drawing this button at all, so
    it takes the hairline the page uses on ink elsewhere. `.btn-secondary`'s own
    border is the paper one, which on navy is invisible.
  */
  .actions :global(.btn-secondary.compact) {
    border-color: rgb(255 255 255 / 26%);
    background: transparent;
    color: #fff;
  }

  .actions :global(.btn-secondary.compact:hover) {
    border-color: var(--brass-300);
    background: rgb(255 255 255 / 8%);
    color: #fff;
  }

  .nav.condensed .actions {
    --sound-fg: var(--color-ink);
  }

  .nav.condensed .actions :global(.btn-primary.compact) {
    background: var(--color-ink);
    color: #fff;
  }

  .nav.condensed .actions :global(.btn-primary.compact:hover) {
    background: var(--color-ink-hover);
  }

  .nav.condensed .actions :global(.btn-secondary.compact) {
    border-color: var(--color-border);
    color: var(--color-ink);
  }

  .nav.condensed .actions :global(.btn-secondary.compact:hover) {
    border-color: var(--color-primary);
    background: rgb(184 147 90 / 8%);
  }

  /*
    The button is 44px so the tap target meets the minimum, but the glyph it
    draws is only 8px tall. Without centring, the two bars stack at flex-start
    and the visible icon sits in the top 8px of the box — so the button reads
    as 18px too high next to the wordmark even though its own box is centred.
    Centre the content, not just the control.
  */
  .burger {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  .burger span {
    display: block;
    width: 1.25rem;
    height: 1.5px;
    border-radius: 2px;
    background: #fff;
    transition:
      transform 320ms var(--ease-out),
      background 420ms var(--ease-out);
  }

  .nav.condensed .burger span {
    background: var(--color-ink);
  }

  .nav.open .burger span:first-child {
    transform: translateY(3.25px) rotate(45deg);
  }

  .nav.open .burger span:last-child {
    transform: translateY(-3.25px) rotate(-45deg);
  }

  .burger:focus-visible {
    outline: 3px solid rgb(184 147 90 / 45%);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  /*
    Below the breakpoint the links leave the bar and become a sheet under it.
    `grid-template-rows: 0fr → 1fr` animates to the content's real height, which
    a max-height guess cannot do without either clipping or lurching.
  */
  @media (max-width: 60rem) {
    .burger {
      display: flex;
    }

    /*
      Two things have to be undone once the bar wraps onto two lines.

      The row gap applies between the flex lines even when the second one is
      collapsed to zero height, so a closed menu still added 24px to the bar —
      all of it below the logo, which left the brand and the burger pinned to
      the top of a bar 24px taller than its contents. Only the column gap is
      wanted here; `margin-left: auto` on `.actions` does the horizontal work
      anyway.

      And the lines have to be centred as a group. `align-content` defaults to
      `stretch` for a multi-line flex container, which hands the bar's spare
      height to both lines equally — so the first line grows downward and its
      contents come to rest above the bar's true centre.
    */
    .inner {
      flex-wrap: wrap;
      row-gap: 0;
      align-content: center;
    }

    /*
      The first line carries the bar's height itself, rather than inheriting it
      from the container. Once the menu opens, the container grows to fit the
      links and its `min-height` stops applying — so without this the top line
      collapsed to the burger's own 44px and the logo jumped 16px up the moment
      the menu was opened.
    */
    .brand,
    .actions {
      min-height: var(--bar-h);
      transition: min-height 420ms var(--ease-out);
    }

    .links {
      order: 3;
      flex-basis: 100%;
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 380ms var(--ease-out);
    }

    .nav.open .links {
      grid-template-rows: 1fr;
    }

    /*
      The single row that collapses. Its own overflow hides the links, and the
      padding lives on the anchors inside so there is nothing left to show once
      the row reaches 0fr.
    */
    .links-inner {
      display: block;
      overflow: hidden;
      min-height: 0;
    }

    .links a {
      display: block;
      padding: 0.85rem 0;
      border-bottom: 1px solid rgb(255 255 255 / 12%);
      font-size: 1rem;
    }

    .nav.condensed .links a {
      border-bottom-color: var(--color-border);
    }

    .links a::after {
      display: none;
    }

    /* Closed, the sheet must not swallow taps meant for the hero beneath. */
    .nav:not(.open) .links {
      pointer-events: none;
      visibility: hidden;
      transition:
        grid-template-rows 380ms var(--ease-out),
        visibility 0s linear 380ms;
    }
  }

  /*
    The offer is repeated all the way down the page, so the bar can afford to
    drop it here. The door to an existing membership appears once, so it stays —
    tightened, because the wordmark, the sound control and the burger are all
    still on this line.
  */
  @media (max-width: 30rem) {
    .actions :global(.btn-primary.compact) {
      display: none;
    }

    .actions :global(.btn-secondary.compact) {
      min-height: 2.5rem;
      padding: 0 0.85rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav,
    .inner,
    .brand img,
    .links,
    .links a,
    .links a::after,
    .burger span {
      transition-duration: 1ms;
    }
  }
</style>
