<script>
  /** A titled card. Every screen's content sits in one of these. */
  let { title = '', hint = '', actions, children } = $props();
</script>

<section class="panel">
  {#if title || actions}
    <header class="panel-head">
      <div class="panel-copy">
        {#if title}<h2>{title}</h2>{/if}
        {#if hint}<p class="hint">{hint}</p>{/if}
      </div>
      {#if actions}
        <div class="panel-actions">{@render actions()}</div>
      {/if}
    </header>
  {/if}

  {@render children?.()}
</section>

<style>
  .panel {
    padding: var(--space-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background);
  }

  .panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
    flex-wrap: wrap;
    margin-bottom: var(--space-md);
  }

  .panel-copy {
    min-width: 0;
  }

  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .hint {
    margin: var(--space-xs) 0 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .panel-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
</style>
