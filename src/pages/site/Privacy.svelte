<script>
  /**
   * The privacy policy.
   *
   * Public and eager: the app stores require a reachable policy URL, and there
   * is nothing here that needs Supabase. Every claim is meant to match what the
   * app and schema in the sibling `innerdial` repo actually do — when a table,
   * a processor or an SDK is added there, this page is part of that change.
   */
  import { appConfig } from '$lib/utils/config.js';

  const SUPPORT_EMAIL = 'hello@innerdial.com';
  const UPDATED = '28 September 2026';
</script>

<svelte:head>
  <title>Privacy policy · {appConfig.appName}</title>
  <meta
    name="description"
    content="What Innerdial collects, why, who processes it, and how to see, export or delete it."
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
      <h1>Privacy policy</h1>
      <p class="lede">
        {appConfig.appName} keeps a record of the watches you own. A list of valuable objects and
        their serial numbers is exactly the kind of document you would least like to leak, so we
        collect as little as the app needs, show it to nobody else, and never sell it.
      </p>
      <p class="updated">Last updated {UPDATED}</p>
    </header>

    <section class="card" aria-labelledby="scope">
      <h2 id="scope">Who this covers</h2>
      <p class="note flush">
        This policy applies to the {appConfig.appName} app for Android and iOS and to this website.
        {appConfig.appName} is responsible for the personal data described here. Questions about it
        go to <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a>.
      </p>
    </section>

    <section class="card" aria-labelledby="collected">
      <h2 id="collected">What we collect</h2>
      <ul class="list">
        <li>
          <strong>Your account</strong> — your name, email address and password. The password is
          stored only as a one-way hash; we cannot read it.
        </li>
        <li>
          <strong>Your collection</strong> — the watches you add, with the photos, papers, purchase
          and service records, wear log and travel boxes you choose to record against them.
        </li>
        <li>
          <strong>Your membership</strong> — its plan, status and renewal dates, and for each
          payment the amount, the date, the method type (for example card or UPI) and Razorpay’s
          reference for it. Card numbers, UPI IDs and bank details are entered on Razorpay’s page
          and never reach us.
        </li>
        <li>
          <strong>When you were last active</strong> — a single timestamp, updated when you use the
          app, so we can see how many collectors are active and spot abandoned accounts.
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="not-collected">
      <h2 id="not-collected">What we do not collect</h2>
      <ul class="list">
        <li>
          <strong>No face or fingerprint data.</strong> The biometric lock is handled by your phone’s
          operating system. The app is told only whether the check passed.
        </li>
        <li>
          <strong>No photos you did not choose.</strong> The camera and photo library are opened
          only when you add a picture, and only that picture is uploaded.
        </li>
        <li>
          <strong>No advertising, analytics or tracking.</strong> There are no ad networks,
          analytics SDKs or tracking cookies in the app or on this website.
        </li>
        <li>
          <strong>No location, contacts or social graph.</strong> There is no feed and no
          marketplace, so there is nothing to share and nobody to share it with.
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="use">
      <h2 id="use">How we use it</h2>
      <ul class="list">
        <li>To keep your collection and sync it between your devices.</li>
        <li>To sign you in, and to keep your membership and its features working.</li>
        <li>To answer you when you write to us, and to stop abuse of the service.</li>
        <li>
          To count, in aggregate, how the service is used — how many accounts, watches and active
          collectors there are.
        </li>
      </ul>
      <p class="note">
        We do not sell, rent or trade your data, and we do not use it for advertising.
      </p>
    </section>

    <section class="card" aria-labelledby="processors">
      <h2 id="processors">Who processes it for us</h2>
      <ul class="list">
        <li>
          <strong>Supabase</strong> hosts our database, sign-in and file storage. Your photos and
          documents sit in private storage that only your account can read.
        </li>
        <li>
          <strong>Razorpay</strong> takes membership payments. It keeps its own records of those
          payments under its privacy policy and for as long as financial regulations require.
        </li>
        <li>
          <strong>Netlify</strong> serves this website, and <strong>Google Fonts</strong> serves its
          typefaces. Like any web server, both see your IP address and browser when a page loads.
        </li>
        <li>
          <strong>Google Play and the App Store</strong> deliver the app, under their own terms.
        </li>
      </ul>
      <p class="note">
        These providers process data only to run their part of the service. Some of them operate
        outside India, so your data may be stored or processed in other countries.
      </p>
    </section>

    <section class="card" aria-labelledby="access">
      <h2 id="access">Who can see your collection</h2>
      <p class="note flush">
        Only you. Access is enforced in the database itself, not just in the app. Our staff can see
        account details — your name, email, membership and when you were last active — and how many
        watches an account holds, so they can support you and moderate the service. They cannot
        open your watches, photos or documents.
      </p>
    </section>

    <section class="card" aria-labelledby="device">
      <h2 id="device">What stays on your device</h2>
      <ul class="list">
        <li>
          The app keeps a copy of your collection on the phone so it works without a signal. It is
          removed when you uninstall the app.
        </li>
        <li>
          This website stores your sign-in session and whether you muted its ambient sound in your
          browser’s local storage. Neither is used to track you.
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="rights">
      <h2 id="rights">Your choices and rights</h2>
      <ul class="list">
        <li>
          <strong>See and correct</strong> — everything you recorded is visible and editable in the
          app. Your name can also be changed from your account on this website.
        </li>
        <li>
          <strong>Take it with you</strong> — export your collection from the app as a spreadsheet.
        </li>
        <li>
          <strong>Delete it</strong> — <a href="/delete-account">delete your account</a> at any time.
          Deletion is immediate and permanent, and cancels any membership. Copies inside our
          encrypted backups are overwritten as those backups expire.
        </li>
        <li>
          <strong>Ask us</strong> — for a copy of the data we hold about you, or anything this page
          does not answer, email <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a> from the
          address on your account.
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="retention">
      <h2 id="retention">How long we keep it</h2>
      <p class="note flush">
        For as long as you have an account. When you delete it, your profile, collection, files and
        membership records are removed straight away.
      </p>
    </section>

    <section class="card" aria-labelledby="children">
      <h2 id="children">Children</h2>
      <p class="note flush">
        {appConfig.appName} is not intended for anyone under 18, and we do not knowingly collect data
        from children. If you believe a child has created an account, write to us and we will delete
        it.
      </p>
    </section>

    <section class="card" aria-labelledby="changes">
      <h2 id="changes">Changes to this policy</h2>
      <p class="note flush">
        If we change what we collect or who processes it, we will update this page and the date at
        the top.
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

  .updated {
    margin: var(--space-md) 0 0;
    font-size: 0.8125rem;
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

  .list strong {
    color: var(--color-ink);
    font-weight: 600;
  }

  .note {
    max-width: 36rem;
    margin: var(--space-md) 0 0;
    font-size: 0.875rem;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .note.flush {
    margin: 0;
  }

  a:not(.brand) {
    color: var(--color-ink);
    text-decoration-color: var(--color-primary);
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
  }

  a:focus-visible {
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
