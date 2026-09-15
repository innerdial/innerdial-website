<script>
  /**
   * How to delete an Innerdial account, and the place to do it.
   *
   * Public on purpose, and not behind the session gate: this URL is the one the
   * app stores list as the way to request deletion, so someone with no session —
   * or no longer any app installed — has to be able to read what happens and
   * how to ask. Signing in only adds the button.
   *
   * The confirmation is typing the account's email rather than a second click.
   * Deletion cannot be undone, and a form that also shows which address is about
   * to go is the cheapest way to stop someone erasing the wrong account from a
   * shared browser.
   */
  import { onMount } from 'svelte';

  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Field from '$lib/components/Field.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import { appConfig } from '$lib/utils/config.js';
  import { deleteAccount } from '$lib/account/deletion.js';
  import { fetchMembership, isLive } from '$lib/account/subscription.js';
  import {
    currentUser,
    initAuth,
    isAuthReady,
    isSignedIn,
    signOut,
  } from '$lib/auth/session.svelte.js';
  import { errorMessage, isSupabaseConfigured } from '$lib/supabase/client.js';

  const SUPPORT_EMAIL = 'hello@innerdial.com';
  const SIGN_IN_HREF = `/login?next=${encodeURIComponent('/delete-account')}`;

  let confirmation = $state('');
  let deleting = $state(false);
  let error = $state('');
  let deleted = $state(false);
  let hasMembership = $state(false);
  let signingOut = $state(false);

  const user = $derived(currentUser());
  const email = $derived(user?.email ?? '');
  const confirmed = $derived(
    Boolean(email) && confirmation.trim().toLowerCase() === email.toLowerCase(),
  );

  onMount(() => {
    initAuth();
  });

  // Only a warning, so a failed read must not stand between someone and the
  // button — the function cancels billing whether or not this page knew of it.
  $effect(() => {
    const id = user?.id;
    if (!id) {
      hasMembership = false;
      return;
    }

    fetchMembership(id)
      .then(({ subscription }) => {
        hasMembership = isLive(subscription);
      })
      .catch((cause) => {
        console.warn('[account] could not read membership before deletion:', cause);
      });
  });

  /** @param {SubmitEvent} event */
  async function handleDelete(event) {
    event.preventDefault();
    if (deleting || !confirmed) return;

    deleting = true;
    error = '';

    try {
      await deleteAccount();
      deleted = true;
    } catch (cause) {
      error = errorMessage(cause);
      deleting = false;
      return;
    }

    try {
      await signOut();
    } catch (cause) {
      // The user no longer exists, so the server has nothing to revoke; the
      // local session is what matters and supabase-js clears it regardless.
      console.warn('[account] sign out after deletion did not reach Supabase:', cause);
    } finally {
      deleting = false;
    }
  }

  async function handleSignOut() {
    if (signingOut) return;
    signingOut = true;

    try {
      await signOut();
    } catch (cause) {
      console.warn('[account] sign out did not reach Supabase:', cause);
    } finally {
      signingOut = false;
      confirmation = '';
      error = '';
    }
  }
</script>

<svelte:head>
  <title>Delete your account · {appConfig.appName}</title>
  <meta
    name="description"
    content="How to permanently delete your Innerdial account and the data stored with it."
  />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="screen">
  <header class="bar">
    <div class="bar-inner">
      <a class="brand" href="/">
        <img src="/images/innerdial_logo.svg" alt="" width="32" height="32" />
        <span>{appConfig.appName}</span>
      </a>
    </div>
  </header>

  <main class="page">
    <header class="head">
      <h1>Delete your account</h1>
      <p class="lede">
        You can permanently delete your {appConfig.appName} account and everything stored with it
        at any time. This applies to accounts created in the {appConfig.appName} app for Android and
        iOS.
      </p>
    </header>

    <section class="card" aria-labelledby="what-is-deleted">
      <h2 id="what-is-deleted">What is deleted</h2>
      <ul class="list">
        <li>Your profile — your name, email address and password.</li>
        <li>Every watch in your vault, with its photos, papers, purchase and service history.</li>
        <li>Your travel boxes and the watches listed in them.</li>
        <li>Your membership and its payment history on {appConfig.appName}.</li>
      </ul>
      <p class="note">
        Deletion happens straight away and cannot be undone. There is no grace period and nothing we
        can restore afterwards.
      </p>
    </section>

    <section class="card" aria-labelledby="what-is-kept">
      <h2 id="what-is-kept">What is kept</h2>
      <ul class="list">
        <li>
          If you held a paid membership, it is cancelled at once and no further charges are made.
          Razorpay, which processed your payments, keeps its own transaction records for as long as
          financial regulations require.
        </li>
        <li>
          Copies inside our encrypted database backups are not edited, and are overwritten as those
          backups expire.
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="delete-now">
      <h2 id="delete-now">Delete it now</h2>

      {#if deleted}
        <Callout tone="success">
          Your account has been deleted. You can uninstall the {appConfig.appName} app — signing in
          again will no longer work.
        </Callout>
        <div class="actions">
          <a class="link-button" href="/">Back to {appConfig.appName.toLowerCase()}.com</a>
        </div>
      {:else if !isSupabaseConfigured}
        <Callout
          tone="info"
          message={`Deleting from this page is unavailable right now. Email ${SUPPORT_EMAIL} instead.`}
        />
      {:else if !isAuthReady()}
        <Loader label="Checking whether you are signed in" />
      {:else if !isSignedIn()}
        <p class="note">
          Sign in with the email and password you use in the app. You will come straight back here.
        </p>
        <div class="actions">
          <a class="link-button primary" href={SIGN_IN_HREF}>Sign in to delete</a>
        </div>
      {:else}
        <p class="note">
          Signed in as <strong>{email}</strong>.
          <button class="inline" type="button" onclick={handleSignOut} disabled={signingOut || deleting}>
            Not you? Sign out
          </button>
        </p>

        {#if hasMembership}
          <div class="spaced">
            <Callout tone="info">
              This account has a membership. Deleting the account cancels it immediately, including
              any time left in the current period.
            </Callout>
          </div>
        {/if}

        <form onsubmit={handleDelete} novalidate>
          <Field
            label="Type your email address to confirm"
            id="delete-confirmation"
            hint="This is the account that will be deleted."
          >
            <input
              id="delete-confirmation"
              type="email"
              autocomplete="off"
              spellcheck="false"
              placeholder={email}
              bind:value={confirmation}
              disabled={deleting}
            />
          </Field>

          {#if error}
            <Callout tone="error" message={error} />
          {/if}

          <div class="actions">
            <Button variant="danger" type="submit" disabled={deleting || !confirmed}>
              {deleting ? 'Deleting…' : 'Permanently delete my account'}
            </Button>
          </div>
        </form>
      {/if}
    </section>

    <section class="card" aria-labelledby="by-email">
      <h2 id="by-email">Cannot sign in?</h2>
      <p class="note flush">
        Email <a href="mailto:{SUPPORT_EMAIL}?subject=Delete%20my%20Innerdial%20account"
          >{SUPPORT_EMAIL}</a
        >
        from the address on your account, with the subject “Delete my account”. We will confirm it
        is yours, delete the account and everything listed above, and reply once it is done.
      </p>
    </section>
  </main>
</div>

<style>
  .screen {
    --font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;

    min-height: 100dvh;
    background: #fbfaf8;
    color: var(--color-text);
  }

  .bar {
    border-bottom: 1px solid var(--color-border);
    background: var(--color-background);
  }

  .bar-inner,
  .page {
    width: 100%;
    max-width: 44rem;
    margin-inline: auto;
    padding-inline: var(--space-lg);
  }

  .bar-inner {
    display: flex;
    align-items: center;
    min-height: 4rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-family: var(--font-display);
    font-size: 1.3125rem;
    font-weight: 600;
    color: var(--color-ink);
    text-decoration: none;
  }

  .brand img {
    display: block;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgb(14 27 44 / 6%);
  }

  .page {
    padding-block: var(--space-xl) 5rem;
  }

  .head {
    margin-bottom: var(--space-xl);
  }

  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    font-weight: 600;
    letter-spacing: -0.015em;
    color: var(--color-ink);
  }

  .lede {
    max-width: 36rem;
    margin: var(--space-sm) 0 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-text-muted);
  }

  .card {
    padding: var(--space-xl);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background);
    box-shadow: 0 1px 2px rgb(14 27 44 / 5%), 0 2px 10px rgb(14 27 44 / 4%);
  }

  .card + .card {
    margin-top: var(--space-lg);
  }

  h2 {
    margin: 0 0 var(--space-md);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin: 0;
    padding-left: 1.1rem;
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--color-text);
  }

  .note {
    max-width: 36rem;
    margin: var(--space-md) 0;
    font-size: 0.875rem;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .card > .note:first-of-type:not(.flush) {
    margin-top: 0;
  }

  .note.flush {
    margin: 0;
  }

  .note strong {
    color: var(--color-ink);
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .note a {
    color: var(--color-ink);
    text-decoration-color: var(--color-primary);
    text-underline-offset: 3px;
  }

  .spaced {
    margin-bottom: var(--space-md);
  }

  .inline {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: var(--color-text-muted);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .inline:hover:not(:disabled) {
    color: var(--color-ink);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    max-width: 24rem;
  }

  .actions {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-md);
  }

  form .actions {
    margin-top: 0;
  }

  .link-button {
    display: inline-flex;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-ink);
    text-decoration: none;
    transition: background 0.14s ease, border-color 0.14s ease;
  }

  .link-button:hover {
    border-color: #bebdb9;
  }

  .link-button.primary {
    border-color: transparent;
    background: var(--color-primary);
    color: #fff;
  }

  .link-button.primary:hover {
    background: var(--color-primary-hover);
  }

  .link-button:focus-visible,
  .inline:focus-visible,
  .brand:focus-visible {
    outline: 3px solid rgb(184 147 90 / 45%);
    outline-offset: 3px;
    border-radius: var(--radius-sm);
  }

  @media (max-width: 34rem) {
    .bar-inner,
    .page {
      padding-inline: var(--space-md);
    }

    .card {
      padding: var(--space-lg);
    }
  }
</style>
