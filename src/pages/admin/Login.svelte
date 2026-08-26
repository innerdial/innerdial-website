<script>
  /**
   * The way in to the console.
   *
   * Signing in and being an admin are separate: any collector with an app
   * account authenticates against the same Supabase project, so a successful
   * password is not an answer. The privilege check runs straight after, and an
   * unprivileged session is signed back out rather than left holding a token
   * against a console it cannot use.
   */
  import { navigate } from 'svelte-routing';
  import { appConfig } from '$lib/utils/config.js';
  import { adminStatus, initAuth, isAuthReady, signIn, signOut } from '$lib/auth/session.svelte.js';
  import { errorMessage, isSupabaseConfigured } from '$lib/supabase/client.js';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Field from '$lib/components/Field.svelte';

  let email = $state('');
  let password = $state('');
  let submitting = $state(false);
  let error = $state('');

  initAuth();

  // An operator returning to a live session should not have to type it again.
  $effect(() => {
    if (isAuthReady() && adminStatus() === true) {
      navigate('/admin', { replace: true });
    }
  });

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
      const { admin } = await signIn({ email, password });

      if (!admin) {
        await signOut();
        error = 'That account is not an Innerdial admin.';
        return;
      }

      navigate('/admin', { replace: true });
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Sign in · Admin · {appConfig.appName}</title>
</svelte:head>

<div class="page">
  <div class="card">
    <header class="head">
      <img src="/images/innerdial_logo.svg" alt="" width="36" height="36" />
      <p class="eyebrow">{appConfig.appName}</p>
      <h1>Admin console</h1>
      <p class="lede">Sign in with the account that holds console privileges.</p>
    </header>

    {#if !isSupabaseConfigured}
      <Callout tone="error">
        Supabase is not configured. Copy <code>.env.example</code> to <code>.env.local</code> and set
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
      </Callout>
    {:else}
      <form onsubmit={handleSubmit} novalidate>
        <Field label="Email" id="admin-email" required>
          <input
            id="admin-email"
            type="email"
            autocomplete="username"
            bind:value={email}
            disabled={submitting}
          />
        </Field>

        <Field label="Password" id="admin-password" required>
          <input
            id="admin-password"
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
    {/if}
  </div>

  <a class="back" href="/">Back to innerdial.com</a>
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
    background: var(--color-ink);
  }

  .card {
    width: 100%;
    max-width: 24rem;
    padding: var(--space-xl);
    border-radius: var(--radius-lg);
    background: var(--color-background);
  }

  .head {
    margin-bottom: var(--space-lg);
    text-align: center;
  }

  .head img {
    display: block;
    margin: 0 auto var(--space-sm);
  }

  .eyebrow {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  h1 {
    margin: var(--space-xs) 0 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .lede {
    margin: var(--space-sm) 0 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
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
