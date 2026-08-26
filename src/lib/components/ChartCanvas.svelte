<script module>
  import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    DoughnutController,
    Filler,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
  } from 'chart.js';

  /**
   * Registered once for the module, not once per chart. Chart.js ships
   * everything by default only through its `auto` entry point; naming the pieces
   * keeps the bundle to the three chart types the dashboard actually draws.
   */
  Chart.register(
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    DoughnutController,
    Filler,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
  );

  /** Read off the stylesheet so a token change moves the charts with everything else. */
  function token(name, fallback) {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  export function chartPalette() {
    return {
      primary: token('--color-primary', '#b8935a'),
      ink: token('--color-ink', '#0e1b2c'),
      border: token('--color-border', '#e8e6e1'),
      muted: token('--color-text-muted', '#6b6b66'),
    };
  }
</script>

<script>
  /**
   * A Chart.js canvas with the console's typography and grid already applied,
   * so a screen supplies data and little else.
   */

  /** @type {{ type: string, data: any, options?: any, height?: number, label: string }} */
  let { type, data, options = {}, height = 260, label } = $props();

  /** @type {HTMLCanvasElement | undefined} */
  let canvas = $state();

  const BASE_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: false,
        labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: '#0e1b2c',
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 12 },
        displayColors: false,
      },
    },
  };

  /**
   * Rebuilt rather than mutated on every change. A dashboard redraws a handful
   * of points a few times a session, and `chart.update()` with swapped datasets
   * is the part of the API that most often leaves a stale axis behind.
   */
  $effect(() => {
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type,
      data,
      options: merge(BASE_OPTIONS, options),
    });

    return () => chart.destroy();
  });

  /** Two levels is all the option shapes below need; a deep merge would be guessing. */
  function merge(base, overrides) {
    const result = { ...base, ...overrides };

    for (const key of ['plugins', 'scales', 'interaction']) {
      if (base[key] || overrides[key]) {
        result[key] = { ...base[key], ...overrides[key] };
      }
    }

    if (base.plugins && overrides.plugins) {
      for (const plugin of Object.keys(overrides.plugins)) {
        result.plugins[plugin] = { ...base.plugins[plugin], ...overrides.plugins[plugin] };
      }
    }

    return result;
  }
</script>

<!--
  The description sits on the frame rather than the canvas: a canvas counts as
  an interactive element, and giving one role="img" is the pairing screen
  readers handle worst.
-->
<div class="canvas-frame" style="height: {height}px" role="img" aria-label={label}>
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style>
  .canvas-frame {
    position: relative;
    width: 100%;
  }
</style>
