<script>
  /**
   * Replicas of the collector app's screens, for use inside `AppFrame`.
   *
   * These are rebuilt from the app's own tokens rather than screenshotted. A
   * screenshot would be a large raster that blurs on a retina display, cannot
   * animate, and goes stale the moment the app ships a change nobody thinks to
   * re-capture. Rebuilt in markup they stay sharp, weigh nothing, and the
   * showcase can cross-fade between them.
   *
   * Every length is a multiple of `--px`, a container-relative "reference
   * pixel" — see `AppFrame`'s `.screen`. The numbers are therefore the same
   * numbers the app's stylesheets use, and the whole screen scales with the
   * frame it is dropped into.
   *
   * @type {{ screen?: 'dashboard' | 'vault' | 'wear' | 'tools' }}
   */
  let { screen = 'dashboard' } = $props();

  /** The nav pill's tabs, in the app's default order. */
  const TABS = ['Home', 'Vault', 'Tools', 'News', 'More'];

  /** Which tab the pill marks for each screen. */
  const ACTIVE_TAB = { dashboard: 'Home', vault: 'Vault', wear: 'Home', tools: 'Tools' };

  /*
    Stand-in collection. Dial faces are drawn in CSS rather than photographed —
    a collector's photos are theirs, and invented product photography of real
    brands on a marketing page would be a claim we have no business making.
  */
  const PIECES = [
    { brand: 'Omega', model: 'Speedmaster', ref: '310.30.42', face: 'onyx' },
    { brand: 'Grand Seiko', model: 'Snowflake', ref: 'SBGA211', face: 'silver' },
    { brand: 'Cartier', model: 'Tank Louis', ref: 'WGTA0067', face: 'champagne' },
    { brand: 'Tudor', model: 'Black Bay 58', ref: 'M79030B', face: 'navy' },
    { brand: 'JLC', model: 'Reverso', ref: 'Q3978480', face: 'silver' },
    { brand: 'Rolex', model: 'Explorer', ref: '124270', face: 'onyx' },
  ];

  const TIMELINE = [
    { date: 'Aug 2026', label: 'Serviced', subject: 'Speedmaster' },
    { date: 'Jun 2026', label: 'Acquired', subject: 'Tank Louis' },
    { date: 'Mar 2026', label: 'Papers filed', subject: 'Snowflake' },
  ];

  const TOOLS = [
    { category: 'Astronomy', name: 'Moonphase', description: 'Set your moonphase precisely.' },
    { category: 'Timekeeping', name: 'Atomic Clock', description: 'Reference time to the second.' },
    { category: 'Travel', name: 'World Time', description: 'Set a second time zone.' },
    { category: 'Calibration', name: 'Accuracy', description: 'Seconds a day, gained or lost.' },
  ];

  /** Seven days of wear, most recent last. `null` is a day off the wrist. */
  const WEEK = ['onyx', 'silver', null, 'navy', 'onyx', 'champagne', 'silver'];
  const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
</script>

<div class="app-screen" data-screen={screen}>
  <div class="status">
    <span class="clock">9:41</span>
    <span class="indicators">
      <span class="bars"><i></i><i></i><i></i><i></i></span>
      <span class="battery"></span>
    </span>
  </div>

  <div class="body">
    {#if screen === 'dashboard'}
      <header class="intro">
        <h1 class="headline">Good evening, Patrick.</h1>
      </header>

      <section class="card tip">
        <p class="eyebrow">Watchmaker's note</p>
        <p class="tip-body">
          Never set the date between 9pm and 3am — the change wheel is engaged and
          the teeth can shear.
        </p>
      </section>

      <section class="card">
        <h2 class="card-title">What's on the wrist today?</h2>
        <div class="wotd-row">
          {#each PIECES.slice(0, 4) as piece (piece.ref)}
            <span class="dial sm" data-face={piece.face}></span>
          {/each}
          <span class="dial sm more">+</span>
        </div>
        <p class="hint">Tap a piece to put it on.</p>
      </section>

      <section class="card">
        <div class="card-header">
          <p class="eyebrow">Timeline</p>
          <span class="card-link">See all</span>
        </div>
        <ul class="timeline">
          {#each TIMELINE as item (item.subject)}
            <li class="timeline-row">
              <span class="timeline-dot"></span>
              <span class="timeline-meta">
                <span class="timeline-date">{item.date}</span>
                <span class="timeline-label">{item.label}</span>
              </span>
              <span class="timeline-piece">{item.subject}</span>
            </li>
          {/each}
        </ul>
      </section>

      <section class="card alert">
        <span class="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" stroke-linecap="round" />
          </svg>
        </span>
        <span class="alert-text">Speedmaster service due in 21 days</span>
      </section>
    {:else if screen === 'vault'}
      <header class="intro">
        <h1 class="headline">Vault</h1>
        <div class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4 4" stroke-linecap="round" />
          </svg>
          <span>Search 6 pieces</span>
        </div>
      </header>

      <ul class="grid">
        {#each PIECES as piece (piece.ref)}
          <li class="piece">
            <span class="dial md" data-face={piece.face}></span>
            <span class="piece-brand">{piece.brand}</span>
            <span class="piece-model">{piece.model}</span>
            <span class="piece-ref">{piece.ref}</span>
          </li>
        {/each}
      </ul>
    {:else if screen === 'wear'}
      <header class="intro">
        <h1 class="headline">Wear log</h1>
        <p class="tagline">Every day accounted for.</p>
      </header>

      <section class="card">
        <p class="eyebrow">This week</p>
        <div class="week">
          {#each WEEK as face, i (WEEKDAYS[i] + i)}
            <span class="day">
              {#if face}
                <span class="dial xs" data-face={face}></span>
              {:else}
                <span class="dial xs empty"></span>
              {/if}
              <span class="day-label">{WEEKDAYS[i]}</span>
            </span>
          {/each}
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <p class="eyebrow">Most worn</p>
          <span class="card-link">All time</span>
        </div>
        <ul class="rank">
          {#each [{ p: PIECES[0], n: 48, w: 100 }, { p: PIECES[3], n: 31, w: 65 }, { p: PIECES[1], n: 19, w: 40 }] as row (row.p.ref)}
            <li class="rank-row">
              <span class="dial sm" data-face={row.p.face}></span>
              <span class="rank-body">
                <span class="rank-name">{row.p.model}</span>
                <span class="rank-bar"><i style="width: {row.w}%"></i></span>
              </span>
              <span class="rank-count">{row.n}</span>
            </li>
          {/each}
        </ul>
      </section>

      <section class="card stats">
        {#each [{ v: '6', l: 'Pieces' }, { v: '5', l: 'Brands' }, { v: '214', l: 'Wears' }] as stat (stat.l)}
          <span class="stat">
            <span class="stat-value">{stat.v}</span>
            <span class="stat-label">{stat.l}</span>
          </span>
        {/each}
      </section>
    {:else}
      <header class="intro">
        <h1 class="headline">Tools</h1>
        <p class="tagline">A few precise instruments for the details that matter.</p>
      </header>

      <ul class="tool-list">
        {#each TOOLS as tool (tool.name)}
          <li class="tool">
            <span class="tool-body">
              <span class="eyebrow">{tool.category}</span>
              <span class="tool-name">{tool.name}</span>
              <span class="tool-desc">{tool.description}</span>
            </span>
            <span class="chevron">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <nav class="nav">
    <ul class="pill">
      {#each TABS as tab (tab)}
        <li class="tab" class:selected={tab === ACTIVE_TAB[screen]}>
          {#if tab === ACTIVE_TAB[screen]}
            <span class="marker"></span>
          {/if}
          <span class="tab-dot"></span>
          <span class="tab-label">{tab}</span>
        </li>
      {/each}
    </ul>
  </nav>
</div>

<style>
  .app-screen {
    /*
      One reference pixel of the app's own layout, expressed against the frame.
      393 is the design width the app's screens are laid out at; dividing by it
      means every number below is the number in the app's stylesheet.
    */
    --px: calc(100cqw / 393);

    --space-xs: calc(4 * var(--px));
    --space-sm: calc(8 * var(--px));
    --space-md: calc(16 * var(--px));
    --space-lg: calc(24 * var(--px));
    --radius-lg: calc(16 * var(--px));

    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: var(--color-background);
    font-size: calc(15 * var(--px));
    line-height: 1.4;
    /* The mockups are a picture of the app, not a control surface. */
    user-select: none;
  }

  /*
    The screen is dropped into ink sections as well as light ones, and
    `.on-ink` in site.css repaints every heading and eyebrow beneath it for the
    dark ground — which turns the app's own headings white on a white screen.

    A picture of the app has to look like the app wherever it hangs, so the
    colours the host would override are restated here, at a specificity that
    survives the host's descendant rules.
  */
  .app-screen h1.headline,
  .app-screen h2.card-title {
    color: var(--color-ink);
  }

  /* Both element types the eyebrow is used as — a card heading and a tool's
     category label. */
  .app-screen p.eyebrow,
  .app-screen span.eyebrow {
    color: var(--color-text-muted);
  }

  /* ------------------------------------------------------------ status bar */

  .status {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    padding: calc(14 * var(--px)) calc(26 * var(--px)) calc(2 * var(--px));
    font-size: calc(13 * var(--px));
    font-weight: 600;
    color: var(--color-ink);
  }

  .indicators {
    display: flex;
    align-items: center;
    gap: calc(5 * var(--px));
  }

  .bars {
    display: flex;
    align-items: flex-end;
    gap: calc(1.5 * var(--px));
  }

  .bars i {
    width: calc(2.5 * var(--px));
    border-radius: calc(1 * var(--px));
    background: var(--color-ink);
  }

  .bars i:nth-child(1) {
    height: calc(3.5 * var(--px));
  }
  .bars i:nth-child(2) {
    height: calc(5.5 * var(--px));
  }
  .bars i:nth-child(3) {
    height: calc(7.5 * var(--px));
  }
  .bars i:nth-child(4) {
    height: calc(9.5 * var(--px));
  }

  .battery {
    width: calc(18 * var(--px));
    height: calc(9 * var(--px));
    border: calc(1.2 * var(--px)) solid var(--color-ink);
    border-radius: calc(2.5 * var(--px));
    background:
      linear-gradient(var(--color-ink) 0 0) padding-box content-box;
    padding: calc(1.2 * var(--px));
  }

  /* ----------------------------------------------------------------- body */

  .body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--space-md);
    min-height: 0;
    padding: calc(20 * var(--px)) var(--space-md) calc(96 * var(--px));
    /* The screens are taller than the glass — the overflow is the point, it is
       what makes the mockup read as a live scroller rather than a poster. */
    overflow: hidden;
  }

  .intro {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: calc(10 * var(--px));
  }

  .headline {
    margin: 0;
    font-family: var(--font-display);
    font-size: calc(31 * var(--px));
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--color-ink);
  }

  .tagline {
    margin: 0;
    font-size: calc(14 * var(--px));
    line-height: 1.4;
    color: var(--color-text-muted);
  }

  /* ---------------------------------------------------------------- cards */

  .card {
    flex: 0 0 auto;
    padding: var(--space-md);
    border: calc(1 * var(--px)) solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background);
    text-align: left;
  }

  .card-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-md);
  }

  .card-title {
    margin: 0 0 calc(12 * var(--px));
    font-family: var(--font-display);
    font-size: calc(19 * var(--px));
    font-weight: 600;
    line-height: 1.2;
    color: var(--color-ink);
  }

  .eyebrow {
    margin: 0;
    font-size: calc(10 * var(--px));
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .card-link {
    font-size: calc(12 * var(--px));
    font-weight: 500;
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: calc(3 * var(--px));
  }

  .tip .tip-body {
    margin: calc(8 * var(--px)) 0 0;
    font-size: calc(13.5 * var(--px));
    line-height: 1.5;
    color: var(--color-text);
  }

  .hint {
    margin: calc(12 * var(--px)) 0 0;
    font-size: calc(12 * var(--px));
    color: var(--color-text-muted);
  }

  /* ----------------------------------------------------------------- dials */

  /*
    A watch face, drawn. The conic sweep is the sunburst; the two inset rings
    are the chapter ring and the bezel edge. `--face` is the ground colour each
    variant sets, so one rule paints every dial.
  */
  .dial {
    position: relative;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 50%;
    background:
      conic-gradient(
        from 210deg,
        rgb(255 255 255 / 22%) 0deg,
        transparent 60deg,
        rgb(0 0 0 / 14%) 150deg,
        transparent 250deg,
        rgb(255 255 255 / 18%) 330deg,
        transparent 360deg
      ),
      var(--face, var(--color-surface));
    box-shadow:
      inset 0 0 0 calc(1.5 * var(--px)) rgb(255 255 255 / 22%),
      inset 0 0 0 calc(2.5 * var(--px)) rgb(14 27 44 / 22%),
      0 calc(1 * var(--px)) calc(3 * var(--px)) rgb(14 27 44 / 18%);
  }

  /* Hands: a hairline pair pinned at the centre, set to ten-past-ten. */
  .dial::before,
  .dial::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 9999px;
    background: var(--hand, var(--color-primary));
    transform-origin: 0 50%;
  }

  .dial::before {
    width: 28%;
    height: calc(1.6 * var(--px));
    transform: translate(0, -50%) rotate(-63deg);
  }

  .dial::after {
    width: 34%;
    height: calc(1.6 * var(--px));
    transform: translate(0, -50%) rotate(-125deg);
  }

  .dial[data-face='onyx'] {
    --face: radial-gradient(circle at 34% 28%, #3a4250 0%, #14181f 62%, #0a0d12 100%);
    --hand: var(--brass-300);
  }

  .dial[data-face='silver'] {
    --face: radial-gradient(circle at 34% 28%, #ffffff 0%, #e3e6ea 55%, #c3c8cf 100%);
    --hand: var(--ink-800);
  }

  .dial[data-face='navy'] {
    --face: radial-gradient(circle at 34% 28%, #2c4a72 0%, #16304f 58%, #0c1c30 100%);
    --hand: var(--brass-200);
  }

  .dial[data-face='champagne'] {
    --face: radial-gradient(circle at 34% 28%, #f6e6c9 0%, #e2c795 55%, #c8a566 100%);
    --hand: var(--ink-800);
  }

  .dial.empty,
  .dial.more {
    background: none;
    border: calc(1.2 * var(--px)) dashed #c4c2bc;
    box-shadow: none;
    color: var(--color-text-muted);
    font-size: calc(15 * var(--px));
  }

  .dial.empty::before,
  .dial.empty::after,
  .dial.more::before,
  .dial.more::after {
    display: none;
  }

  .dial.xs {
    width: calc(30 * var(--px));
    height: calc(30 * var(--px));
  }

  .dial.sm {
    width: calc(44 * var(--px));
    height: calc(44 * var(--px));
  }

  .dial.md {
    width: calc(62 * var(--px));
    height: calc(62 * var(--px));
  }

  .wotd-row {
    display: flex;
    gap: calc(10 * var(--px));
  }

  /* -------------------------------------------------------------- timeline */

  .timeline {
    display: flex;
    flex-direction: column;
    gap: calc(12 * var(--px));
    margin: calc(12 * var(--px)) 0 0;
    padding: 0;
    list-style: none;
  }

  .timeline-row {
    position: relative;
    display: grid;
    grid-template-columns: calc(9 * var(--px)) 1fr;
    align-items: start;
    gap: 0 calc(10 * var(--px));
  }

  .timeline-dot {
    width: calc(5 * var(--px));
    height: calc(5 * var(--px));
    margin-top: calc(5 * var(--px));
    border-radius: 50%;
    background: var(--color-primary);
  }

  /* The rail between one dot and the next. */
  .timeline-row:not(:last-child)::before {
    content: '';
    position: absolute;
    top: calc(12 * var(--px));
    left: calc(2 * var(--px));
    width: calc(1 * var(--px));
    height: calc(100% - 4 * var(--px));
    background: var(--color-border);
  }

  .timeline-meta {
    display: flex;
    align-items: baseline;
    gap: calc(6 * var(--px));
    font-size: calc(11 * var(--px));
  }

  .timeline-date {
    color: var(--color-text-muted);
  }

  .timeline-label {
    font-weight: 600;
    color: var(--color-primary);
  }

  .timeline-piece {
    grid-column: 2;
    font-size: calc(13.5 * var(--px));
    color: var(--color-text);
  }

  /* ----------------------------------------------------------------- alert */

  .alert {
    display: flex;
    align-items: center;
    gap: calc(12 * var(--px));
    border-color: rgb(184 147 90 / 45%);
    background: rgb(184 147 90 / 7%);
  }

  .alert-icon {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: calc(30 * var(--px));
    height: calc(30 * var(--px));
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
  }

  .alert-icon svg {
    width: calc(17 * var(--px));
    height: calc(17 * var(--px));
  }

  .alert-text {
    font-size: calc(13.5 * var(--px));
    line-height: 1.35;
    color: var(--color-ink);
  }

  /* ------------------------------------------------------------ vault grid */

  .search {
    display: flex;
    align-items: center;
    gap: calc(9 * var(--px));
    padding: calc(11 * var(--px)) calc(14 * var(--px));
    border: calc(1 * var(--px)) solid var(--color-border);
    border-radius: 9999px;
    font-size: calc(13.5 * var(--px));
    color: var(--color-text-muted);
  }

  .search svg {
    width: calc(15 * var(--px));
    height: calc(15 * var(--px));
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: calc(12 * var(--px));
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .piece {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: calc(3 * var(--px));
    padding: var(--space-md);
    border: calc(1 * var(--px)) solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .piece .dial {
    margin-bottom: calc(9 * var(--px));
  }

  .piece-brand {
    font-size: calc(10 * var(--px));
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .piece-model {
    font-family: var(--font-display);
    font-size: calc(18 * var(--px));
    font-weight: 600;
    line-height: 1.15;
    color: var(--color-ink);
  }

  .piece-ref {
    font-size: calc(11 * var(--px));
    color: var(--color-text-muted);
  }

  /* ------------------------------------------------------------- wear log */

  .week {
    display: flex;
    justify-content: space-between;
    gap: calc(4 * var(--px));
    margin-top: calc(12 * var(--px));
  }

  .day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(6 * var(--px));
  }

  .day-label {
    font-size: calc(10 * var(--px));
    color: var(--color-text-muted);
  }

  .rank {
    display: flex;
    flex-direction: column;
    gap: calc(12 * var(--px));
    margin: calc(14 * var(--px)) 0 0;
    padding: 0;
    list-style: none;
  }

  .rank-row {
    display: flex;
    align-items: center;
    gap: calc(11 * var(--px));
  }

  .rank-body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: calc(6 * var(--px));
    min-width: 0;
  }

  .rank-name {
    font-size: calc(13.5 * var(--px));
    color: var(--color-text);
  }

  .rank-bar {
    display: block;
    height: calc(4 * var(--px));
    border-radius: 9999px;
    background: var(--color-border);
  }

  .rank-bar i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--color-primary);
  }

  .rank-count {
    flex: 0 0 auto;
    font-size: calc(13 * var(--px));
    font-weight: 600;
    color: var(--color-primary);
  }

  .stats {
    display: flex;
    justify-content: space-between;
    text-align: center;
  }

  .stat {
    display: flex;
    flex: 1 1 0;
    flex-direction: column-reverse;
    gap: calc(4 * var(--px));
  }

  .stat-value {
    font-family: var(--font-display);
    font-size: calc(27 * var(--px));
    font-weight: 600;
    line-height: 1;
    color: var(--color-ink);
  }

  .stat-label {
    font-size: calc(10 * var(--px));
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  /* ----------------------------------------------------------------- tools */

  .tool-list {
    display: flex;
    flex-direction: column;
    gap: calc(10 * var(--px));
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tool {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-md);
    border: calc(1 * var(--px)) solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .tool-body {
    display: flex;
    flex-direction: column;
    gap: calc(3 * var(--px));
  }

  .tool-name {
    font-family: var(--font-display);
    font-size: calc(19 * var(--px));
    font-weight: 600;
    line-height: 1.15;
    color: var(--color-ink);
  }

  .tool-desc {
    font-size: calc(12.5 * var(--px));
    color: var(--color-text-muted);
  }

  .chevron {
    flex: 0 0 auto;
    color: var(--color-text-muted);
  }

  .chevron svg {
    display: block;
    width: calc(16 * var(--px));
    height: calc(16 * var(--px));
  }

  /* ------------------------------------------------------------- nav pill */

  .nav {
    position: absolute;
    right: 0;
    bottom: calc(16 * var(--px));
    left: 0;
    display: flex;
    justify-content: center;
    padding: 0 var(--space-md);
  }

  .pill {
    position: relative;
    display: flex;
    gap: var(--space-lg);
    margin: 0;
    padding: calc(10 * var(--px)) var(--space-lg);
    border-radius: 9999px;
    background: var(--color-ink);
    list-style: none;
    box-shadow: 0 calc(6 * var(--px)) calc(20 * var(--px)) rgb(14 27 44 / 26%);
  }

  .tab {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(5 * var(--px));
    padding: 0 var(--space-xs);
    font-size: calc(10 * var(--px));
    color: rgb(255 255 255 / 55%);
  }

  .tab.selected {
    color: #fff;
  }

  .marker {
    position: absolute;
    top: calc(-6 * var(--px));
    right: calc(-10 * var(--px));
    bottom: calc(-6 * var(--px));
    left: calc(-10 * var(--px));
    border-radius: 9999px;
    background: rgb(255 255 255 / 14%);
    box-shadow: inset 0 0 0 calc(1 * var(--px)) rgb(255 255 255 / 10%);
  }

  .tab-dot,
  .tab-label {
    position: relative;
  }

  .tab-dot {
    width: calc(15 * var(--px));
    height: calc(15 * var(--px));
    border: calc(1.6 * var(--px)) solid currentcolor;
    border-radius: 50%;
  }
</style>
