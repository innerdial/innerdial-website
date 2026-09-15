<script>
  /**
   * Who you are and how you sign in.
   *
   * Three forms, saved independently. One form with a single Save would be less
   * code and worse: changing an email starts a confirmation that has not
   * happened yet, changing a password ends every other session, and changing a
   * name is neither of those — a single button cannot report three outcomes
   * that different, and a failure in one would roll back edits to the others.
   *
   * No collection data appears here and none should. The vault is the app's;
   * this is the account behind it.
   */
  import { onMount } from 'svelte';

  import AccountShell from '$lib/account/AccountShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Field from '$lib/components/Field.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import { currentUser } from '$lib/auth/session.svelte.js';
  import { errorMessage } from '$lib/supabase/client.js';
  import {
    fetchAccount,
    requestEmailChange,
    updateName,
    updatePassword,
  } from '$lib/account/profile.js';

  /** @type {import('$lib/account/profile.js').Account | null} */
  let account = $state(null);
  let loading = $state(true);
  let loadError = $state('');

  let name = $state('');
  let nameBusy = $state(false);
  let nameNote = $state({ tone: 'success', text: '' });

  let email = $state('');
  let emailBusy = $state(false);
  let emailNote = $state({ tone: 'success', text: '' });

  let password = $state('');
  let confirmation = $state('');
  let passwordBusy = $state(false);
  let passwordNote = $state({ tone: 'success', text: '' });

  const user = currentUser();

  /** The address the account signs in with, which is the one auth holds. */
  const signInEmail = $derived(user?.email ?? account?.email ?? '');

  const emailChanged = $derived(
    email.trim().toLowerCase() !== (signInEmail ?? '').trim().toLowerCase(),
  );

  onMount(async () => {
    try {
      account = await fetchAccount(user.id);
      name = account?.full_name ?? '';
      email = user?.email ?? account?.email ?? '';
    } catch (cause) {
      loadError = errorMessage(cause);
    } finally {
      loading = false;
    }
  });

  /** @param {SubmitEvent} event */
  async function saveName(event) {
    event.preventDefault();
    if (nameBusy) return;

    nameBusy = true;
    nameNote = { tone: 'success', text: '' };

    try {
      account = await updateName(user.id, name);
      nameNote = { tone: 'success', text: 'Saved.' };
    } catch (cause) {
      nameNote = { tone: 'error', text: errorMessage(cause) };
    } finally {
      nameBusy = false;
    }
  }

  /** @param {SubmitEvent} event */
  async function saveEmail(event) {
    event.preventDefault();
    if (emailBusy) return;

    emailBusy = true;
    emailNote = { tone: 'success', text: '' };

    try {
      await requestEmailChange(email);
      // Deliberately not "Saved" — nothing has changed yet, and telling someone
      // their address is updated when it is waiting on a link they have not
      // clicked is how an account ends up unreachable.
      emailNote = {
        tone: 'success',
        text: `Check ${email.trim()} for a confirmation link. The change takes effect once you follow it.`,
      };
    } catch (cause) {
      emailNote = { tone: 'error', text: errorMessage(cause) };
    } finally {
      emailBusy = false;
    }
  }

  /** @param {SubmitEvent} event */
  async function savePassword(event) {
    event.preventDefault();
    if (passwordBusy) return;

    passwordNote = { tone: 'success', text: '' };

    if (password !== confirmation) {
      passwordNote = { tone: 'error', text: 'Those two passwords are not the same.' };
      return;
    }

    passwordBusy = true;

    try {
      await updatePassword(password);
      password = '';
      confirmation = '';
      passwordNote = { tone: 'success', text: 'Your password has been changed.' };
    } catch (cause) {
      passwordNote = { tone: 'error', text: errorMessage(cause) };
    } finally {
      passwordBusy = false;
    }
  }
</script>

<AccountShell title="Account" lede="Your details and how you sign in. Your collection stays in the app.">
  {#if loading}
    <Loader label="Loading your account" />
  {:else if loadError}
    <Callout tone="error" message={loadError} />
  {:else}
    <section class="card">
      <h2>Your name</h2>
      <p class="note">How Innerdial greets you, in the app and on your receipts.</p>

      <form onsubmit={saveName} novalidate>
        <Field label="Full name" id="account-name">
          <input id="account-name" type="text" bind:value={name} disabled={nameBusy} />
        </Field>

        {#if nameNote.text}
          <Callout tone={nameNote.tone} message={nameNote.text} />
        {/if}

        <div class="actions">
          <Button
            variant="primary"
            type="submit"
            disabled={nameBusy || !name.trim() || name.trim() === (account?.full_name ?? '')}
          >
            {nameBusy ? 'Saving…' : 'Save name'}
          </Button>
        </div>
      </form>
    </section>

    <section class="card">
      <h2>Email address</h2>
      <p class="note">
        The address you sign in with. Changing it sends a confirmation link — nothing moves until
        you follow it.
      </p>

      <form onsubmit={saveEmail} novalidate>
        <Field label="Email" id="account-email">
          <input
            id="account-email"
            type="email"
            autocomplete="email"
            bind:value={email}
            disabled={emailBusy}
          />
        </Field>

        {#if emailNote.text}
          <Callout tone={emailNote.tone} message={emailNote.text} />
        {/if}

        <div class="actions">
          <Button variant="primary" type="submit" disabled={emailBusy || !emailChanged}>
            {emailBusy ? 'Sending…' : 'Send confirmation'}
          </Button>
        </div>
      </form>
    </section>

    <section class="card">
      <h2>Password</h2>
      <p class="note">At least eight characters. Changing it does not sign you out here.</p>

      <form onsubmit={savePassword} novalidate>
        <Field label="New password" id="account-new-password">
          <input
            id="account-new-password"
            type="password"
            autocomplete="new-password"
            bind:value={password}
            disabled={passwordBusy}
          />
        </Field>

        <Field label="Confirm new password" id="account-confirm-password">
          <input
            id="account-confirm-password"
            type="password"
            autocomplete="new-password"
            bind:value={confirmation}
            disabled={passwordBusy}
          />
        </Field>

        {#if passwordNote.text}
          <Callout tone={passwordNote.tone} message={passwordNote.text} />
        {/if}

        <div class="actions">
          <Button variant="primary" type="submit" disabled={passwordBusy || password.length < 8}>
            {passwordBusy ? 'Changing…' : 'Change password'}
          </Button>
        </div>
      </form>
    </section>

    <section class="card">
      <h2>Delete account</h2>
      <p class="note">
        Permanently removes this account, your whole collection and any membership. It cannot be
        undone.
      </p>
      <a class="danger-link" href="/delete-account">Delete your account…</a>
    </section>
  {/if}
</AccountShell>

<style>
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
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .note {
    max-width: 34rem;
    margin: var(--space-xs) 0 var(--space-lg);
    font-size: 0.875rem;
    line-height: 1.55;
    color: var(--color-text-muted);
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
  }

  .danger-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-danger);
    text-underline-offset: 3px;
  }

  .danger-link:hover {
    color: var(--color-danger-hover);
  }
</style>
