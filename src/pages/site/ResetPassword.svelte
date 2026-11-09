<script>
  /**
   * Where a password reset email lands.
   *
   * Reached two ways, both ending here: directly, when something passed
   * `redirectTo`, and by way of `claimRecoveryLink()` forwarding the site root,
   * which is where Supabase sends a reset started from the dashboard.
   *
   * Unguarded, and it has to be — the person opening it is the one person who
   * cannot sign in. The link itself is the credential, so this screen shows
   * nothing about the account beyond the address the link belongs to, and the
   * save revokes every session before handing back to /login.
   */
  import { onMount } from 'svelte';

  import { appConfig } from '$lib/utils/config.js';
  import { RESET_PATH, readRecoveryFragment } from '$lib/auth/recovery.js';
  import { completePasswordReset, startRecoverySession } from '$lib/auth/password-reset.js';
  import { errorMessage, isSupabaseConfigured } from '$lib/supabase/client.js';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Field from '$lib/components/Field.svelte';

  /** @type {'opening' | 'form' | 'invalid' | 'saved'} */
  let phase = $state('opening');

  let accountEmail = $state('');
  let password = $state('');
  let confirmation = $state('');
  let submitting = $state(false);
  let error = $state('');
  let refusal = $state('');

  onMount(() => {
    openLink();
  });

  async function openLink() {
    if (!isSupabaseConfigured) {
      phase = 'invalid';
      refusal = 'This site is not configured to reach Supabase, so the link cannot be checked.';
      return;
    }

    const link = readRecoveryFragment(window.location.hash);

    /*
      Stripped before the first await, not after. Until this runs the token is
      in the address bar, which means it is in the history, in a screenshot, and
      in whatever gets copied out of the bar and pasted somewhere.
    */
    window.history.replaceState(null, '', RESET_PATH);

    if (!link) {
      phase = 'invalid';
      refusal = 'Open this page from the link in your password reset email.';
      return;
    }

    if (link.kind === 'failed') {
      phase = 'invalid';
      refusal = link.expired
        ? 'That link has expired. Reset links last an hour and work only once.'
        : 'That link is no longer valid. Ask for a new one and use the newest email.';
      return;
    }

    try {
      accountEmail = await startRecoverySession(link);
      phase = 'form';
    } catch (cause) {
      /*
        Malformed, expired, already spent — supabase-js distinguishes these and
        the person holding the link cannot act on the difference. Telling them
        the JWT is not in base64url format is telling them about our problem.
      */
      console.warn('[auth] the recovery link was refused:', cause);
      phase = 'invalid';
      refusal = 'That link is no longer valid. Reset links last an hour and work only once.';
    }
  }

  /** @param {SubmitEvent} event */
  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;
    error = '';

    if (password !== confirmation) {
      error = 'The two passwords do not match.';
      return;
    }

    submitting = true;

    try {
      await completePasswordReset(password);
      password = '';
      confirmation = '';
      phase = 'saved';
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Choose a new password · {appConfig.appName}</title>
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

      <h1>
        {#if phase === 'saved'}
          Password changed
        {:else if phase === 'invalid'}
          Link not usable
        {:else}
          Choose a new password
        {/if}
      </h1>

      {#if phase === 'form'}
        <p class="lede">Setting a new password for <strong>{accountEmail}</strong>.</p>
      {:else if phase === 'opening'}
        <p class="lede">Checking your link…</p>
      {/if}
    </header>

    {#if phase === 'invalid'}
      <Callout tone="error" message={refusal} />

      <p class="aside">
        Ask for a new one, then open the most recent email — an older link stops working as soon
        as a newer one is sent.
      </p>

      <a class="next" href="/forgot-password">Send a new link</a>
    {:else if phase === 'saved'}
      <Callout tone="success" message="Your password has been changed." />

      <p class="aside">
        Every device signed in to this account has been signed out, the app included. Sign in again
        with the new password.
      </p>

      <a class="next" href="/login">Sign in</a>
    {:else if phase === 'form'}
      <form onsubmit={handleSubmit} novalidate>
        <Field label="New password" id="new-password" hint="At least 8 characters." required>
          <input
            id="new-password"
            type="password"
            autocomplete="new-password"
            bind:value={password}
            disabled={submitting}
          />
        </Field>

        <Field label="New password again" id="confirm-password" required>
          <input
            id="confirm-password"
            type="password"
            autocomplete="new-password"
            bind:value={confirmation}
            disabled={submitting}
          />
        </Field>

        {#if error}
          <Callout tone="error" message={error} />
        {/if}

        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save new password'}
        </Button>
      </form>
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
    /* The sign-in ground, because this is the same errand. */
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

  .lede strong {
    font-weight: 600;
    color: var(--color-text);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .aside {
    margin: var(--space-md) 0 0;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .next {
    display: inline-block;
    margin-top: var(--space-md);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-primary);
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
