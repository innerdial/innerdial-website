<script>
  /**
   * The terms of service.
   *
   * Public and eager, for the same reasons as `Privacy.svelte`: the app stores
   * want a reachable terms URL and there is nothing here that needs Supabase.
   *
   * Every clause is meant to describe what the product actually does. The
   * billing rules below are the behaviour of `razorpay-subscription` and
   * `razorpay-webhook` in the sibling `innerdial` repo, the five-piece free cap
   * is the `free` licence seeded in its migrations, and the deletion clause is
   * the `delete-account` function — so a change to any of those is a change to
   * this page.
   *
   * Prices are deliberately not quoted. They live in `$lib/site/plan.js` and on
   * the Razorpay plans it mirrors; a third copy here would eventually disagree
   * with the number someone is actually charged.
   */
  import { appConfig } from '$lib/utils/config.js';

  const SUPPORT_EMAIL = 'hello@innerdial.com';
  const UPDATED = '6 November 2026';

  /**
   * The registered identity behind the service, and the seat of the courts that
   * hear a dispute about it. The only two facts on this page that cannot be read
   * off the code — a terms page that names no entity binds nobody.
   */
  const COMPANY = 'Meltingcubes Private Limited';
  const CITY = 'Hyderabad';
</script>

<svelte:head>
  <title>Terms of service · {appConfig.appName}</title>
  <meta
    name="description"
    content="The terms you agree to when you use Innerdial — your account, your collection, membership billing, cancellation and the limits of the service."
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
      <h1>Terms of service</h1>
      <p class="lede">
        {appConfig.appName} keeps a private record of the watches you own. These terms are the
        agreement between you and us about how that works — what you may do with the service, what
        we owe you, and what happens to your collection and your membership if either of us walks
        away.
      </p>
      <p class="updated">Last updated {UPDATED}</p>
    </header>

    <section class="card" aria-labelledby="agreement">
      <h2 id="agreement">This agreement</h2>
      <p class="note flush">
        {appConfig.appName} is operated by {COMPANY}, a company registered in India. By creating an
        account, or by using the {appConfig.appName} app or this website, you accept these terms. If you do not accept them, do not use the service. Our
        <a href="/privacy">privacy policy</a> explains what we collect and forms part of this
        agreement.
      </p>
    </section>

    <section class="card" aria-labelledby="service">
      <h2 id="service">What the service is</h2>
      <p class="note flush">
        A record-keeping tool. You enter the watches you own, with their photos, papers, purchase
        and service history, and we store them for you and sync them between your devices. There is
        no feed, no marketplace and nothing for sale but the membership itself.
      </p>
      <p class="note">
        It is not a valuation, insurance, authentication or investment service. Any value you record
        is the figure you entered, and nothing in the app is advice about what a watch is worth or
        whether to buy or sell one. The watchmaker tips and news stories we publish are general
        interest — for anything that touches your own piece, ask your watchmaker.
      </p>
    </section>

    <section class="card" aria-labelledby="account">
      <h2 id="account">Your account</h2>
      <ul class="list">
        <li>
          You must be 18 or older, and the details on your account must be accurate and yours.
        </li>
        <li>
          Your account is personal. Keep your password to yourself; anything done with your sign-in
          is treated as done by you.
        </li>
        <li>
          Tell us at <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a> if you think someone else
          has reached your account.
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="content">
      <h2 id="content">Your collection stays yours</h2>
      <p class="note flush">
        Everything you record belongs to you. You give us only the permission we need to run the
        service — to store your entries, photos and documents, show them back to you on your
        devices, and keep them in our backups. We claim no ownership of them, we do not publish
        them, and we do not sell or share them.
      </p>
      <p class="note">
        Access is enforced in the database itself: your watches, photos and documents cannot be
        opened by our staff. You are responsible for what you upload — that you have the right to
        it, and that it is lawful.
      </p>
      <p class="note">
        The app can export your collection as a spreadsheet at any time, on any plan. Please use it.
        Keeping your own copy of anything you would hate to lose is the one precaution no service
        can take for you.
      </p>
    </section>

    <section class="card" aria-labelledby="membership">
      <h2 id="membership">Membership, trial and renewal</h2>
      <ul class="list">
        <li>
          <strong>The trial</strong> — every new account gets 14 days with the full membership. It
          ends on its own; no card is needed to start it and nothing is charged when it finishes.
        </li>
        <li>
          <strong>The price</strong> — whatever is shown on the membership page when you subscribe,
          in Indian rupees, for the plan you pick.
        </li>
        <li>
          <strong>Payment</strong> — taken by Razorpay. Your card, UPI or bank details are entered
          on Razorpay's page and never reach us. Razorpay sends the receipt for each payment.
        </li>
        <li>
          <strong>Renewal</strong> — a membership renews automatically at the end of each period
          under the mandate you approve at checkout, until you cancel it.
        </li>
        <li>
          <strong>If a payment fails</strong> — Razorpay retries it. Your membership keeps working
          while it does. If the retries run out, the membership stops and your account moves to the
          free tier.
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="price-lock">
      <h2 id="price-lock">Your price is locked</h2>
      <p class="note flush">
        We sell the founding membership on the promise that what you pay today is what you pay in
        ten years, and we mean it. While your membership runs without a break, we will not raise its
        price. A new price applies only to people subscribing after it changes — or to you, at the
        price then current, if your membership ends and you later start a new one.
      </p>
    </section>

    <section class="card" aria-labelledby="cancelling">
      <h2 id="cancelling">Cancelling, and refunds</h2>
      <ul class="list">
        <li>
          <strong>Cancel whenever you like</strong> — from your membership page, with no notice and
          no reason needed.
        </li>
        <li>
          <strong>You keep what you paid for</strong> — cancelling stops the next renewal. Your
          membership stays live until the end of the period already paid for, and we do not cut it
          short.
        </li>
        <li>
          <strong>Payments are not refunded</strong> — because the time you bought is served in
          full rather than returned. That includes part-used periods and a renewal you meant to
          cancel before it fell due.
        </li>
        <li>
          <strong>If something went wrong</strong> — a charge you do not recognise, a double
          payment, or a failure on our side — write to
          <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a> and we will put it right.
        </li>
      </ul>
      <p class="note">
        Nothing here takes away a refund you are entitled to under Indian consumer law.
      </p>
    </section>

    <section class="card" aria-labelledby="free-tier">
      <h2 id="free-tier">When a membership ends</h2>
      <p class="note flush">
        Your collection is not held hostage. An account without a membership keeps every piece it
        has recorded and stays able to read, edit, sell off and export all of it. What the free tier
        limits is adding more: it holds up to five pieces, so an account already above that keeps
        what it has and is asked to subscribe before filing the next one.
      </p>
    </section>

    <section class="card" aria-labelledby="use">
      <h2 id="use">How you may not use it</h2>
      <ul class="list">
        <li>Reaching, or trying to reach, another collector's account or data.</li>
        <li>
          Probing, overloading or interfering with the service, or working around its security,
          membership limits or billing.
        </li>
        <li>
          Scraping or bulk-copying the service, or reselling access to it. Automated use of our API
          beyond what the app and this website do needs our written permission.
        </li>
        <li>Uploading anything unlawful, or anything you have no right to upload.</li>
        <li>Using the service to break the law.</li>
      </ul>
      <p class="note">
        Finding a security flaw is not a breach of these terms — telling us about it at
        <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a> instead of using it is welcome, and we
        will not come after you for it.
      </p>
    </section>

    <section class="card" aria-labelledby="availability">
      <h2 id="availability">Availability and changes</h2>
      <p class="note flush">
        We work to keep {appConfig.appName} running and will not promise it is never interrupted.
        Maintenance, an outage at one of the providers we depend on, or a problem of our own can put
        it out of reach for a while. The app keeps a copy of your collection on your phone so it
        still opens without a signal.
      </p>
      <p class="note">
        The service changes as we build it. We may add, alter or retire features; if we remove
        something a paid membership is sold on, we will tell members before it goes.
      </p>
    </section>

    <section class="card" aria-labelledby="ending">
      <h2 id="ending">Ending the agreement</h2>
      <ul class="list">
        <li>
          <strong>You, at any time</strong> — <a href="/delete-account">delete your account</a>.
          Deletion is immediate and permanent, takes your collection and files with it, and cancels
          any membership on the spot. There is no refund for the rest of the period, so you may
          prefer to cancel and delete at the end of it.
        </li>
        <li>
          <strong>Us, for a breach of these terms</strong> — we may suspend or close an account that
          breaks them, or that is being used to harm other collectors or the service. Where it is
          reasonable to do so we will warn you first and give you a chance to export your data.
        </li>
        <li>
          <strong>Us, if we stop running the service</strong> — we would give notice, with time to
          export everything, and not take payment for a period we could not serve.
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="liability">
      <h2 id="liability">What we are responsible for</h2>
      <p class="note flush">
        We provide the service with reasonable care and skill. Beyond that, and as far as the law
        allows, it is provided as it is: we do not warrant that it will suit a particular purpose,
        or that what you record in it is accurate — that part is your entry.
      </p>
      <p class="note">
        We are not liable for loss of profit or opportunity, for the value of a watch, for a
        decision you took on the basis of something in the app, or for data you lost where an export
        was available to you. Where we are liable, our total liability to you is limited to what you
        paid us in the twelve months before the claim.
      </p>
      <p class="note">
        Nothing in these terms limits liability that cannot be limited by law — including for death
        or personal injury caused by negligence, for fraud, or under India's consumer protection
        laws.
      </p>
    </section>

    <section class="card" aria-labelledby="changes">
      <h2 id="changes">Changes to these terms</h2>
      <p class="note flush">
        If we change them, we will update this page and the date at the top. For a change that
        materially affects a paying member — the price lock above, cancellation, or what we are
        responsible for — we will tell members by email before it takes effect. Carrying on with the
        service after that is how you accept the new terms; if you would rather not, cancel or
        delete your account.
      </p>
    </section>

    <section class="card" aria-labelledby="law">
      <h2 id="law">Governing law</h2>
      <p class="note flush">
        These terms are governed by the laws of India, and the courts at {CITY} have exclusive
        jurisdiction over any dispute arising out of them. Before going to court, please write to us
        at <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a> — nearly everything is quicker to fix
        that way.
      </p>
    </section>

    <section class="card" aria-labelledby="contact">
      <h2 id="contact">Contact</h2>
      <p class="note flush">
        {COMPANY} — <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a>. Write from the address on
        your account and we will know it is you.
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
