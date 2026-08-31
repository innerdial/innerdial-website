/**
 * Motion primitives for the public site.
 *
 * Three rules shape everything here:
 *
 *   1. No library. The site is the first thing a visitor downloads, and a
 *      scroll-animation dependency costs more than the effects are worth.
 *   2. The main thread does as little as possible. Reveals are a class flip
 *      that CSS transitions from there; parallax is a CSS scroll-driven
 *      animation the compositor owns outright. Only the pinned showcase needs
 *      a real scroll reading, and every subscriber shares one rAF-coalesced
 *      pass over a cached set of measurements.
 *   3. Motion is an enhancement. `prefers-reduced-motion` and browsers without
 *      IntersectionObserver both land on the finished state immediately —
 *      nothing here is load-bearing for reading the page.
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia(REDUCED_MOTION_QUERY).matches;
}

/* ------------------------------------------------------------------ reveal */

/**
 * One observer serves the whole page. A per-element observer would be a
 * separate callback and a separate set of root-margin calculations for every
 * card on a page that has dozens.
 *
 * @type {IntersectionObserver | null}
 */
let revealObserver = null;

/** Elements that should keep re-animating rather than latch on first sight. */
const repeatable = new WeakSet();

function ensureRevealObserver() {
  if (revealObserver) {
    return revealObserver;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const node = /** @type {HTMLElement} */ (entry.target);

        if (entry.isIntersecting) {
          node.dataset.revealed = '';
          if (!repeatable.has(node)) {
            revealObserver?.unobserve(node);
          }
          continue;
        }

        // Only a repeating element gives its reveal back; everything else has
        // already stopped being observed by the time it leaves.
        if (repeatable.has(node)) {
          delete node.dataset.revealed;
        }
      }
    },
    {
      // Fire a little before the element's edge clears the fold, so the motion
      // reads as "arriving with the scroll" rather than starting late.
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.08,
    },
  );

  return revealObserver;
}

/**
 * @typedef {{
 *   variant?: 'up' | 'fade' | 'blur' | 'scale' | 'left' | 'right' | 'clip',
 *   index?: number,
 *   repeat?: boolean,
 * }} RevealOptions
 */

/**
 * Reveal an element the first time it scrolls into view.
 *
 * The action only flips `data-revealed`; the travel, blur and fade all live in
 * `site.css` against `[data-reveal]`. `index` staggers siblings — it is
 * multiplied by a fixed step rather than passed as a delay so a row of cards
 * cannot drift out of rhythm with the rest of the page.
 *
 * @param {HTMLElement} node
 * @param {RevealOptions} [options]
 */
export function reveal(node, options = {}) {
  const settle = () => {
    node.dataset.revealed = '';
  };

  /** @param {RevealOptions} next */
  function apply(next) {
    node.dataset.reveal = next.variant ?? 'up';
    node.style.setProperty('--reveal-i', String(next.index ?? 0));
  }

  apply(options);

  // No observer, or no appetite for motion: show the finished state and stop.
  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
    settle();
    return {
      /** @param {RevealOptions} next */
      update(next) {
        apply(next);
        settle();
      },
    };
  }

  if (options.repeat) {
    repeatable.add(node);
  }

  const observer = ensureRevealObserver();
  observer.observe(node);

  return {
    /** @param {RevealOptions} next */
    update(next) {
      apply(next);
      if (next.repeat) {
        repeatable.add(node);
      } else {
        repeatable.delete(node);
      }
    },
    destroy() {
      observer.unobserve(node);
      repeatable.delete(node);
    },
  };
}

/* ------------------------------------------------------- scroll progress */

/**
 * @typedef {{
 *   node: HTMLElement,
 *   onProgress: (progress: number) => void,
 *   top: number,
 *   travel: number,
 *   last: number,
 * }} Tracked
 */

/** @type {Set<Tracked>} */
const tracked = new Set();

let frame = 0;
let listening = false;

/**
 * Measure once per resize, not once per scroll. `getBoundingClientRect` inside
 * a scroll handler forces layout on every frame; the offsets it would read
 * only change when the page reflows.
 *
 * @param {Tracked} entry
 */
function measure(entry) {
  const rect = entry.node.getBoundingClientRect();
  entry.top = rect.top + scrollY;
  // How far the page scrolls between the section's top reaching the viewport
  // top and its bottom doing the same — the window the pinned child lives in.
  entry.travel = Math.max(1, entry.node.offsetHeight - innerHeight);
}

function read() {
  frame = 0;

  for (const entry of tracked) {
    const raw = (scrollY - entry.top) / entry.travel;
    const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;

    // Sub-pixel churn is invisible and would re-run every subscriber on every
    // frame of a slow scroll.
    if (Math.abs(progress - entry.last) < 0.0005) {
      continue;
    }

    entry.last = progress;
    entry.node.style.setProperty('--progress', progress.toFixed(4));
    entry.onProgress(progress);
  }
}

function schedule() {
  if (!frame) {
    frame = requestAnimationFrame(read);
  }
}

function remeasure() {
  for (const entry of tracked) {
    measure(entry);
  }
  schedule();
}

function listen() {
  if (listening) {
    return;
  }
  listening = true;
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', remeasure);
}

function stopListening() {
  if (!listening || tracked.size) {
    return;
  }
  listening = false;
  removeEventListener('scroll', schedule);
  removeEventListener('resize', remeasure);
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

/**
 * Report how far the page has scrolled through a tall section, as 0 → 1.
 *
 * Put it on the tall element, not on the `position: sticky` child: the child
 * does not move relative to the viewport, so it has no progress of its own to
 * read. The value is written to `--progress` on the node for CSS to use and
 * handed to the callback for anything CSS cannot express.
 *
 * @param {HTMLElement} node
 * @param {(progress: number) => void} onProgress
 */
export function scrollProgress(node, onProgress) {
  /** @type {Tracked} */
  const entry = { node, onProgress, top: 0, travel: 1, last: -1 };

  // Sticky scroll-telling degrades to its first frame rather than jittering
  // through a story nobody asked to be told.
  if (prefersReducedMotion()) {
    node.style.setProperty('--progress', '0');
    onProgress(0);
    return {};
  }

  tracked.add(entry);
  measure(entry);
  listen();
  schedule();

  // Fonts and images landing after mount change the section's height, and a
  // stale `travel` misreports progress for the rest of the session.
  const resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          measure(entry);
          schedule();
        });
  resizeObserver?.observe(node);

  return {
    /** @param {(progress: number) => void} next */
    update(next) {
      entry.onProgress = next;
    },
    destroy() {
      resizeObserver?.disconnect();
      tracked.delete(entry);
      stopListening();
    },
  };
}

/* ------------------------------------------------------------- pointer tilt */

/**
 * Lean an element toward the pointer.
 *
 * Coarse pointers get nothing: there is no hover on a touchscreen, and the
 * listener would only fire on taps. The rotation is written as two custom
 * properties so the element keeps whatever other transforms its own stylesheet
 * applies.
 *
 * @param {HTMLElement} node
 * @param {{ strength?: number }} [options]
 */
export function tilt(node, options = {}) {
  const strength = options.strength ?? 6;

  if (prefersReducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return {};
  }

  let pending = 0;
  let x = 0;
  let y = 0;

  function write() {
    pending = 0;
    node.style.setProperty('--tilt-x', `${(y * -strength).toFixed(2)}deg`);
    node.style.setProperty('--tilt-y', `${(x * strength).toFixed(2)}deg`);
  }

  /** @param {PointerEvent} event */
  function onMove(event) {
    const rect = node.getBoundingClientRect();
    // -0.5 → 0.5 from the element's centre.
    x = (event.clientX - rect.left) / rect.width - 0.5;
    y = (event.clientY - rect.top) / rect.height - 0.5;
    if (!pending) {
      pending = requestAnimationFrame(write);
    }
  }

  function onLeave() {
    if (pending) {
      cancelAnimationFrame(pending);
      pending = 0;
    }
    node.style.setProperty('--tilt-x', '0deg');
    node.style.setProperty('--tilt-y', '0deg');
  }

  node.addEventListener('pointermove', onMove);
  node.addEventListener('pointerleave', onLeave);

  return {
    destroy() {
      if (pending) {
        cancelAnimationFrame(pending);
      }
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
    },
  };
}

/* ----------------------------------------------------------------- count up */

/**
 * Count a figure up to its value the first time it is seen.
 *
 * The element's markup carries the final number so it is what a crawler and a
 * reader with reduced motion get; this only replaces the text while the
 * animation runs.
 *
 * @param {HTMLElement} node
 * @param {{ value: number, suffix?: string, duration?: number }} options
 */
export function countUp(node, options) {
  const { value, suffix = '', duration = 1400 } = options;

  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
    return {};
  }

  let frameId = 0;
  node.textContent = `0${suffix}`;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      observer.disconnect();
      const start = performance.now();

      const step = () => {
        const elapsed = (performance.now() - start) / duration;
        const t = elapsed > 1 ? 1 : elapsed;
        // Ease out cubic: fast off the mark, settling rather than stopping.
        const eased = 1 - (1 - t) ** 3;
        node.textContent = `${Math.round(value * eased)}${suffix}`;
        if (t < 1) {
          frameId = requestAnimationFrame(step);
        }
      };

      frameId = requestAnimationFrame(step);
    },
    { threshold: 0.4 },
  );

  observer.observe(node);

  return {
    destroy() {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      observer.disconnect();
    },
  };
}
