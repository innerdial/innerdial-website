<script>
  /**
   * Loads a screen on demand.
   *
   * The console pulls in the Supabase client and Chart.js — around a third of a
   * megabyte that a visitor to the marketing homepage has no use for. Importing
   * admin screens through here keeps them in their own chunk, fetched the first
   * time someone actually opens /admin.
   *
   * The guard is loaded alongside rather than imported at the top of App.svelte,
   * because it reaches the session module and would drag Supabase back into the
   * main bundle on its own.
   */
  import { untrack } from 'svelte';
  import Loader from '$lib/components/Loader.svelte';

  /** @type {{ load: () => Promise<any>, guarded?: boolean }} */
  let { load, guarded = false } = $props();

  // Read once and deliberately: a route's screen does not change under it, and
  // re-running the import on a prop change would refetch the chunk for nothing.
  const chunk = untrack(() =>
    Promise.all([load(), guarded ? import('$lib/components/RequireAdmin.svelte') : null]),
  ).catch((error) => {
    console.error('[router] could not load screen:', error);
    throw error;
  });
</script>

{#await chunk}
  <Loader label="Loading" />
{:then [page, guard]}
  {@const Page = page.default}
  {#if guard}
    {@const Guard = guard.default}
    <Guard><Page /></Guard>
  {:else}
    <Page />
  {/if}
{:catch}
  <p class="failed" role="alert">
    This screen could not be loaded. Check the connection and reload the page.
  </p>
{/await}

<style>
  .failed {
    max-width: 30rem;
    margin: 12dvh auto;
    padding: var(--space-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    text-align: center;
    font-size: 0.9375rem;
    color: var(--color-text-muted);
  }
</style>
