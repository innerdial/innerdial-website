<script>
  /**
   * One headline figure with the sentence that stops it being read wrong —
   * "1,204 users" means little without "＋38 in the last 7 days" beside it.
   */
  let { label = '', value = '—', note = '', accent = false } = $props();
</script>

<div class="stat" class:accent>
  <p class="stat-label">{label}</p>
  <p class="stat-value">{value}</p>
  {#if note}<p class="stat-note">{note}</p>{/if}
</div>

<style>
  .stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-md) var(--space-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background);
  }

  .stat.accent {
    border-color: color-mix(in srgb, var(--color-primary) 34%, var(--color-border));
    background: color-mix(in srgb, var(--color-primary) 7%, var(--color-background));
  }

  .stat-label {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .stat-value {
    margin: 0;
    font-size: clamp(1.5rem, 2.4vw, 1.875rem);
    font-weight: 600;
    line-height: 1.1;
    color: var(--color-ink);
    font-variant-numeric: tabular-nums;
  }

  .stat.accent .stat-value {
    color: color-mix(in srgb, var(--color-primary) 80%, var(--color-ink));
  }

  .stat-note {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.4;
    color: var(--color-text-muted);
  }
</style>
