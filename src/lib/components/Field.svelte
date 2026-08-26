<script>
  /**
   * A labelled form control.
   *
   * The control itself is passed in rather than described by props — the forms
   * here need inputs, selects, textareas and file pickers, and a component that
   * switched between them on a `kind` string would be four components wearing
   * one name. What this owns is the label, the hint, the error and the styling
   * every control shares.
   */

  /**
   * @type {{
   *   label: string,
   *   id: string,
   *   hint?: string,
   *   error?: string,
   *   required?: boolean,
   *   children?: any,
   * }}
   */
  let { label, id, hint = '', error = '', required = false, children } = $props();
</script>

<div class="field" class:invalid={Boolean(error)}>
  <label for={id}>
    {label}
    {#if required}<span class="required" aria-hidden="true">*</span>{/if}
  </label>

  {@render children?.()}

  {#if error}
    <p class="message error" role="alert">{error}</p>
  {:else if hint}
    <p class="message">{hint}</p>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 0;
  }

  label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .required {
    color: var(--color-primary);
  }

  /*
    :global because the control is rendered by the calling screen. Centralising
    it here is the point: five forms should not each restate what an input looks
    like, and they cannot reach a scoped selector in this file.
  */
  .field :global(input[type='text']),
  .field :global(input[type='email']),
  .field :global(input[type='password']),
  .field :global(input[type='url']),
  .field :global(input[type='number']),
  .field :global(input[type='search']),
  .field :global(input[type='datetime-local']),
  .field :global(select),
  .field :global(textarea) {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    color: var(--color-text);
    font: inherit;
    font-size: 0.875rem;
    transition:
      border-color 0.14s ease,
      box-shadow 0.14s ease;
  }

  .field :global(textarea) {
    min-height: 6rem;
    line-height: 1.55;
    resize: vertical;
  }

  .field :global(input:focus),
  .field :global(select:focus),
  .field :global(textarea:focus) {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgb(184 147 90 / 18%);
  }

  .field.invalid :global(input),
  .field.invalid :global(select),
  .field.invalid :global(textarea) {
    border-color: var(--color-danger);
  }

  .field :global(input[type='file']) {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .message {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.45;
    color: var(--color-text-muted);
  }

  .message.error {
    color: var(--color-danger);
  }
</style>
