<script>
  import Backdrop from '$lib/site/Backdrop.svelte';
  import { reveal } from '$lib/site/motion.js';

  /**
   * Deep dive: the paperwork.
   *
   * Treatment — a fanned stack of documents that squares up as it arrives, and
   * spreads again under the pointer. The gesture is the whole argument: loose
   * paper, brought into order. Every card is a real document type the app files
   * against a piece.
   */

  const DOCS = [
    { id: 'invoice', kind: 'Invoice', meta: 'Retailer · 12 Mar 2019', tone: 'paper' },
    { id: 'warranty', kind: 'Warranty card', meta: 'Stamped · 5 years', tone: 'paper' },
    { id: 'service', kind: 'Service receipt', meta: 'Full overhaul · 2023', tone: 'brass' },
    { id: 'valuation', kind: 'Valuation', meta: 'For insurance · 2026', tone: 'ink' },
  ];

  const NOTES = [
    'Photograph a card and it is filed, cropped and attached.',
    'Import a PDF from an email and it lands on the right piece.',
    'Export the lot as a schedule when an insurer asks.',
  ];
</script>

<section class="dive" aria-labelledby="documents-heading">
  <Backdrop tone="light" glow="left" fade="radial" cell={56} />

  <div class="shell inner">
    <div class="visual" aria-hidden="true">
      <div class="stack" data-parallax style="--parallax-from: 2.5rem; --parallax-to: -2.5rem">
        {#each DOCS as doc, i (doc.id)}
          <article
            class="doc"
            data-tone={doc.tone}
            style="--i: {i}; --depth: {DOCS.length - i}"
            use:reveal={{ variant: 'fade', index: i }}
          >
            <span class="doc-corner"></span>
            <span class="doc-kind">{doc.kind}</span>
            <span class="doc-meta">{doc.meta}</span>
            <span class="doc-lines">
              <i></i><i></i><i></i>
            </span>
          </article>
        {/each}
      </div>
    </div>

    <div class="copy">
      <p class="eyebrow" use:reveal={{ variant: 'fade' }}>Deep dive · Documents</p>

      <h2 id="documents-heading" use:reveal={{ variant: 'up', index: 1 }}>
        The papers, <span class="accent">filed</span> — not in a folder somewhere.
      </h2>

      <p class="lede" use:reveal={{ variant: 'up', index: 2 }}>
        A watch without its papers is worth less and proves less. Innerdial keeps
        every document attached to the piece it belongs to, so the proof and the
        thing it proves never come apart.
      </p>

      <ul class="notes">
        {#each NOTES as note, i (note)}
          <li use:reveal={{ variant: 'left', index: 3 + i }}>
            <span class="bullet" aria-hidden="true"></span>
            {note}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<style>
  .dive {
    position: relative;
    padding: var(--section-y) 0;
    background: var(--paper);
  }

  .inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: clamp(2.5rem, 6vw, 6rem);
  }

  .copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .copy h2 {
    margin: var(--space-xs) 0 0;
    font-size: clamp(1.875rem, 3.8vw, 3rem);
    line-height: 1.08;
  }

  .notes {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin: var(--space-sm) 0 0;
    padding: 0;
    list-style: none;
  }

  .notes li {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--color-text);
  }

  .bullet {
    flex: 0 0 auto;
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: var(--color-primary);
  }

  /* ---------------------------------------------------------------- stack */

  .visual {
    display: flex;
    justify-content: center;
  }

  .stack {
    position: relative;
    width: min(100%, 26rem);
    /* Room for the fan to spread without clipping against the section. */
    aspect-ratio: 5 / 4;
  }

  .doc {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    width: 68%;
    padding: 1.1rem 1.25rem 1.4rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--paper);
    box-shadow: var(--shadow-md);
    /*
      Squared up: a small vertical offset per card so the stack reads as depth
      rather than as one card. `--depth` puts the topmost card on top.
    */
    transform: translate(-50%, -50%) translateY(calc(var(--i) * -0.95rem))
      rotate(calc((var(--i) - 1.5) * 1.8deg));
    z-index: var(--depth);
    transition:
      transform 720ms var(--ease-page),
      box-shadow 480ms var(--ease-out);
  }

  /* Arriving: loose, tilted, scattered — then it settles into the stack above. */
  @media (prefers-reduced-motion: no-preference) {
    .doc:not([data-revealed]) {
      transform: translate(-50%, -50%) translate(calc((var(--i) - 1.5) * 2.6rem), 2rem)
        rotate(calc((var(--i) - 1.5) * 9deg)) scale(0.94);
    }
  }

  /*
    Under the pointer the stack fans out again, so the individual documents are
    legible. Pointer only — on touch the settled stack is the finished state.
  */
  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    .stack:hover .doc {
      transform: translate(-50%, -50%) translate(calc((var(--i) - 1.5) * 3.4rem),
          calc(var(--i) * -1.15rem)) rotate(calc((var(--i) - 1.5) * 4.5deg));
      box-shadow: var(--shadow-lg);
    }
  }

  .doc-corner {
    position: absolute;
    top: 0;
    right: 0;
    width: 1.75rem;
    height: 1.75rem;
    /* The folded corner, cut out of the card and shaded. */
    background: linear-gradient(225deg, var(--color-border) 0 50%, transparent 50%);
    border-top-right-radius: var(--radius-md);
  }

  .doc-kind {
    font-family: var(--font-display);
    font-size: 1.1875rem;
    font-weight: 600;
    line-height: 1.15;
    color: var(--color-ink);
  }

  .doc-meta {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .doc-lines {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.6rem;
  }

  .doc-lines i {
    display: block;
    height: 3px;
    border-radius: 3px;
    background: var(--color-border);
  }

  .doc-lines i:nth-child(2) {
    width: 78%;
  }

  .doc-lines i:nth-child(3) {
    width: 52%;
  }

  /* The accented cards, so the stack is not four identical rectangles. */
  .doc[data-tone='brass'] {
    border-color: rgb(184 147 90 / 45%);
  }

  .doc[data-tone='brass'] .doc-lines i {
    background: rgb(184 147 90 / 32%);
  }

  .doc[data-tone='brass'] .doc-corner {
    background: linear-gradient(225deg, rgb(184 147 90 / 45%) 0 50%, transparent 50%);
  }

  .doc[data-tone='ink'] {
    border-color: transparent;
    background: var(--ink-800);
  }

  .doc[data-tone='ink'] .doc-kind {
    color: #fff;
  }

  .doc[data-tone='ink'] .doc-meta {
    color: rgb(255 255 255 / 60%);
  }

  .doc[data-tone='ink'] .doc-lines i {
    background: rgb(255 255 255 / 18%);
  }

  .doc[data-tone='ink'] .doc-corner {
    background: linear-gradient(225deg, rgb(255 255 255 / 22%) 0 50%, transparent 50%);
  }

  @media (max-width: 62rem) {
    .inner {
      grid-template-columns: minmax(0, 1fr);
    }

    .visual {
      order: -1;
    }

    .stack {
      width: min(100%, 22rem);
    }

    .doc {
      width: 74%;
    }
  }
</style>
