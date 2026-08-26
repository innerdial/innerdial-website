<script>
  /**
   * The console's front page: how many collectors there are, how many are still
   * turning up, and what they are keeping in the vault.
   *
   * Every figure is an aggregate computed in Postgres — the screen never holds
   * another collector's rows in order to count them.
   */
  import AdminShell from '$lib/components/AdminShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import ChartCanvas, { chartPalette } from '$lib/components/ChartCanvas.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Panel from '$lib/components/Panel.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import { errorMessage } from '$lib/supabase/client.js';
  import {
    fetchCollectionDistribution,
    fetchDailySeries,
    fetchOverviewStats,
    fetchTierBreakdown,
  } from '$lib/admin/stats.js';
  import { tierLabel } from '$lib/admin/users.js';
  import { formatCount, formatCurrency, formatDay } from '$lib/utils/format.js';

  const RANGES = [
    { days: 7, label: '7 days' },
    { days: 30, label: '30 days' },
    { days: 90, label: '90 days' },
  ];

  let range = $state(30);
  let status = $state(/** @type {'loading' | 'ready' | 'error'} */ ('loading'));
  let error = $state('');

  /** @type {import('$lib/admin/stats.js').OverviewStats | null} */
  let stats = $state(null);

  /** @type {import('$lib/admin/stats.js').DailyPoint[]} */
  let series = $state([]);

  /** @type {{ membership_tier: string, users: number }[]} */
  let tiers = $state([]);

  /** @type {{ bucket: string, users: number }[]} */
  let distribution = $state([]);

  async function load(days) {
    status = 'loading';
    error = '';

    try {
      const [overview, daily, tierRows, sizeRows] = await Promise.all([
        fetchOverviewStats(),
        fetchDailySeries(days),
        fetchTierBreakdown(),
        fetchCollectionDistribution(),
      ]);

      stats = overview;
      series = daily;
      tiers = tierRows;
      distribution = sizeRows;
      status = 'ready';
    } catch (cause) {
      error = errorMessage(cause);
      status = 'error';
    }
  }

  $effect(() => {
    load(range);
  });

  const labels = $derived(series.map((point) => formatDay(point.day)));

  /**
   * Signups and active collectors share one chart because the question is how
   * they move against each other — a rising intake with a flat active line is
   * the thing a console exists to show.
   */
  const growthData = $derived.by(() => {
    const palette = chartPalette();

    return {
      labels,
      datasets: [
        {
          label: 'Active',
          data: series.map((point) => point.active),
          borderColor: palette.ink,
          backgroundColor: 'rgb(14 27 44 / 8%)',
          borderWidth: 2,
          fill: true,
          tension: 0.32,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: 'New sign-ups',
          data: series.map((point) => point.signups),
          borderColor: palette.primary,
          backgroundColor: 'rgb(184 147 90 / 14%)',
          borderWidth: 2,
          fill: true,
          tension: 0.32,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  });

  const wearsData = $derived.by(() => {
    const palette = chartPalette();

    return {
      labels,
      datasets: [
        {
          label: 'Watches worn',
          data: series.map((point) => point.wears),
          backgroundColor: palette.primary,
          borderRadius: 3,
          maxBarThickness: 18,
        },
      ],
    };
  });

  const tierData = $derived.by(() => {
    const palette = chartPalette();
    const shades = [palette.primary, palette.ink, '#8d9aa8'];

    return {
      labels: tiers.map((row) => tierLabel(row.membership_tier)),
      datasets: [
        {
          data: tiers.map((row) => row.users),
          backgroundColor: tiers.map((_, index) => shades[index % shades.length]),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  });

  const distributionData = $derived.by(() => {
    const palette = chartPalette();

    return {
      labels: distribution.map((row) => row.bucket),
      datasets: [
        {
          label: 'Collectors',
          data: distribution.map((row) => row.users),
          backgroundColor: palette.ink,
          borderRadius: 3,
          maxBarThickness: 44,
        },
      ],
    };
  });

  function axes(palette) {
    return {
      x: {
        grid: { display: false },
        border: { color: palette.border },
        ticks: {
          color: palette.muted,
          font: { size: 11 },
          maxRotation: 0,
          autoSkipPadding: 16,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: palette.border },
        border: { display: false },
        ticks: { color: palette.muted, font: { size: 11 }, precision: 0, maxTicksLimit: 5 },
      },
    };
  }

  const lineOptions = $derived.by(() => ({
    scales: axes(chartPalette()),
    plugins: { legend: { display: true, position: 'bottom' } },
  }));

  const barOptions = $derived.by(() => ({ scales: axes(chartPalette()) }));

  const donutOptions = {
    cutout: '62%',
    plugins: { legend: { display: true, position: 'bottom' } },
  };

  /** The share of collectors seen in the last week, which is the retention read. */
  const activeShare = $derived.by(() => {
    if (!stats?.total_users) return '';
    return `${Math.round((stats.active_7d / stats.total_users) * 100)}% of all collectors`;
  });
</script>

<AdminShell title="Dashboard" subtitle="Everything the collector app is doing, in aggregate.">
  {#snippet actions()}
    <div class="ranges" role="group" aria-label="Chart range">
      {#each RANGES as option (option.days)}
        <button
          type="button"
          class="range"
          class:selected={range === option.days}
          aria-pressed={range === option.days}
          onclick={() => (range = option.days)}
        >
          {option.label}
        </button>
      {/each}
    </div>
    <Button onclick={() => load(range)} disabled={status === 'loading'}>Refresh</Button>
  {/snippet}

  {#if status === 'error'}
    <Callout tone="error" message={error} />
  {:else if status === 'loading' && !stats}
    <Loader label="Gathering the numbers" />
  {:else if stats}
    <div class="stats">
      <StatCard
        accent
        label="Total users"
        value={formatCount(stats.total_users)}
        note="{formatCount(stats.new_users_7d)} joined in the last 7 days"
      />
      <StatCard
        label="Active this week"
        value={formatCount(stats.active_7d)}
        note={activeShare}
      />
      <StatCard
        label="Active today"
        value={formatCount(stats.active_1d)}
        note="{formatCount(stats.active_30d)} in the last 30 days"
      />
      <StatCard
        label="Watches in vaults"
        value={formatCount(stats.watches_owned)}
        note="{formatCount(stats.watches_sold)} recorded as sold"
      />
      <StatCard
        label="Declared value"
        value={formatCurrency(stats.collection_value)}
        note="Across every piece still owned"
      />
      <StatCard
        label="Wears logged"
        value={formatCount(stats.wears_7d)}
        note="In the last 7 days"
      />
      <StatCard
        label="Documents held"
        value={formatCount(stats.documents)}
        note="{formatCount(stats.service_records)} service records"
      />
      <StatCard
        label="Published news"
        value={formatCount(stats.published_articles)}
        note="{formatCount(stats.draft_articles)} drafts · {formatCount(
          stats.published_tips,
        )} live tips"
      />
    </div>

    {#if stats.never_seen > 0}
      <div class="heads-up">
        <Callout tone="info">
          {formatCount(stats.never_seen)} collectors have not opened the app since activity tracking
          was added, so they count as inactive here regardless of when they last used it.
        </Callout>
      </div>
    {/if}

    <div class="charts">
      <div class="chart wide">
        <Panel
          title="Sign-ups and active collectors"
          hint="Daily, over the last {range} days. Active means the app was opened that day."
        >
          <ChartCanvas
            type="line"
            data={growthData}
            options={lineOptions}
            height={280}
            label="Daily sign-ups and active collectors over the last {range} days"
          />
        </Panel>
      </div>

      <div class="chart">
        <Panel title="Membership tiers" hint="How the collector base splits across tiers.">
          {#if tiers.length === 0}
            <Callout message="No collectors yet." />
          {:else}
            <ChartCanvas
              type="doughnut"
              data={tierData}
              options={donutOptions}
              height={260}
              label="Collectors by membership tier"
            />
          {/if}
        </Panel>
      </div>

      <div class="chart">
        <Panel title="Collection size" hint="Pieces held per collector, still owned.">
          <ChartCanvas
            type="bar"
            data={distributionData}
            options={barOptions}
            height={260}
            label="Number of collectors by collection size"
          />
        </Panel>
      </div>

      <div class="chart wide">
        <Panel title="Watches worn" hint="Wear-log entries per day — the app's stickiest action.">
          <ChartCanvas
            type="bar"
            data={wearsData}
            options={barOptions}
            height={240}
            label="Wear-log entries per day over the last {range} days"
          />
        </Panel>
      </div>
    </div>
  {/if}
</AdminShell>

<style>
  .ranges {
    display: inline-flex;
    padding: 2px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
  }

  .range {
    padding: 0.3125rem var(--space-sm);
    border: none;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--color-text-muted);
    font: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .range.selected {
    background: var(--color-ink);
    color: #fff;
  }

  .range:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    gap: var(--space-md);
  }

  .heads-up {
    margin-top: var(--space-md);
  }

  .charts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-md);
    margin-top: var(--space-md);
  }

  .chart.wide {
    grid-column: 1 / -1;
  }

  @media (max-width: 1000px) {
    .charts {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
