<script>
  import { appConfig } from '$lib/utils/config.js';

  /**
   * The footer.
   *
   * Quiet on purpose — the closing CTA above it does the asking, and a footer
   * that competes with it only gives the eye somewhere else to go. Links point
   * at sections that exist on this page today; routes that have not been built
   * yet are not listed, because a dead link in a footer is the cheapest way to
   * look unfinished.
   */

  const COLUMNS = [
    {
      id: 'product',
      title: 'Product',
      links: [
        { label: 'The vault', href: '#vault' },
        { label: 'Features', href: '#features' },
        { label: 'A walk through', href: '#showcase' },
        { label: 'Tools', href: '#tools' },
      ],
    },
    {
      id: 'why',
      title: 'Why Innerdial',
      links: [
        { label: 'What it solves', href: '#why' },
        { label: 'Privacy', href: '#privacy' },
        { label: 'Membership', href: '#membership' },
      ],
    },
  ];

  const year = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="shell inner">
    <div class="brand-block">
      <a class="brand" href="#top">
        <img src="/images/innerdial_logo.svg" alt="" width="40" height="40" />
        <span class="brand-name">{appConfig.appName}</span>
      </a>
      <p class="tagline">The record your watches never had.</p>
    </div>

    <nav class="columns" aria-label="Footer">
      {#each COLUMNS as column (column.id)}
        <div class="column">
          <h2 class="column-title">{column.title}</h2>
          <ul>
            {#each column.links as link (link.href)}
              <li><a href={link.href}>{link.label}</a></li>
            {/each}
          </ul>
        </div>
      {/each}

      <div class="column">
        <h2 class="column-title">Get started</h2>
        <ul>
          <li><a href="#membership">Founding membership</a></li>
          <li><a href="mailto:hello@innerdial.com">Talk to the founder</a></li>
        </ul>
      </div>
    </nav>
  </div>

  <div class="shell base">
    <p>© {year} {appConfig.appName}. All rights reserved.</p>
    <p class="made">Built for collectors, not for feeds.</p>
  </div>
</footer>

<style>
  .footer {
    padding: clamp(3rem, 6vw, 4.5rem) 0 var(--space-lg);
    background: var(--ink-900);
    color: rgb(255 255 255 / 58%);
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
    gap: clamp(2rem, 5vw, 4rem);
    padding-bottom: clamp(2rem, 4vw, 3rem);
  }

  .brand-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    text-decoration: none;
  }

  .brand img {
    display: block;
    border-radius: 50%;
  }

  .brand-name {
    font-family: var(--font-display);
    font-size: 1.625rem;
    font-weight: 600;
    color: #fff;
  }

  .tagline {
    margin: 0;
    max-width: 20rem;
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-style: italic;
    line-height: 1.35;
    color: var(--brass-300);
  }

  .columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr));
    gap: var(--space-lg);
  }

  .column-title {
    margin: 0 0 0.85rem;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgb(255 255 255 / 42%);
  }

  .column ul {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .column a {
    font-size: 0.9375rem;
    color: rgb(255 255 255 / 68%);
    text-decoration: none;
    transition: color 240ms var(--ease-out);
  }

  .column a:hover {
    color: var(--color-primary);
  }

  .column a:focus-visible,
  .brand:focus-visible {
    outline: 3px solid rgb(184 147 90 / 45%);
    outline-offset: 3px;
    border-radius: var(--radius-sm);
  }

  .base {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm) var(--space-md);
    padding-top: var(--space-lg);
    border-top: 1px solid rgb(255 255 255 / 10%);
    font-size: 0.8125rem;
  }

  .base p {
    margin: 0;
  }

  .made {
    color: rgb(255 255 255 / 38%);
  }

  @media (max-width: 52rem) {
    .inner {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
