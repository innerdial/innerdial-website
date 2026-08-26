import { getSupabase } from '$lib/supabase/client.js';

/**
 * The dashboard's word from the watchmaker.
 *
 * The app shows one tip at a time and rotates through the published set by the
 * day, so `sort_order` fixes that rotation rather than ranking a visible list.
 *
 * @typedef {{
 *   id: string,
 *   body: string,
 *   link_label: string,
 *   link_path: string,
 *   published: boolean,
 *   sort_order: number,
 *   created_at: string,
 *   updated_at: string,
 * }} WatchmakerTip
 */

const COLUMNS = 'id, body, link_label, link_path, published, sort_order, created_at, updated_at';

/** @returns {Promise<WatchmakerTip[]>} */
export async function fetchTips() {
  const { data, error } = await getSupabase()
    .from('watchmaker_tips')
    .select(COLUMNS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** @param {Partial<WatchmakerTip>} tip */
export async function createTip(tip) {
  const { data, error } = await getSupabase()
    .from('watchmaker_tips')
    .insert(toRow(tip))
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

/**
 * @param {string} id
 * @param {Partial<WatchmakerTip>} tip
 */
export async function updateTip(id, tip) {
  const { data, error } = await getSupabase()
    .from('watchmaker_tips')
    .update(toRow(tip))
    .eq('id', id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

/** @param {string} id */
export async function deleteTip(id) {
  const { error } = await getSupabase().from('watchmaker_tips').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Writes the running order back after a drag or a nudge. One request per tip,
 * because PostgREST has no bulk update and the list is a handful of rows.
 *
 * @param {{ id: string, sort_order: number }[]} order
 */
export async function reorderTips(order) {
  const supabase = getSupabase();

  const results = await Promise.all(
    order.map(({ id, sort_order }) =>
      supabase.from('watchmaker_tips').update({ sort_order }).eq('id', id),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

/** @param {Partial<WatchmakerTip>} tip */
function toRow(tip) {
  /** @type {Record<string, unknown>} */
  const row = {};

  if (tip.body !== undefined) row.body = tip.body.trim();
  if (tip.link_label !== undefined) row.link_label = tip.link_label.trim();
  if (tip.link_path !== undefined) row.link_path = tip.link_path.trim();
  if (tip.published !== undefined) row.published = tip.published;
  if (tip.sort_order !== undefined) row.sort_order = tip.sort_order;

  return row;
}
