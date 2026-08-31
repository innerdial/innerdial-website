<script>
  import '$lib/site/site.css';

  import DiveDocuments from '$lib/site/DiveDocuments.svelte';
  import DivePrivacy from '$lib/site/DivePrivacy.svelte';
  import DiveTools from '$lib/site/DiveTools.svelte';
  import Features from '$lib/site/Features.svelte';
  import FinalCta from '$lib/site/FinalCta.svelte';
  import Hero from '$lib/site/Hero.svelte';
  import Introduction from '$lib/site/Introduction.svelte';
  import Membership from '$lib/site/Membership.svelte';
  import Showcase from '$lib/site/Showcase.svelte';
  import SiteFooter from '$lib/site/SiteFooter.svelte';
  import SiteNav from '$lib/site/SiteNav.svelte';
  import WhyInnerdial from '$lib/site/WhyInnerdial.svelte';
  import { appConfig } from '$lib/utils/config.js';

  /**
   * The public landing page.
   *
   * The order is an argument, not a list of sections: what it is (hero), why
   * that matters (introduction), what is in it (features), what using it looks
   * like (showcase), what goes wrong without it (why), three things worth
   * dwelling on (the dives), what it costs (membership), and the ask.
   *
   * Sections own their own motion. This file only composes them, so a section
   * can be reordered or cut without unpicking a shared timeline.
   */

  const TITLE = `${appConfig.appName} — The record your watches never had`;
  const DESCRIPTION =
    'A private vault for watch collectors. Serials, papers, provenance, service history and every day on the wrist — one record, kept properly.';
</script>

<svelte:head>
  <title>{TITLE}</title>
  <meta name="description" content={DESCRIPTION} />
  <meta name="theme-color" content="#0e1b2c" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={TITLE} />
  <meta property="og:description" content={DESCRIPTION} />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <!--
    600 and 700 are what the app loads, plus the italics the site's accent
    words are set in. Nothing else — every extra weight is a separate file on
    the critical path.
  -->
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="site">
  <a class="skip" href="#main">Skip to content</a>

  <SiteNav />

  <main id="main">
    <Hero />
    <Introduction />
    <Features />
    <Showcase />
    <WhyInnerdial />
    <DiveDocuments />
    <DiveTools />
    <DivePrivacy />
    <Membership />
    <FinalCta />
  </main>

  <SiteFooter />
</div>

<style>
  /*
    The nav is fixed, so an anchor jump would otherwise land the target's
    heading underneath it. Applied to the sections rather than the root because
    the hero is the one target that should sit flush against the top.
  */
  .site :global(section[id]) {
    scroll-margin-top: 5rem;
  }

  .site :global(#top) {
    scroll-margin-top: 0;
  }

  .skip {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 100;
    padding: var(--space-sm) var(--space-md);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    background: var(--color-ink);
    color: #fff;
    font-size: 0.875rem;
    text-decoration: none;
    transform: translate(-50%, -110%);
    transition: transform 200ms var(--ease-out);
  }

  .skip:focus-visible {
    transform: translate(-50%, 0);
    outline: 3px solid rgb(184 147 90 / 45%);
    outline-offset: -3px;
  }
</style>
