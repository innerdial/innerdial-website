import { getSupabase } from '$lib/supabase/client.js';

/**
 * Dashboard figures.
 *
 * Every number here is an aggregate computed in Postgres. The console does not
 * select another collector's rows to count them — a compromised admin session
 * should leak totals, not collections.
 *
 * @typedef {{
 *   total_users: number,
 *   new_users_7d: number,
 *   new_users_30d: number,
 *   active_1d: number,
 *   active_7d: number,
 *   active_30d: number,
 *   never_seen: number,
 *   watches_owned: number,
 *   watches_sold: number,
 *   watches_added_7d?: number,
 *   documents: number,
 *   service_records: number,
 *   travel_boxes: number,
 *   trips_active?: number,
 *   trips_upcoming?: number,
 *   wears_7d: number,
 *   wearers_7d?: number,
 *   published_articles: number,
 *   draft_articles: number,
 *   published_tips: number,
 * }} OverviewStats
 *
 * @typedef {{ day: string, signups: number, active: number, wears: number }} DailyPoint
 */

/** @returns {Promise<OverviewStats>} */
export async function fetchOverviewStats() {
  const { data, error } = await getSupabase().rpc('admin_overview_stats');
  if (error) throw error;

  // Declared collection value is private; drop it so the dashboard never holds it.
  const stats = { ...data };
  delete stats.collection_value;
  return stats;
}

/**
 * @param {number} days
 * @returns {Promise<DailyPoint[]>}
 */
export async function fetchDailySeries(days) {
  const { data, error } = await getSupabase().rpc('admin_daily_series', { days });
  if (error) throw error;

  // Counts arrive as bigint, which PostgREST serialises as a string.
  return (data ?? []).map((row) => ({
    day: row.day,
    signups: Number(row.signups),
    active: Number(row.active),
    wears: Number(row.wears),
  }));
}

/** @returns {Promise<{ membership_tier: string, users: number }[]>} */
export async function fetchTierBreakdown() {
  const { data, error } = await getSupabase().rpc('admin_tier_breakdown');
  if (error) throw error;

  return (data ?? []).map((row) => ({
    membership_tier: row.membership_tier,
    users: Number(row.users),
  }));
}

/** @returns {Promise<{ bucket: string, users: number }[]>} */
export async function fetchCollectionDistribution() {
  const { data, error } = await getSupabase().rpc('admin_collection_distribution');
  if (error) throw error;

  return (data ?? []).map((row) => ({ bucket: row.bucket, users: Number(row.users) }));
}
