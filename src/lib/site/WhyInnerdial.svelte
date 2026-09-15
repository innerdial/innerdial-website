<script>
  import Backdrop from '$lib/site/Backdrop.svelte';
  import DialMotif from '$lib/site/DialMotif.svelte';
  import { countUp, reveal } from '$lib/site/motion.js';

  /**
   * The argument.
   *
   * Ink ground, and the section the page has been building toward — it is the
   * only place the copy is allowed to be blunt about what goes wrong without a
   * record. Each row states the failure, then answers it; the answer is
   * revealed a beat later so the pair reads in order rather than as a column
   * of parallel text.
   *
   * The figures are product facts, not usage claims: five tools because the
   * Tools screen ships five, a fourteen-day trial because that is what every
   * new account is given. Nothing here asserts a number about other people's collections.
   */

  const CASES = [
    {
      id: 'papers',
      problem: 'The box, the papers and the receipt are in three different places.',
      answer: 'Every document is attached to the piece it proves, and travels with it.',
    },
    {
      id: 'service',
      problem: 'A service is remembered as "a few years ago, I think".',
      answer: 'Dated, attributed, and a reminder before the next one is due.',
    },
    {
      id: 'claim',
      problem: 'The insurer wants a schedule, today, with serials.',
      answer: 'Export the whole collection — values, references and serials — in a file.',
    },
    {
      id: 'heir',
      problem: 'Someone eventually inherits a drawer and no idea what is in it.',
      answer: 'They inherit the record too: what each piece is, and why it mattered.',
    },
  ];

  const FIGURES = [
    { id: 'tools', value: 5, suffix: '', label: 'Precision instruments' },
    { id: 'trial', value: 14, suffix: '', label: 'Day free trial' },
    { id: 'ads', value: 0, suffix: '', label: 'Ads, ever' },
    { id: 'export', value: 100, suffix: '%', label: 'Yours to export' },
  ];
</script>

<section class="why on-ink" id="why" aria-labelledby="why-heading">
  <Backdrop tone="ink" glow="none" fade="radial" cell={72} />

  <span class="motif" aria-hidden="true"><DialMotif opacity={0.1} /></span>

  <div class="shell inner">
    <header class="head">
      <p class="eyebrow" use:reveal={{ variant: 'fade' }}>Why it matters</p>
      <h2 id="why-heading" use:reveal={{ variant: 'up', index: 1 }}>
        A drawer is not a record. A spreadsheet <span class="accent">forgets</span>.
      </h2>
    </header>

    <ul class="cases">
      {#each CASES as item, i (item.id)}
        <li class="case" use:reveal={{ variant: 'up', index: i }}>
          <p class="problem">{item.problem}</p>
          <p class="answer">
            <span class="tick" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            {item.answer}
          </p>
        </li>
      {/each}
    </ul>

    <dl class="figures">
      {#each FIGURES as figure, i (figure.id)}
        <div class="figure" use:reveal={{ variant: 'scale', index: i }}>
          <dt class="figure-value" use:countUp={{ value: figure.value, suffix: figure.suffix }}>
            {figure.value}{figure.suffix}
          </dt>
          <dd class="figure-label">{figure.label}</dd>
        </div>
      {/each}
    </dl>
  </div>
</section>

<style>
  .why {
    position: relative;
    overflow: hidden;
    padding: var(--section-y) 0;
    background: linear-gradient(200deg, var(--ink-900) 0%, var(--ink-800) 52%, var(--ink-700) 100%);
    isolation: isolate;
  }

  .motif {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 0;
    display: block;
    width: min(150vh, 80rem);
    aspect-ratio: 1;
    color: var(--brass-300);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .inner {
    position: relative;
    z-index: 1;
  }

  .head {
    max-width: 46rem;
    margin-bottom: clamp(2.5rem, 5vw, 4rem);
  }

  .head h2 {
    margin: var(--space-sm) 0 0;
    font-size: clamp(2rem, 4.4vw, 3.5rem);
    line-height: 1.06;
  }

  /* ---------------------------------------------------------------- cases */

  .cases {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
    gap: var(--space-md);
    margin: 0 0 clamp(3rem, 6vw, 5rem);
    padding: 0;
    list-style: none;
  }

  .case {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: clamp(1.25rem, 2.2vw, 1.75rem);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: var(--radius-lg);
    background: rgb(255 255 255 / 4%);
    transition:
      border-color 460ms var(--ease-out),
      background 460ms var(--ease-out);
  }

  .case:hover {
    border-color: rgb(184 147 90 / 40%);
    background: rgb(255 255 255 / 6%);
  }

  .problem {
    position: relative;
    margin: 0;
    padding-bottom: var(--space-md);
    border-bottom: 1px solid rgb(255 255 255 / 10%);
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 2vw, 1.5rem);
    line-height: 1.25;
    color: rgb(255 255 255 / 88%);
  }

  .answer {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: rgb(255 255 255 / 62%);
    /*
      Held back a beat behind the card's own reveal, so the failure is read
      before the answer arrives. Both properties read the card's `--revealed`
      rather than selecting on its attribute — see the note in site.css.
    */
    opacity: var(--revealed, 1);
    transform: translateY(calc(0.5rem * (1 - var(--revealed, 1))));
    transition:
      opacity 620ms var(--ease-out) 280ms,
      transform 620ms var(--ease-out) 280ms;
  }

  .tick {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 1.25rem;
    height: 1.25rem;
    margin-top: 0.1rem;
    border-radius: 50%;
    background: var(--color-primary);
    color: var(--ink-900);
  }

  .tick svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  /* -------------------------------------------------------------- figures */

  .figures {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
    gap: var(--space-lg);
    margin: 0;
    padding-top: clamp(2rem, 4vw, 3rem);
    border-top: 1px solid rgb(255 255 255 / 12%);
  }

  .figure {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .figure-value {
    font-family: var(--font-display);
    font-size: clamp(2.75rem, 5.5vw, 4.25rem);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--brass-300);
    /* Tabular figures: without them the number jitters horizontally as it
       counts up through digits of different widths. */
    font-variant-numeric: tabular-nums;
  }

  .figure-label {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgb(255 255 255 / 50%);
  }

  @media (prefers-reduced-motion: reduce) {
    .answer {
      opacity: 1;
      transform: none;
    }
  }
</style>
