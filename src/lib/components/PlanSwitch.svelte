<script>
  /**
   * Monthly or yearly — the one choice the membership offers.
   *
   * Native radios under the pill styling, so arrow keys, focus and the
   * screen-reader "1 of 2" all come from the browser rather than from here.
   * Used where one plan has to be picked — the account page's checkout. The
   * marketing page shows both plans side by side instead.
   *
   * @type {{
   *   value?: import('$lib/site/plan.js').BillingPeriod,
   *   disabled?: boolean,
   *   name?: string,
   * }}
   */
  import { PLAN_LIST } from '$lib/site/plan.js';

  let { value = $bindable('monthly'), disabled = false, name = 'billing-period' } = $props();
</script>

<div class="switch" role="radiogroup" aria-label="Billing period">
  {#each PLAN_LIST as plan (plan.id)}
    <label class:selected={value === plan.id} class:disabled>
      <input type="radio" {name} value={plan.id} bind:group={value} {disabled} />
      <span>{plan.label}</span>
      {#if plan.saving}
        <span class="saving">{plan.saving}</span>
      {/if}
    </label>
  {/each}
</div>

<style>
  .switch {
    display: inline-flex;
    gap: 0.25rem;
    padding: 0.25rem;
    border: 1px solid var(--color-border);
    border-radius: 9999px;
    background: var(--color-background);
  }

  label {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    border-radius: 9999px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: background 0.14s ease, color 0.14s ease;
  }

  label:hover:not(.disabled):not(.selected) {
    color: var(--color-ink);
  }

  label.selected {
    background: var(--color-ink);
    color: #fff;
  }

  label.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Hidden but still focusable and announced; the label is what is seen. */
  input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }

  label:has(input:focus-visible) {
    outline: 3px solid rgb(184 147 90 / 45%);
    outline-offset: 2px;
  }

  .saving {
    padding: 0.1rem 0.45rem;
    border-radius: 9999px;
    background: rgb(184 147 90 / 16%);
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-primary-hover);
  }

  label.selected .saving {
    background: rgb(184 147 90 / 28%);
    color: var(--color-primary);
  }
</style>
