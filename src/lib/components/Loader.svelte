<script>
  /** A waiting state that says what it is waiting for. */
  let { label = 'Loading', inline = false } = $props();
</script>

<div class="loader" class:inline role="status">
  <span class="spinner" aria-hidden="true"></span>
  <span class="label">{label}…</span>
</div>

<style>
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-xl);
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .loader.inline {
    padding: var(--space-md);
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 2s;
    }
  }
</style>
