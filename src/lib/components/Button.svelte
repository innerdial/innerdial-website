<script>
  /**
   * The console's button, in the four jobs it has: the primary action on a form,
   * the quieter one beside it, a destructive one, and a bare text action inside
   * a table row.
   */

  /**
   * @type {{
   *   variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
   *   type?: 'button' | 'submit',
   *   size?: 'md' | 'sm',
   *   disabled?: boolean,
   *   onclick?: (event: MouseEvent) => void,
   *   children?: any,
   * }}
   */
  let {
    variant = 'secondary',
    type = 'button',
    size = 'md',
    disabled = false,
    onclick,
    children,
    ...rest
  } = $props();
</script>

<button class="btn {variant} {size}" {type} {disabled} {onclick} {...rest}>
  {@render children?.()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 0.14s ease,
      border-color 0.14s ease,
      color 0.14s ease;
  }

  .btn.sm {
    padding: 0.3125rem var(--space-sm);
    font-size: 0.8125rem;
  }

  .btn:focus-visible {
    outline: 3px solid rgb(184 147 90 / 24%);
    outline-offset: 2px;
  }

  .btn:disabled {
    cursor: default;
    opacity: 0.55;
  }

  .primary {
    background: var(--color-primary);
    color: #fff;
  }

  .primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
  }

  .secondary {
    border-color: var(--color-border);
    background: var(--color-background);
    color: var(--color-ink);
  }

  .secondary:hover:not(:disabled) {
    border-color: #bebdb9;
    background: rgb(10 10 10 / 3%);
  }

  .danger {
    border-color: color-mix(in srgb, var(--color-danger) 32%, var(--color-border));
    background: var(--color-background);
    color: var(--color-danger);
  }

  .danger:hover:not(:disabled) {
    background: var(--color-danger);
    border-color: var(--color-danger);
    color: #fff;
  }

  .ghost {
    padding-left: var(--space-xs);
    padding-right: var(--space-xs);
    background: none;
    color: var(--color-text-muted);
  }

  .ghost:hover:not(:disabled) {
    color: var(--color-ink);
  }
</style>
