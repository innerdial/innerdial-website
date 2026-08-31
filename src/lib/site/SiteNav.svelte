<script>
  import { appConfig } from '$lib/utils/config.js';

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
</header>

<style>
  .sentinel {
    position: absolute;
    top: 0;
    height: 1px;
    width: 100%;
  }

  .nav {
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

  .inner {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    min-height: 4.75rem;
    transition: min-height 420ms var(--ease-out);
  }

  .nav.condensed .inner {
    min-height: 4rem;
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
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--space-sm);
  }

  /* The bar's own CTA is smaller than the page's — it is a way back to the
     offer, not the offer itself. */
  .actions :global(.btn.compact) {
    min-height: 2.75rem;
    padding: 0 1.15rem;
    font-size: 0.875rem;
    background: var(--color-primary);
    color: var(--ink-900);
  }

  .actions :global(.btn.compact:hover) {
    background: var(--brass-300);
  }

  .nav.condensed .actions :global(.btn.compact) {
    background: var(--color-ink);
    color: #fff;
  }

  .nav.condensed .actions :global(.btn.compact:hover) {
    background: var(--color-ink-hover);
  }

  .burger {
    display: none;
    flex-direction: column;
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
    margin-inline: auto;
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

    .inner {
      flex-wrap: wrap;
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

  @media (max-width: 30rem) {
    .actions :global(.btn.compact) {
      display: none;
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
