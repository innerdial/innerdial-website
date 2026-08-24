<script>
  import { appConfig } from '$lib/utils/config.js';
</script>

<svelte:head>
  <title>Admin · {appConfig.appName}</title>
</svelte:head>

<div class="shell">
  <header class="bar">
    <img src="/images/innerdial_logo.svg" alt="" width="32" height="32" />
    <div class="bar-copy">
      <p class="eyebrow">Innerdial</p>
      <h1>Admin</h1>
    </div>
  </header>

  <main class="content">
    <section class="panel" aria-labelledby="admin-heading">
      <h2 id="admin-heading">Console</h2>
      <p>Operations for the collector app live here. Screens will land under <code>/admin</code>.</p>
    </section>
  </main>
</div>

<style>
  .shell {
    min-height: 100dvh;
    background: var(--color-background);
    color: var(--color-text);
  }

  .bar {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    background: var(--color-ink);
    color: #fff;
  }

  .bar img {
    display: block;
    flex: 0 0 auto;
  }

  .bar-copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .eyebrow {
    margin: 0;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  h1 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .content {
    padding: var(--space-lg);
  }

  .panel {
    max-width: 40rem;
    padding: var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .panel h2 {
    margin: 0 0 var(--space-sm);
    font-size: 1.0625rem;
    font-weight: 600;
  }

  .panel p {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  code {
    font-size: 0.875em;
    color: var(--color-text);
  }
</style>
