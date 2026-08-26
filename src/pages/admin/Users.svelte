<script>
  /**
   * Every collector with an account, and the one thing the console may change
   * about them: their membership tier.
   *
   * Deliberately not a window into anyone's vault. The tier is a commercial
   * decision an operator has to be able to make; the watches are the collector's.
   */
  import AdminShell from '$lib/components/AdminShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Panel from '$lib/components/Panel.svelte';
  import { errorMessage } from '$lib/supabase/client.js';
  import {
    MEMBERSHIP_TIERS,
    PAGE_SIZE,
    SORT_OPTIONS,
    fetchUsers,
    tierLabel,
    updateMembershipTier,
  } from '$lib/admin/users.js';
  import { formatCount, formatDate, formatRelative } from '$lib/utils/format.js';

  /** Long enough that typing a name is not one request per keystroke. */
  const SEARCH_DEBOUNCE_MS = 300;

  let searchInput = $state('');
  let search = $state('');
  let sort = $state('created_at');
  let page = $state(0);

  let status = $state(/** @type {'loading' | 'ready' | 'error'} */ ('loading'));
  let error = $state('');
  let notice = $state('');

  /** @type {import('$lib/admin/users.js').AdminUser[]} */
  let users = $state([]);
  let total = $state(0);

  /** The row whose tier is mid-save, so only its own select is disabled. */
  let savingId = $state('');

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
    load({ search, sort, page });
  });

  async function load(options) {
    status = 'loading';
    error = '';

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
   * @param {string} tier
   */
  async function changeTier(user, tier) {
    if (tier === user.membership_tier) return;

    const previous = user.membership_tier;
    savingId = user.id;
    notice = '';
    error = '';

    // Moved before the request so the select does not snap back while it flies.
    users = users.map((row) => (row.id === user.id ? { ...row, membership_tier: tier } : row));

    try {
      await updateMembershipTier(user.id, tier);
      notice = `${user.full_name || user.email || 'Collector'} is now ${tierLabel(tier)}.`;
    } catch (cause) {
      users = users.map((row) =>
        row.id === user.id ? { ...row, membership_tier: previous } : row,
      );
      error = errorMessage(cause);
    } finally {
      savingId = '';
    }
  }
</script>

<AdminShell title="Users" subtitle="Every collector holding an Innerdial account.">
  {#snippet actions()}
    <Button onclick={() => load({ search, sort, page })} disabled={status === 'loading'}>
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
              <th scope="col">Membership</th>
            </tr>
          </thead>
          <tbody>
            {#each users as user (user.id)}
              <tr>
                <td>
                  <div class="who">
                    <span class="name">
                      {user.full_name || 'Unnamed collector'}
                      {#if user.is_admin}<span class="badge">Admin</span>{/if}
                    </span>
                    <span class="email">{user.email ?? 'No email on file'}</span>
                  </div>
                </td>
                <td class="numeric">{formatDate(user.created_at)}</td>
                <td class="numeric" class:dormant={!user.last_seen_at}>
                  {formatRelative(user.last_seen_at)}
                </td>
                <td>
                  <label class="sr-only" for="tier-{user.id}">
                    Membership tier for {user.full_name || user.email}
                  </label>
                  <select
                    id="tier-{user.id}"
                    value={user.membership_tier}
                    disabled={savingId === user.id}
                    onchange={(event) => changeTier(user, event.currentTarget.value)}
                  >
                    {#each MEMBERSHIP_TIERS as tier (tier.slug)}
                      <option value={tier.slug}>{tier.label}</option>
                    {/each}
                    {#if !MEMBERSHIP_TIERS.some((tier) => tier.slug === user.membership_tier)}
                      <option value={user.membership_tier}>{user.membership_tier}</option>
                    {/if}
                  </select>
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
