<script>
  /**
   * The frame every admin screen renders inside: the side nav on the left, a
   * page header and the screen's own content on the right.
   *
   * Desktop-first, unlike the collector app — the console is operated at a desk.
   * Under 900px the nav collapses to a row above the content rather than
   * disappearing behind a drawer, because it is five links.
   */
  import { Link, useLocation } from 'svelte-routing';
  import { appConfig } from '$lib/utils/config.js';
  import { operatorName, signOut } from '$lib/auth/session.svelte.js';
  import { errorMessage } from '$lib/supabase/client.js';

  let { title = '', subtitle = '', actions, children } = $props();

  const location = useLocation();

  const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', exact: true, icon: 'dashboard' },
    { href: '/admin/users', label: 'Users', exact: false, icon: 'users' },
    { href: '/admin/news', label: 'News', exact: false, icon: 'news' },
    { href: '/admin/tips', label: 'Watchmaker tips', exact: false, icon: 'tips' },
    { href: '/admin/licenses', label: 'Licenses', exact: false, icon: 'licenses' },
  ];

  let signingOut = $state(false);
  let signOutError = $state('');

  const pathname = $derived($location.pathname.replace(/\/+$/, '') || '/admin');

  /** @param {{ href: string, exact: boolean }} item */
  function isActive(item) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  async function handleSignOut() {
    signingOut = true;
    signOutError = '';

    try {
      await signOut();
      window.location.assign('/admin/login');
    } catch (error) {
      signOutError = errorMessage(error);
      signingOut = false;
    }
  }
</script>

<svelte:head>
  <title>{title ? `${title} · ` : ''}Admin · {appConfig.appName}</title>
</svelte:head>

{#snippet navIcon(name)}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if name === 'dashboard'}
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="11" width="7" height="9.5" rx="1.5" />
    {:else if name === 'users'}
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.6" />
      <path d="M17 14.5a5 5 0 0 1 3.5 4.8" />
    {:else if name === 'news'}
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M7 9.5h5.5M7 13h5.5M7 16h3.5" />
      <path d="M16 9.5h1.5v4H16z" />
    {:else if name === 'licenses'}
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
      <path d="M7 3.5V2.5M17 3.5V2.5" />
    {:else}
      <path d="M9 18h6M10 21h4" />
      <path
        d="M12 3a5.5 5.5 0 0 1 5.5 5.5c0 2.2-1.2 3.9-2.5 5.1-.8.7-1.5 1.6-1.5 2.9h-3c0-1.3-.7-2.2-1.5-2.9C7.7 12.4 6.5 10.7 6.5 8.5A5.5 5.5 0 0 1 12 3Z"
      />
    {/if}
  </svg>
{/snippet}

<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <img src="/images/innerdial_logo.svg" alt="" width="28" height="28" />
      <div class="brand-copy">
        <p class="brand-name">{appConfig.appName}</p>
        <p class="brand-role">Admin console</p>
      </div>
    </div>

    <nav class="nav" aria-label="Admin sections">
      {#each NAV_ITEMS as item (item.href)}
        <Link to={item.href} class="nav-link" aria-current={isActive(item) ? 'page' : undefined}>
          <span class="nav-icon">{@render navIcon(item.icon)}</span>
          {item.label}
        </Link>
      {/each}
    </nav>

    <div class="operator">
      <p class="operator-name">{operatorName()}</p>
      <button type="button" class="sign-out" onclick={handleSignOut} disabled={signingOut}>
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
      {#if signOutError}
        <p class="operator-error" role="alert">{signOutError}</p>
      {/if}
    </div>
  </aside>

  <div class="main">
    <header class="page-head">
      <div class="page-copy">
        <h1>{title}</h1>
        {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
      </div>
      {#if actions}
        <div class="page-actions">{@render actions()}</div>
      {/if}
    </header>

    <main class="content">
      {@render children?.()}
    </main>
  </div>
</div>

<style>
  .shell {
    display: grid;
    grid-template-columns: 15rem 1fr;
    min-height: 100dvh;
    background: color-mix(in srgb, var(--color-surface) 32%, var(--color-background));
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
    padding: var(--space-lg) var(--space-md);
    background: var(--color-ink);
    color: #fff;
    /* The nav stays put while a long users table scrolls past it. */
    position: sticky;
    top: 0;
    height: 100dvh;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 0 var(--space-sm);
  }

  .brand img {
    display: block;
    flex: 0 0 auto;
  }

  .brand-copy {
    min-width: 0;
  }

  .brand-name {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .brand-role {
    margin: 0;
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .nav {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-height: 0;
  }

  /*
    :global because the anchor is rendered by svelte-routing's Link, which is a
    different component — a scoped selector would never reach it.
  */
  .nav :global(.nav-link) {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-sm);
    border-radius: var(--radius-md);
    color: rgb(255 255 255 / 72%);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition:
      background 0.14s ease,
      color 0.14s ease;
  }

  .nav :global(.nav-link:hover) {
    background: rgb(255 255 255 / 7%);
    color: #fff;
  }

  .nav :global(.nav-link[aria-current='page']) {
    background: rgb(255 255 255 / 11%);
    color: #fff;
  }

  .nav :global(.nav-link[aria-current='page'] .nav-icon) {
    color: var(--color-primary);
  }

  .nav :global(.nav-link:focus-visible) {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }

  .nav-icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    color: rgb(255 255 255 / 55%);
  }

  .nav-icon :global(svg) {
    width: 1.125rem;
    height: 1.125rem;
  }

  .operator {
    padding: var(--space-sm);
    border-top: 1px solid rgb(255 255 255 / 12%);
  }

  .operator-name {
    margin: var(--space-sm) 0 var(--space-xs);
    font-size: 0.8125rem;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .sign-out {
    padding: 0;
    border: none;
    background: none;
    color: rgb(255 255 255 / 60%);
    font: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .sign-out:hover:not(:disabled) {
    color: var(--color-primary);
  }

  .sign-out:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .operator-error {
    margin: var(--space-xs) 0 0;
    font-size: 0.75rem;
    color: #f0a3a3;
  }

  .main {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .page-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-lg);
    flex-wrap: wrap;
    padding: var(--space-xl) var(--space-xl) var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-background);
  }

  .page-copy {
    min-width: 0;
  }

  .page-head h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.2;
    color: var(--color-ink);
  }

  .subtitle {
    margin: var(--space-xs) 0 0;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .page-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .content {
    flex: 1;
    padding: var(--space-lg) var(--space-xl) var(--space-xl);
  }

  @media (max-width: 900px) {
    .shell {
      grid-template-columns: 1fr;
    }

    .sidebar {
      position: static;
      height: auto;
      flex-direction: row;
      align-items: center;
      gap: var(--space-lg);
      flex-wrap: wrap;
    }

    .nav {
      flex: 1 1 100%;
      flex-direction: row;
      flex-wrap: wrap;
    }

    .operator {
      border-top: none;
      padding: 0;
    }

    .operator-name {
      margin: 0 0 var(--space-xs);
    }

    .page-head,
    .content {
      padding-left: var(--space-lg);
      padding-right: var(--space-lg);
    }
  }
</style>
