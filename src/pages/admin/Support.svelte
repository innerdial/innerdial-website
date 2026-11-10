<script>
  /**
   * What collectors sent from Support in the app. Each ticket opens to the full
   * message, with a reply that goes out from the operator's own mail client and
   * a resolve that takes it off the open list.
   */
  import AdminShell from '$lib/components/AdminShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Panel from '$lib/components/Panel.svelte';
  import { errorMessage } from '$lib/supabase/client.js';
  import { PAGE_SIZE, STATUS_FILTERS, fetchTickets, setTicketResolved } from '$lib/admin/support.js';
  import { formatCount, formatDate, formatRelative } from '$lib/utils/format.js';

  const SEARCH_DEBOUNCE_MS = 300;

  let searchInput = $state('');
  let search = $state('');
  let statusFilter = $state('open');
  let page = $state(0);

  let status = $state(/** @type {'loading' | 'ready' | 'error'} */ ('loading'));
  let error = $state('');
  let notice = $state('');

  /** @type {import('$lib/admin/support.js').SupportTicket[]} */
  let tickets = $state([]);
  let total = $state(0);

  let openId = $state('');
  let savingId = $state('');

  const pageCount = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const rangeStart = $derived(total === 0 ? 0 : page * PAGE_SIZE + 1);
  const rangeEnd = $derived(Math.min(total, (page + 1) * PAGE_SIZE));

  $effect(() => {
    const term = searchInput;
    const timer = setTimeout(() => {
      if (term !== search) {
        search = term;
        page = 0;
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  });

  $effect(() => {
    load({ status: statusFilter, search, page });
  });

  async function load(options) {
    status = 'loading';
    error = '';

    try {
      const result = await fetchTickets(options);
      tickets = result.tickets;
      total = result.total;
      status = 'ready';
    } catch (cause) {
      error = errorMessage(cause);
      status = 'error';
    }
  }

  /** @param {import('$lib/admin/support.js').SupportTicket} ticket */
  function replyHref(ticket) {
    const subject = encodeURIComponent(`Re: ${ticket.subject}`);
    return `mailto:${encodeURIComponent(ticket.reply_to)}?subject=${subject}`;
  }

  /** @param {import('$lib/admin/support.js').SupportTicket} ticket */
  async function toggleResolved(ticket) {
    const resolved = ticket.status !== 'resolved';
    savingId = ticket.id;
    notice = '';
    error = '';

    try {
      const updated = await setTicketResolved(ticket.id, resolved);
      const leavesFilter = statusFilter !== 'all' && updated.status !== statusFilter;

      if (leavesFilter) {
        tickets = tickets.filter((row) => row.id !== ticket.id);
        total = Math.max(0, total - 1);
        if (tickets.length === 0 && page > 0) {
          page -= 1;
        }
      } else {
        tickets = tickets.map((row) => (row.id === ticket.id ? { ...row, ...updated } : row));
      }

      notice = resolved ? `“${ticket.subject}” is resolved.` : `“${ticket.subject}” is open again.`;
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      savingId = '';
    }
  }
</script>

<AdminShell title="Support" subtitle="Messages collectors sent from Support in the app.">
  {#snippet actions()}
    <Button onclick={() => load({ status: statusFilter, search, page })} disabled={status === 'loading'}>
      Refresh
    </Button>
  {/snippet}

  <Panel>
    {#snippet actions()}
      <p class="total">{formatCount(total)} {total === 1 ? 'ticket' : 'tickets'}</p>
    {/snippet}

    <div class="controls">
      <div class="search">
        <label class="sr-only" for="ticket-search">Search subject, message or email</label>
        <input
          id="ticket-search"
          type="search"
          placeholder="Search subject, message or email"
          bind:value={searchInput}
        />
      </div>

      <div class="filter">
        <label for="ticket-status">Status</label>
        <select
          id="ticket-status"
          bind:value={statusFilter}
          onchange={() => {
            page = 0;
            openId = '';
          }}
        >
          {#each STATUS_FILTERS as option (option.value)}
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

    {#if status === 'loading' && tickets.length === 0}
      <Loader label="Loading tickets" />
    {:else if tickets.length === 0 && status !== 'error'}
      <Callout
        message={search
          ? `No ticket matches “${search}”.`
          : statusFilter === 'open'
            ? 'No open tickets. Everything has been answered.'
            : 'No tickets yet.'}
      />
    {:else}
      <ul class="tickets" class:stale={status === 'loading'}>
        {#each tickets as ticket (ticket.id)}
          {@const expanded = openId === ticket.id}
          {@const busy = savingId === ticket.id}
          <li class="ticket" class:resolved={ticket.status === 'resolved'}>
            <button
              type="button"
              class="ticket-head"
              aria-expanded={expanded}
              aria-controls="ticket-{ticket.id}"
              onclick={() => (openId = expanded ? '' : ticket.id)}
            >
              <span class="ticket-main">
                <span class="ticket-subject">
                  {ticket.subject}
                  <span class="badge" class:done={ticket.status === 'resolved'}>
                    {ticket.status === 'resolved' ? 'Resolved' : 'Open'}
                  </span>
                </span>
                <span class="ticket-meta">
                  {ticket.collector_name || 'Collector'} · {ticket.reply_to} · {ticket.topic}
                </span>
              </span>
              <span class="ticket-when" title={formatDate(ticket.created_at)}>
                {formatRelative(ticket.created_at)}
              </span>
            </button>

            {#if expanded}
              <div class="ticket-body" id="ticket-{ticket.id}">
                <p class="ticket-message">{ticket.message}</p>
                <p class="ticket-dates">
                  Sent {formatDate(ticket.created_at)}
                  {#if ticket.resolved_at}· resolved {formatDate(ticket.resolved_at)}{/if}
                </p>
                <div class="ticket-actions">
                  <a class="reply" href={replyHref(ticket)}>Reply by email</a>
                  <Button
                    size="sm"
                    variant={ticket.status === 'resolved' ? 'ghost' : 'primary'}
                    disabled={busy}
                    onclick={() => toggleResolved(ticket)}
                  >
                    {ticket.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
                  </Button>
                </div>
              </div>
            {/if}
          </li>
        {/each}
      </ul>

      {#if pageCount > 1}
        <nav class="pager" aria-label="Pages of tickets">
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

  .filter {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .filter label {
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

  .filter select {
    width: auto;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgb(184 147 90 / 18%);
  }

  .message {
    margin-bottom: var(--space-md);
  }

  .tickets {
    margin: 0;
    padding: 0;
    list-style: none;
    transition: opacity 0.14s ease;
  }

  .tickets.stale {
    opacity: 0.55;
  }

  .ticket {
    border-bottom: 1px solid var(--color-border);
  }

  .ticket:last-child {
    border-bottom: none;
  }

  .ticket-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .ticket-head:hover {
    background: color-mix(in srgb, var(--color-surface) 28%, transparent);
  }

  .ticket-head:focus-visible {
    outline: 3px solid rgb(184 147 90 / 20%);
    outline-offset: -3px;
  }

  .ticket-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .ticket-subject {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-ink);
    overflow-wrap: anywhere;
  }

  .ticket.resolved .ticket-subject {
    color: var(--color-text-muted);
  }

  .ticket-meta {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    overflow-wrap: anywhere;
  }

  .ticket-when {
    flex: none;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .badge {
    flex: none;
    padding: 0.125rem var(--space-xs);
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--color-primary) 16%, var(--color-background));
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--color-primary) 82%, var(--color-ink));
  }

  .badge.done {
    background: var(--color-surface);
    color: var(--color-text-muted);
  }

  .ticket-body {
    padding: 0 var(--space-md) var(--space-md);
  }

  .ticket-message {
    margin: 0;
    padding: var(--space-md);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-surface) 35%, var(--color-background));
    font-size: 0.875rem;
    line-height: 1.55;
    color: var(--color-text);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .ticket-dates {
    margin: var(--space-sm) 0 0;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .ticket-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-md);
    margin-top: var(--space-sm);
  }

  .reply {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-primary);
  }

  .reply:hover {
    color: var(--color-primary-hover);
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
