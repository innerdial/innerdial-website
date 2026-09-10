<script>
  /**
   * Loads a screen on demand.
   *
   * The console pulls in the Supabase client and Chart.js — around a third of a
   * megabyte that a visitor to the marketing homepage has no use for. Importing
   * admin screens through here keeps them in their own chunk, fetched the first
   * time someone actually opens /admin. The account area is the same argument:
   * signing in and managing a membership need Supabase, and someone reading the
   * homepage does not.
   *
   * The guard is loaded alongside rather than imported at the top of App.svelte,
   * because it reaches the session module and would drag Supabase back into the
   * main bundle on its own.
   */
  import { untrack } from 'svelte';
  import Loader from '$lib/components/Loader.svelte';

  /**
   * Two gates, because there are two questions. `session` asks only whether
   * someone is signed in, which is what the account area needs; `admin` asks
   * the further one the console needs. A collector sent through the admin gate
   * would be told they lack privileges they were never asking for.
   *
   * @type {{ load: () => Promise<any>, guard?: 'admin' | 'session' | null }}
   */
  let { load, guard = null } = $props();

  const GATES = {
    admin: () => import('$lib/components/RequireAdmin.svelte'),
    session: () => import('$lib/components/RequireSession.svelte'),
  };

  // Read once and deliberately: a route's screen does not change under it, and
  // re-running the import on a prop change would refetch the chunk for nothing.
  const chunk = untrack(() => Promise.all([load(), guard ? GATES[guard]() : null])).catch(
    (error) => {
      console.error('[router] could not load screen:', error);
      throw error;
    },
  );
</script>

{#await chunk}
  <Loader label="Loading" />
{:then [page, gate]}
  {@const Page = page.default}
  {#if gate}
    {@const Gate = gate.default}
    <Gate><Page /></Gate>
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
