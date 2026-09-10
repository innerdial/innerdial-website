<script>
  /**
   * The chrome around the account area.
   *
   * Deliberately its own shell rather than the console's `AdminShell`. The two
   * look similar for a page or two and then diverge: the console is a working
   * tool with a sidebar of sections, and this is two tabs a collector visits
   * twice a year. Sharing one would mean a component that grows a `variant`
   * prop the first time either side needs anything of its own.
   *
   * It carries no vault data and never will. The collection lives in the app —
   * this is the account behind it: who you are, how you sign in, and what you
   * pay. Anything that lists watches belongs on the other side of that line.
   */
  import { Link, navigate } from 'svelte-routing';

  import { appConfig } from '$lib/utils/config.js';
  import { signOut } from '$lib/auth/session.svelte.js';

  /** @type {{ title: string, lede?: string, children?: any }} */
  let { title, lede = '', children } = $props();

  let signingOut = $state(false);

  const TABS = [
    { to: '/account', label: 'Account' },
    { to: '/account/membership', label: 'Membership' },
  ];

  /**
   * svelte-routing spreads whatever this returns onto the anchor, which is the
   * only way to mark the current tab from outside the Link component. Only the
   * class: `Link` sets `aria-current="page"` on the matching route itself, so
   * repeating it here would be a second copy to keep in step.
   *
   * @param {{ isCurrent: boolean }} state
   */
  function tabProps({ isCurrent }) {
    return { class: isCurrent ? 'tab current' : 'tab' };
  }

  async function handleSignOut() {
    if (signingOut) return;
    signingOut = true;

    try {
      await signOut();
    } catch (cause) {
      // The local session is cleared either way; a failed network round trip is
      // not a reason to keep someone on a page they asked to leave.
      console.warn('[account] sign out did not reach Supabase:', cause);
    } finally {
      navigate('/', { replace: true });
    }
  }
</script>

<svelte:head>
  <title>{title} · {appConfig.appName}</title>
  <meta name="robots" content="noindex" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="account">
  <header class="bar">
    <div class="bar-inner">
      <a class="brand" href="/">
        <img src="/images/innerdial_logo.svg" alt="" width="32" height="32" />
        <span>{appConfig.appName}</span>
      </a>

      <nav class="tabs" aria-label="Account">
        {#each TABS as tab (tab.to)}
          <Link to={tab.to} getProps={tabProps}>{tab.label}</Link>
        {/each}
      </nav>

      <button class="sign-out" type="button" onclick={handleSignOut} disabled={signingOut}>
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  </header>

  <main class="page">
    <header class="head">
      <h1>{title}</h1>
      {#if lede}<p class="lede">{lede}</p>{/if}
    </header>

    {@render children?.()}
  </main>
</div>

<style>
  /*
    The account area borrows the site's display serif and its ink, but not
    `site.css` — that stylesheet is the marketing page's, and importing it here
    would put seventy kilobytes of section styling into the chunk for two forms.
    What is actually shared is named below.
  */
  .account {
    --font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    --paper-warm: #fbfaf8;
    --ink-900: #070f19;

    min-height: 100dvh;
    background: var(--paper-warm);
    color: var(--color-text);
  }

  .bar {
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid var(--color-border);
    background: rgb(255 255 255 / 88%);
    backdrop-filter: blur(14px) saturate(160%);
  }

  .bar-inner {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    width: 100%;
    max-width: 52rem;
    margin-inline: auto;
    min-height: 4rem;
    padding-inline: var(--space-lg);
  }

  .brand {
    display: flex;
    flex: 0 0 auto;
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

  .tabs {
    display: flex;
    gap: var(--space-md);
    margin-left: auto;
  }

  /*
    :global because the anchor is rendered by svelte-routing's Link, not by this
    component — a scoped selector has nothing here to attach to.
  */
  .tabs :global(.tab) {
    position: relative;
    padding: 0.35rem 0;
    font-size: 0.9375rem;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.16s ease;
  }

  .tabs :global(.tab:hover) {
    color: var(--color-ink);
  }

  .tabs :global(.tab.current) {
    color: var(--color-ink);
    font-weight: 600;
  }

  .tabs :global(.tab.current)::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: -0.35rem;
    left: 0;
    height: 2px;
    border-radius: 2px;
    background: var(--color-primary);
  }

  .tabs :global(.tab:focus-visible) {
    outline: 3px solid rgb(184 147 90 / 45%);
    outline-offset: 3px;
    border-radius: var(--radius-sm);
  }

  .sign-out {
    flex: 0 0 auto;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.16s ease;
  }

  .sign-out:hover:not(:disabled) {
    color: var(--color-danger);
  }

  .sign-out:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .page {
    width: 100%;
    max-width: 52rem;
    margin-inline: auto;
    padding: var(--space-xl) var(--space-lg) 5rem;
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
    max-width: 34rem;
    margin: var(--space-sm) 0 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-text-muted);
  }

  @media (max-width: 34rem) {
    .bar-inner {
      flex-wrap: wrap;
      row-gap: 0;
      padding-block: var(--space-sm);
    }

    .tabs {
      order: 3;
      flex-basis: 100%;
      margin-left: 0;
      padding-top: var(--space-sm);
    }
  }
</style>
