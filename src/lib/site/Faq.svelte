<script>
  import Backdrop from '$lib/site/Backdrop.svelte';
  import { reveal } from '$lib/site/motion.js';

  /**
   * The last questions, on paper.
   *
   * Structurally this band exists to separate the closing section from the
   * footer: both are ink, and butted together they read as one undifferentiated
   * dark block with no boundary. A light ground between them is a real edge
   * rather than a tonal hint that a dim screen can lose.
   *
   * It earns the space rather than filling it. This is the last thing read
   * before the footer, so it answers the objections that actually stop someone
   * signing up — and every answer below is a feature the app ships today, not a
   * promise.
   */

  const QUESTIONS = [
    {
      id: 'howmany',
      q: 'How many pieces can I add?',
      a: 'As many as you own. There is no tier that caps the vault at ten and asks for more at eleven.',
    },
    {
      id: 'import',
      q: 'Can I bring an existing spreadsheet across?',
      a: 'Yes. Import the sheet you already keep and the whole collection lands at once, rather than one piece at a time.',
    },
    {
      id: 'offline',
      q: 'Does it work without a signal?',
      a: 'The collection is cached on the device, so the vault, your documents and the timeline all open with no connection at all.',
    },
    {
      id: 'private',
      q: 'Who else can see my collection?',
      a: 'Nobody. There is no feed and no marketplace to leak it to, and the vault, the documents or the values alone can sit behind a biometric lock.',
    },
    {
      id: 'photos',
      q: 'Do I have to photograph everything up front?',
      a: 'No. Enter what you know now and add papers, photographs and service history whenever they turn up — a partial record still beats a drawer.',
    },
    {
      id: 'leave',
      q: 'What happens if I cancel?',
      a: 'You export the lot — a spreadsheet with every file attached — and the account erases on request. Within thirty days the fee comes back in full.',
    },
  ];
</script>

<section class="faq" id="faq" aria-labelledby="faq-heading">
  <Backdrop tone="light" glow="none" fade="radial" cell={64} />

  <div class="shell inner">
    <header class="head">
      <p class="eyebrow" use:reveal={{ variant: 'fade' }}>Before you do</p>
      <h2 id="faq-heading" use:reveal={{ variant: 'up', index: 1 }}>
        The questions worth <span class="accent">asking</span>.
      </h2>
    </header>

    <dl class="list">
      {#each QUESTIONS as item, i (item.id)}
        <div class="item" use:reveal={{ variant: 'up', index: i }}>
          <dt>{item.q}</dt>
          <dd>{item.a}</dd>
        </div>
      {/each}
    </dl>
  </div>
</section>

<style>
  .faq {
    position: relative;
    /* Paper, and not the warmed tint the neighbouring light sections use: this
       band's job is to be unmistakably not-ink, so it takes the brightest
       ground on the page. */
    background: var(--paper);
    padding: var(--section-y) 0;
  }

  .inner {
    position: relative;
    z-index: 1;
  }

  .head {
    max-width: 40rem;
    margin-bottom: clamp(2rem, 4.5vw, 3.25rem);
  }

  .head h2 {
    margin: var(--space-sm) 0 0;
    font-size: clamp(1.875rem, 3.8vw, 2.875rem);
    line-height: 1.08;
  }

  .list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
    gap: 0 clamp(2rem, 5vw, 4rem);
    margin: 0;
  }

  /*
    A hairline above each entry rather than between them. Borders drawn between
    siblings break at the column boundary in a multi-column grid, leaving one
    row of the second column short a rule.
  */
  .item {
    padding: clamp(1.25rem, 2.5vw, 1.75rem) 0;
    border-top: 1px solid var(--color-border);
  }

  .item dt {
    margin-bottom: 0.45rem;
    font-family: var(--font-display);
    font-size: clamp(1.125rem, 1.9vw, 1.375rem);
    font-weight: 600;
    line-height: 1.25;
    color: var(--color-ink);
  }

  .item dd {
    margin: 0;
    max-width: 32rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-text-muted);
  }
</style>
