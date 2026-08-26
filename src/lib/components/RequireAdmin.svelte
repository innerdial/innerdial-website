<script>
  /**
   * The gate in front of every admin screen.
   *
   * It is a convenience, not the security boundary — that is RLS. Without a row
   * in `admin_users` every query behind this guard returns nothing and every
   * analytics function raises, whatever the browser is persuaded to render. What
   * this buys is an honest message instead of four failed requests.
   */
  import { navigate } from 'svelte-routing';
  import { adminStatus, initAuth, isAuthReady, isSignedIn } from '$lib/auth/session.svelte.js';
  import Loader from '$lib/components/Loader.svelte';

  let { children } = $props();

  initAuth();

  $effect(() => {
    if (isAuthReady() && !isSignedIn()) {
      navigate('/admin/login', { replace: true });
    }
  });
</script>

{#if !isAuthReady()}
  <Loader label="Restoring your session" />
{:else if !isSignedIn()}
  <Loader label="Redirecting to sign in" />
{:else if adminStatus() === null}
  <Loader label="Checking your access" />
{:else if adminStatus() === false}
  <div class="notice">
    <h1>Not an admin account</h1>
    <p>
      This account can sign in to Innerdial, but it does not hold console privileges. An existing
      admin can grant them by adding a row to <code>admin_users</code>.
    </p>
    <a class="notice-link" href="/admin/login">Sign in as someone else</a>
  </div>
{:else}
  {@render children?.()}
{/if}

<style>
  .notice {
    max-width: 34rem;
    margin: 12dvh auto;
    padding: var(--space-xl);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background);
    text-align: center;
  }

  .notice h1 {
    margin: 0 0 var(--space-sm);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .notice p {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-text-muted);
  }

  code {
    padding: 0.1em 0.35em;
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    font-size: 0.875em;
    color: var(--color-text);
  }

  .notice-link {
    display: inline-block;
    margin-top: var(--space-lg);
    color: var(--color-primary);
    font-size: 0.9375rem;
    font-weight: 500;
  }
</style>
