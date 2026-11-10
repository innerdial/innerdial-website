import { getSupabase } from '$lib/supabase/client.js';

/**
 * Support tickets filed from the app's Support screen.
 *
 * Read straight from `support_tickets`: its select policy opens every row to
 * `is_admin()`, and the update policy is what lets the console close one. The
 * collector's name comes from `profiles` in a second query, because the ticket
 * references `auth.users`, which PostgREST cannot embed through.
 *
 * @see innerdial/supabase/migrations/20261111130000_support_tickets.sql
 *
 * @typedef {{
 *   id: string,
 *   user_id: string | null,
 *   topic: string,
 *   subject: string,
 *   message: string,
 *   reply_to: string,
 *   status: 'open' | 'resolved',
 *   created_at: string,
 *   resolved_at: string | null,
 *   collector_name: string | null,
 * }} SupportTicket
 */

export const STATUS_FILTERS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All tickets' },
];

export const PAGE_SIZE = 25;

/**
 * One page of tickets, newest first, with the total behind it.
 *
 * @param {{ status?: string, search?: string, page?: number }} options
 * @returns {Promise<{ tickets: SupportTicket[], total: number }>}
 */
export async function fetchTickets({ status = 'open', search = '', page = 0 } = {}) {
  const supabase = getSupabase();
  const from = page * PAGE_SIZE;

  let query = supabase
    .from('support_tickets')
    .select('id, user_id, topic, subject, message, reply_to, status, created_at, resolved_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (status === 'open' || status === 'resolved') {
    query = query.eq('status', status);
  }

  const term = search.trim();
  if (term) {
    // Commas and parentheses would be read as more `or` branches, not text.
    const escaped = term.replace(/[,()]/g, ' ');
    query = query.or(
      `subject.ilike.%${escaped}%,message.ilike.%${escaped}%,reply_to.ilike.%${escaped}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const names = await fetchCollectorNames(rows.map((row) => row.user_id).filter(Boolean));

  return {
    tickets: rows.map((row) => ({ ...row, collector_name: names.get(row.user_id) ?? null })),
    total: count ?? 0,
  };
}

/**
 * @param {string[]} ids
 * @returns {Promise<Map<string, string | null>>}
 */
async function fetchCollectorNames(ids) {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();

  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name')
    .in('id', unique);

  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.id, row.full_name]));
}

/**
 * Closes a ticket or reopens it. The resolved stamp travels with the status —
 * the table refuses one without the other.
 *
 * @param {string} id
 * @param {boolean} resolved
 */
export async function setTicketResolved(id, resolved) {
  const { data, error } = await getSupabase()
    .from('support_tickets')
    .update({
      status: resolved ? 'resolved' : 'open',
      resolved_at: resolved ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select('id, status, resolved_at')
    .single();

  if (error) throw error;
  return data;
}
