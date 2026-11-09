<script>
  /**
   * Asks for a reset link.
   *
   * The other half of `/reset-password`, and the reason a collector no longer
   * has to write in to get one. Deliberately its own route rather than a mode
   * of the sign-in card: it is linkable, which is what a support reply needs.
   *
   * What it will not do is say whether the address has an account. Supabase
   * answers a reset request identically either way, and so does this screen —
   * a form that distinguishes the two is a form for asking whether someone is
   * a customer, one address at a time.
   */
  import { appConfig } from '$lib/utils/config.js';
  import { requestPasswordReset } from '$lib/auth/password-reset.js';
  import { errorMessage, isSupabaseConfigured } from '$lib/supabase/client.js';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Field from '$lib/components/Field.svelte';

  let email = $state('');
  let submitting = $state(false);
  let error = $state('');
  let sent = $state(false);

  /** @param {SubmitEvent} event */
  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;
    error = '';
    submitting = true;

    try {
      await requestPasswordReset(email);
      sent = true;
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Reset your password · {appConfig.appName}</title>
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
      <h1>{sent ? 'Check your email' : 'Reset your password'}</h1>

      {#if !sent}
        <p class="lede">
          Enter the address your account uses and we will send a link to set a new password.
        </p>
      {/if}
    </header>

    {#if !isSupabaseConfigured}
      <Callout tone="error">
        Supabase is not configured. Copy <code>.env.example</code> to <code>.env.local</code> and set
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
      </Callout>
    {:else if sent}
      <Callout tone="success" message="If that address has an account, a link is on its way." />

      <p class="aside">
        It lasts an hour and works once. Nothing has changed about your account until you follow it
        and choose a new password — if the email does not arrive, check the spam folder before
        asking for another.
      </p>

      <a class="next" href="/login">Back to sign in</a>
    {:else}
      <form onsubmit={handleSubmit} novalidate>
        <Field label="Email" id="reset-email" required>
          <input
            id="reset-email"
            type="email"
            autocomplete="username"
            bind:value={email}
            disabled={submitting}
          />
        </Field>

        {#if error}
          <Callout tone="error" message={error} />
        {/if}

        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send the link'}
        </Button>
      </form>

      <p class="aside">
        Signed in on the app already? You can change your password there, under your account, without
        the email.
      </p>

      <a class="next" href="/login">Back to sign in</a>
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
