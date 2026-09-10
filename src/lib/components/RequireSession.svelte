<script>
  /**
   * The gate in front of the account area.
   *
   * It asks one question — is anyone signed in — and nothing about privilege.
   * Like `RequireAdmin` it is a courtesy rather than the security boundary:
   * every row behind it is reachable only through a policy keyed on
   * `auth.uid()`, and the subscription tables have no client write policy at
   * all. What this buys is a sign-in page instead of an empty account.
   *
   * Where the visitor was heading is carried through the redirect, so someone
   * who followed a link to their membership lands back on it rather than on the
   * account root having forgotten why they came.
   */
  import { navigate } from 'svelte-routing';
  import { initAuth, isAuthReady, isSignedIn } from '$lib/auth/session.svelte.js';
  import Loader from '$lib/components/Loader.svelte';

  let { children } = $props();

  initAuth();

  $effect(() => {
    if (isAuthReady() && !isSignedIn()) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`, { replace: true });
    }
  });
</script>

{#if !isAuthReady()}
  <Loader label="Restoring your session" />
{:else if !isSignedIn()}
  <Loader label="Redirecting to sign in" />
{:else}
  {@render children?.()}
{/if}
