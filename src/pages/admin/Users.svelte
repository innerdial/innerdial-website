<script>
  /**
   * Every collector with an account: membership, a block that stops sign-in,
   * and a delete that removes the Auth user. None of this is a window into
   * anyone's vault. The watches stay the collector's until the account itself
   * is deleted.
   */
  import AdminShell from '$lib/components/AdminShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Panel from '$lib/components/Panel.svelte';
  import { currentUser } from '$lib/auth/session.svelte.js';
  import { errorMessage } from '$lib/supabase/client.js';
  import {
    PAGE_SIZE,
    SORT_OPTIONS,
    deleteUser,
    fetchLicenses,
    fetchUsers,
    setUserBlocked,
    updateUserLicense,
  } from '$lib/admin/users.js';
  import { formatCount, formatDate, formatRelative } from '$lib/utils/format.js';

  /** Long enough that typing a name is not one request per keystroke. */
  const SEARCH_DEBOUNCE_MS = 300;

  /** @typedef {'block' | 'unblock' | 'delete'} ConfirmAction */

  let searchInput = $state('');
  let search = $state('');
  let sort = $state('created_at');
  let statusFilter = $state(/** @type {'all' | 'blocked'} */ ('all'));
  let page = $state(0);

  /*
    Loaded once. The list is three or four rows that change when a plan is
    added, not per collector, so re-reading it for every page of the table would
    be a request per keystroke of the search box.
  */
  let licenses = $state(/** @type {{ id: string, slug: string, name: string }[]} */ ([]));

  /** @param {string | null} id */
  function licenseName(id) {
    if (!id) {
      return 'Free';
    }
    return licenses.find((license) => license.id === id)?.name ?? 'Unknown licence';
  }

  let status = $state(/** @type {'loading' | 'ready' | 'error'} */ ('loading'));
  let error = $state('');
  let notice = $state('');

  /** @type {import('$lib/admin/users.js').AdminUser[]} */
  let users = $state([]);
  let total = $state(0);

  /** The row whose write is in flight, so only its own controls are disabled. */
  let savingId = $state('');

  /** @type {{ id: string, action: ConfirmAction } | null} */
  let confirming = $state(null);

  const pageCount = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const rangeStart = $derived(total === 0 ? 0 : page * PAGE_SIZE + 1);
  const rangeEnd = $derived(Math.min(total, (page + 1) * PAGE_SIZE));

  $effect(() => {
    const term = searchInput;
    const timer = setTimeout(() => {
      // A new search invalidates the page you were on.
      if (term !== search) {
        search = term;
        page = 0;
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  });

  $effect(() => {
    load({ search, sort, page, blockedOnly: statusFilter === 'blocked' });
  });

  /*
    Separate from the table's load, and not awaited by it: an unreadable licence
    list should leave the collector list working. The select falls back to
    showing the id it cannot name rather than an empty dropdown.
  */
  $effect(() => {
    fetchLicenses()
      .then((rows) => {
        licenses = rows;
      })
      .catch((cause) => {
        console.warn('[admin] could not read the licence list:', cause);
      });
  });

  async function load(options) {
    status = 'loading';
    error = '';
    confirming = null;

    try {
      const result = await fetchUsers(options);
      users = result.users;
      total = result.total;
      status = 'ready';
    } catch (cause) {
      error = errorMessage(cause);
      status = 'error';
    }
  }

  /**
   * @param {import('$lib/admin/users.js').AdminUser} user
   * @param {string} value the licence id, or '' for none
   */
  async function changeLicense(user, value) {
    const licenseId = value || null;
    if (licenseId === user.license_id) return;

    const previous = user.license_id;
    savingId = user.id;
    notice = '';
    error = '';

    // Moved before the request so the select does not snap back while it flies.
    users = users.map((row) => (row.id === user.id ? { ...row, license_id: licenseId } : row));

    try {
      await updateUserLicense(user.id, licenseId);
      notice = `${user.full_name || user.email || 'Collector'} is now on ${licenseName(licenseId)}.`;
    } catch (cause) {
      users = users.map((row) => (row.id === user.id ? { ...row, license_id: previous } : row));
      error = errorMessage(cause);
    } finally {
      savingId = '';
    }
  }

  /**
   * @param {import('$lib/admin/users.js').AdminUser} user
   * @param {ConfirmAction} action
   */
  function askConfirm(user, action) {
    confirming = { id: user.id, action };
    notice = '';
    error = '';
  }

  /** @param {import('$lib/admin/users.js').AdminUser} user */
  function collectorLabel(user) {
    return user.full_name || user.email || 'Collector';
  }

  /** @param {import('$lib/admin/users.js').AdminUser} user */
  async function toggleBlocked(user) {
    const blocked = !user.blocked_at;
    savingId = user.id;
    notice = '';
    error = '';

    try {
      const updated = await setUserBlocked(user.id, blocked);
      confirming = null;

      if (statusFilter === 'blocked' && !updated.blocked_at) {
        users = users.filter((row) => row.id !== user.id);
        total = Math.max(0, total - 1);
      } else {
        users = users.map((row) =>
          row.id === user.id ? { ...row, blocked_at: updated.blocked_at } : row,
        );
      }

      notice = blocked
        ? `${collectorLabel(user)} is blocked and can no longer sign in.`
        : `${collectorLabel(user)} can sign in again.`;
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      savingId = '';
    }
  }

  /** @param {import('$lib/admin/users.js').AdminUser} user */
  async function remove(user) {
    savingId = user.id;
    notice = '';
    error = '';

    try {
      await deleteUser(user.id);
      users = users.filter((row) => row.id !== user.id);
      total = Math.max(0, total - 1);
      confirming = null;
      notice = `${collectorLabel(user)} and their vault have been deleted.`;

      if (users.length === 0 && page > 0) {
        page -= 1;
      }
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      savingId = '';
    }
  }
</script>

<AdminShell
  title="Users"
  subtitle="Every collector holding an Innerdial account. Block stops sign-in; delete removes the account."
>
  {#snippet actions()}
    <Button
      onclick={() => load({ search, sort, page, blockedOnly: statusFilter === 'blocked' })}
      disabled={status === 'loading'}
    >
      Refresh
    </Button>
  {/snippet}

  <Panel>
    {#snippet actions()}
      <p class="total">{formatCount(total)} {total === 1 ? 'collector' : 'collectors'}</p>
    {/snippet}

    <div class="controls">
      <div class="search">
        <label class="sr-only" for="user-search">Search by name or email</label>
        <input
          id="user-search"
          type="search"
          placeholder="Search by name or email"
          bind:value={searchInput}
        />
      </div>

      <div class="sort">
        <label for="user-sort">Sort</label>
        <select
          id="user-sort"
          bind:value={sort}
          onchange={() => {
            page = 0;
          }}
        >
          {#each SORT_OPTIONS as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <div class="sort">
        <label for="user-status">Status</label>
        <select
          id="user-status"
          bind:value={statusFilter}
          onchange={() => {
            page = 0;
          }}
        >
          <option value="all">All collectors</option>
          <option value="blocked">Blocked only</option>
        </select>
      </div>
    </div>

    {#if notice}
      <div class="message"><Callout tone="success" message={notice} /></div>
    {/if}
    {#if error}
      <div class="message"><Callout tone="error" message={error} /></div>
    {/if}

    {#if status === 'loading' && users.length === 0}
      <Loader label="Loading collectors" />
    {:else if users.length === 0}
      <Callout
        message={search
          ? `No collector matches “${search}”.`
          : statusFilter === 'blocked'
            ? 'No collectors are blocked.'
            : 'No collectors have signed up yet.'}
      />
    {:else}
      <div class="table-scroll" class:stale={status === 'loading'}>
        <table>
          <thead>
            <tr>
              <th scope="col">Collector</th>
              <th scope="col">Joined</th>
              <th scope="col">Last seen</th>
              <th scope="col">Licence</th>
              <th scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {#each users as user (user.id)}
              {@const busy = savingId === user.id}
              {@const pending = confirming?.id === user.id ? confirming.action : ''}
              <tr class:is-blocked={user.blocked_at}>
                <td>
                  <div class="who">
                    <span class="name">
                      {user.full_name || 'Unnamed collector'}
                      {#if user.is_admin}<span class="badge">Admin</span>{/if}
                      {#if user.blocked_at}<span class="badge blocked">Blocked</span>{/if}
                    </span>
                    <span class="email">{user.email ?? 'No email on file'}</span>
                  </div>
                </td>
                <td class="numeric">{formatDate(user.created_at)}</td>
                <td class="numeric" class:dormant={!user.last_seen_at}>
                  {formatRelative(user.last_seen_at)}
                </td>
                <td>
                  <label class="sr-only" for="license-{user.id}">
                    Licence for {user.full_name || user.email}
                  </label>
                  <select
                    id="license-{user.id}"
                    value={user.license_id ?? ''}
                    disabled={busy}
                    onchange={(event) => changeLicense(user, event.currentTarget.value)}
                  >
                    <!-- No licence of their own: they fall to the default one. -->
                    <option value="">Free</option>
                    {#each licenses as license (license.id)}
                      <option value={license.id}>{license.name}</option>
                    {/each}
                  </select>
                </td>
                <td>
                  {#if user.is_admin || user.id === currentUser()?.id}
                    <span class="no-actions">—</span>
                  {:else if pending}
                    <div class="row-actions">
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onclick={() =>
                          pending === 'delete' ? remove(user) : toggleBlocked(user)}
                      >
                        {pending === 'delete'
                          ? 'Delete permanently'
                          : pending === 'unblock'
                            ? 'Confirm unblock'
                            : 'Confirm block'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onclick={() => (confirming = null)}
                      >
                        Keep
                      </Button>
                    </div>
                  {:else}
                    <div class="row-actions">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onclick={() => askConfirm(user, user.blocked_at ? 'unblock' : 'block')}
                      >
                        {user.blocked_at ? 'Unblock' : 'Block'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onclick={() => askConfirm(user, 'delete')}
                      >
                        Delete
                      </Button>
                    </div>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if pageCount > 1}
        <nav class="pager" aria-label="Pages of collectors">
          <Button size="sm" disabled={page === 0} onclick={() => (page -= 1)}>Previous</Button>
          <p class="pager-copy">
            {formatCount(rangeStart)}–{formatCount(rangeEnd)} of {formatCount(total)}
          </p>
          <Button size="sm" disabled={page >= pageCount - 1} onclick={() => (page += 1)}>
            Next
          </Button>
        </nav>
      {/if}
    {/if}
  </Panel>
</AdminShell>

<style>
  .total {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-wrap: wrap;
    margin-bottom: var(--space-md);
  }

  .search {
    flex: 1 1 18rem;
    min-width: 0;
  }

  .sort {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .sort label {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  input[type='search'],
  select {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    color: var(--color-text);
    font: inherit;
    font-size: 0.875rem;
  }

  .sort select {
    width: auto;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgb(184 147 90 / 18%);
  }

  select:disabled {
    opacity: 0.6;
  }

  .message {
    margin-bottom: var(--space-md);
  }

  .table-scroll {
    overflow-x: auto;
    transition: opacity 0.14s ease;
  }

  /* A refetch dims the table it is about to replace rather than blanking it. */
  .table-scroll.stale {
    opacity: 0.55;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th {
    padding: 0 var(--space-md) var(--space-sm);
    border-bottom: 1px solid var(--color-border);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: left;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  th:last-child,
  td:last-child {
    text-align: right;
  }

  td {
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: color-mix(in srgb, var(--color-surface) 28%, transparent);
  }

  .who {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 12rem;
  }

  .name {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-weight: 500;
    color: var(--color-ink);
  }

  .email {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    overflow-wrap: anywhere;
  }

  .badge {
    padding: 0.125rem var(--space-xs);
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--color-primary) 16%, var(--color-background));
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--color-primary) 82%, var(--color-ink));
  }

  .badge.blocked {
    background: color-mix(in srgb, var(--color-danger) 12%, var(--color-background));
    color: var(--color-danger);
  }

  tbody tr.is-blocked {
    background: color-mix(in srgb, var(--color-danger) 4%, transparent);
  }

  .row-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-xs);
    white-space: nowrap;
  }

  .no-actions {
    display: block;
    text-align: right;
    color: var(--color-text-muted);
  }

  .numeric {
    white-space: nowrap;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .numeric.dormant {
    color: color-mix(in srgb, var(--color-text-muted) 65%, var(--color-background));
  }

  .pager {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-md);
    margin-top: var(--space-md);
  }

  .pager-copy {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
