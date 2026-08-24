<script>
  import { appConfig } from '$lib/utils/config.js';
</script>

<svelte:head>
  <title>{appConfig.appName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main class="page">
  <header class="nav">
    <img src="/images/innerdial_logo.svg" alt="" width="40" height="40" />
    <span class="brand">{appConfig.appName}</span>
  </header>

  <section class="hero" aria-labelledby="hero-heading">
    <p class="eyebrow">For the serious collector</p>
    <h1 id="hero-heading">The record your watches never had.</h1>
    <p class="lede">
      Serials, papers, provenance — every piece, accounted for. Privately.
    </p>
  </section>

  <section class="features" aria-label="What Innerdial holds">
    <article class="card">
      <h2>Every dial marks a moment</h2>
      <p>The gift, the milestone, the heirloom — remembered, packed, and tracked wherever you travel.</p>
    </article>
    <article class="card">
      <h2>Built for the serious</h2>
      <p>Insurance-ready reports, service tracking, a watchmaker’s care guide — open to every collector.</p>
    </article>
    <article class="card">
      <h2>Yours, privately</h2>
      <p>A vault for the collection. Not a feed. Not a marketplace.</p>
    </article>
  </section>
</main>

<style>
  .page {
    --font-serif: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    min-height: 100dvh;
    background: var(--color-background);
    color: var(--color-text);
  }

  .nav {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--space-xl);
    border-bottom: 1px solid var(--color-border);
  }

  .nav img {
    display: block;
  }

  .brand {
    font-family: var(--font-serif);
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .hero {
    max-width: 40rem;
    padding: var(--space-xl) var(--space-xl) var(--space-lg);
  }

  .eyebrow {
    margin: 0 0 var(--space-sm);
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  h1 {
    margin: 0 0 var(--space-md);
    font-family: var(--font-serif);
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 600;
    line-height: 1.15;
    color: var(--color-ink);
  }

  .lede {
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .features {
    display: grid;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-xl) var(--space-xl);
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  }

  .card {
    padding: var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .card h2 {
    margin: 0 0 var(--space-sm);
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .card p {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }
</style>
