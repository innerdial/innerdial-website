<script>
  /**
   * The way in to a collector's account.
   *
   * Sign-in only. Accounts are created in the app, which is where a collection
   * is entered and where the account is needed first — a second signup form
   * here would be a second place for an address to be typed wrongly, and would
   * let someone buy a membership for an account they have no app on.
   *
   * Separate from `/admin/login` on purpose. Both authenticate against the same
   * Supabase project, but the console's form signs an unprivileged session back
   * out; this one is happy to see anybody with an account.
   */
  import { navigate } from 'svelte-routing';

  import { appConfig } from '$lib/utils/config.js';
  import { initAuth, isAuthReady, isSignedIn, signIn } from '$lib/auth/session.svelte.js';
  import { errorMessage, isSupabaseConfigured } from '$lib/supabase/client.js';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Field from '$lib/components/Field.svelte';

  let email = $state('');
  let password = $state('');
  let submitting = $state(false);
  let error = $state('');

  initAuth();

  /**
   * Where to land afterwards.
   *
   * Read from the query string so the guard can send someone back to the page
   * they asked for, and checked rather than trusted: an unfiltered `next` is an
   * open redirect, and a sign-in page that will forward to any URL given to it
   * is exactly the page a phishing link wants to borrow.
   */
  function destination() {
    const next = new URLSearchParams(location.search).get('next') ?? '';
    return next.startsWith('/account') ? next : '/account';
  }

  // Someone with a live session has nothing to type.
  $effect(() => {
    if (isAuthReady() && isSignedIn()) {
      navigate(destination(), { replace: true });
    }
  });

  /** @param {SubmitEvent} event */
  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;
    error = '';

    if (!email.trim() || !password) {
      error = 'Enter your email and password.';
      return;
    }

    submitting = true;

    try {
      await signIn({ email, password });
      navigate(destination(), { replace: true });
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Sign in · {appConfig.appName}</title>
  <meta name="robots" content="noindex" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page">
  <div class="card">
    <header class="head">
      <img src="/images/innerdial_logo.svg" alt="" width="40" height="40" />
      <h1>Your account</h1>
      <p class="lede">Sign in to manage your details and your membership.</p>
    </header>

    {#if !isSupabaseConfigured}
      <Callout tone="error">
        Supabase is not configured. Copy <code>.env.example</code> to <code>.env.local</code> and set
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
      </Callout>
    {:else}
      <form onsubmit={handleSubmit} novalidate>
        <Field label="Email" id="account-email" required>
          <input
            id="account-email"
            type="email"
            autocomplete="username"
            bind:value={email}
            disabled={submitting}
          />
        </Field>

        <Field label="Password" id="account-password" required>
          <input
            id="account-password"
            type="password"
            autocomplete="current-password"
            bind:value={password}
            disabled={submitting}
          />
        </Field>

        {#if error}
          <Callout tone="error" message={error} />
        {/if}

        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p class="aside">
        Accounts are created in the {appConfig.appName} app. Install it, sign up there, and this page
        will know you.
      </p>
    {/if}
  </div>

  <a class="back" href="/">Back to {appConfig.appName.toLowerCase()}.com</a>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-lg);
    min-height: 100dvh;
    padding: var(--space-lg);
    /* The hero's ground, so signing in reads as the same property. */
    background: var(--color-ink);
  }

  .card {
    width: 100%;
    max-width: 25rem;
    padding: var(--space-xl);
    border-radius: var(--radius-lg);
    background: var(--color-background);
    box-shadow: 0 4px 12px rgb(7 15 25 / 18%), 0 32px 72px rgb(7 15 25 / 28%);
  }

  .head {
    margin-bottom: var(--space-lg);
    text-align: center;
  }

  .head img {
    display: block;
    margin: 0 auto var(--space-sm);
    border-radius: 50%;
  }

  h1 {
    margin: 0;
    font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.015em;
    color: var(--color-ink);
  }

  .lede {
    margin: var(--space-xs) 0 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .aside {
    margin: var(--space-lg) 0 0;
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  code {
    padding: 0.1em 0.3em;
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    font-size: 0.875em;
  }

  .back {
    color: rgb(255 255 255 / 55%);
    font-size: 0.8125rem;
    text-decoration: none;
  }

  .back:hover {
    color: var(--color-primary);
  }
</style>
