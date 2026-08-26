<script>
  /**
   * A short message about what just happened — a failed save, a completed one,
   * or a list with nothing in it yet.
   */

  /** @type {{ tone?: 'error' | 'success' | 'info', message?: string, children?: any }} */
  let { tone = 'info', message = '', children } = $props();
</script>

<p class="callout {tone}" role={tone === 'error' ? 'alert' : 'status'}>
  {#if children}{@render children()}{:else}{message}{/if}
</p>

<style>
  .callout {
    margin: 0;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text);
  }

  .callout.error {
    border-color: color-mix(in srgb, var(--color-danger) 32%, var(--color-border));
    background: color-mix(in srgb, var(--color-danger) 7%, var(--color-background));
    color: var(--color-danger);
  }

  .callout.success {
    border-color: color-mix(in srgb, var(--color-primary) 38%, var(--color-border));
    background: color-mix(in srgb, var(--color-primary) 9%, var(--color-background));
    color: color-mix(in srgb, var(--color-primary) 78%, var(--color-ink));
  }

  .callout.info {
    background: color-mix(in srgb, var(--color-surface) 45%, var(--color-background));
    color: var(--color-text-muted);
  }
</style>
