import { getSupabase } from '$lib/supabase/client.js';

/**
 * The collector list.
 *
 * Read straight from `profiles` rather than through an RPC: the admin select
 * policy already opens every row, and going through PostgREST is what buys the
 * console its search, sort and paging for free. Block and delete go through
 * that same table write and `admin_delete_user` respectively — both keyed on
 * `is_admin()`, never on a service-role key in this site.
 *
 * @typedef {{
 *   id: string,
 *   full_name: string | null,
 *   email: string | null,
 *   membership_tier: string,
 *   created_at: string,
 *   last_seen_at: string | null,
 *   blocked_at: string | null,
 *   is_admin: boolean,
 * }} AdminUser
 */

/** Mirrors TIER_LABELS in the app — the column stores a slug, both ends name it. */
export const MEMBERSHIP_TIERS = [
  { slug: 'founding', label: 'Founding Collector' },
  { slug: 'collector', label: 'Collector' },
  { slug: 'archivist', label: 'Archivist' },
];

/** @param {string | null | undefined} slug */
export function tierLabel(slug) {
  return MEMBERSHIP_TIERS.find((tier) => tier.slug === slug)?.label ?? (slug || 'Unknown');
}

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest first', column: 'created_at', ascending: false },
  { value: 'created_at_asc', label: 'Oldest first', column: 'created_at', ascending: true },
  { value: 'last_seen_at', label: 'Recently active', column: 'last_seen_at', ascending: false },
  { value: 'full_name', label: 'Name A–Z', column: 'full_name', ascending: true },
];

export const PAGE_SIZE = 25;

/**
 * One page of collectors, with the total behind it so the UI can page.
 *
 * @param {{ search?: string, sort?: string, page?: number, blockedOnly?: boolean }} options
 * @returns {Promise<{ users: AdminUser[], total: number }>}
 */
export async function fetchUsers({ search = '', sort = 'created_at', page = 0, blockedOnly = false } = {}) {
  const supabase = getSupabase();
  const order = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];
  const from = page * PAGE_SIZE;

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, membership_tier, created_at, last_seen_at, blocked_at', {
      count: 'exact',
    })
    .order(order.column, { ascending: order.ascending, nullsFirst: false })
    .range(from, from + PAGE_SIZE - 1);

  const term = search.trim();
  if (term) {
    // Commas separate the branches of an `or`, so one in the search box would
    // be read as another condition rather than as text to match.
    const escaped = term.replace(/[,()]/g, ' ');
    query = query.or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%`);
  }

  if (blockedOnly) {
    query = query.not('blocked_at', 'is', null);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const adminIds = await fetchAdminIds();

  return {
    users: (data ?? []).map((row) => ({ ...row, is_admin: adminIds.has(row.id) })),
    total: count ?? 0,
  };
}

/**
 * Who else holds the keys. Its own query because `admin_users` has no foreign
 * key PostgREST could embed it through from `profiles`.
 *
 * @returns {Promise<Set<string>>}
 */
async function fetchAdminIds() {
  const { data, error } = await getSupabase().from('admin_users').select('user_id');
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.user_id));
}

/**
 * Moves a collector to another membership tier.
 *
 * Only an admin can do this: a trigger rejects the same write from the account
 * holder, so a failure here means privileges, not a bad slug.
 *
 * @param {string} userId
 * @param {string} tier
 */
export async function updateMembershipTier(userId, tier) {
  if (!MEMBERSHIP_TIERS.some((option) => option.slug === tier)) {
    throw new Error(`Unknown membership tier: ${tier}`);
  }

  const { data, error } = await getSupabase()
    .from('profiles')
    .update({ membership_tier: tier })
    .eq('id', userId)
    .select('id, membership_tier')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Bans or restores a collector.
 *
 * The write is a `blocked_at` stamp; a trigger bans the Auth user and drops
 * their sessions so the next sign-in fails without a service-role key here.
 *
 * @param {string} userId
 * @param {boolean} blocked
 */
export async function setUserBlocked(userId, blocked) {
  const { data, error } = await getSupabase()
    .from('profiles')
    .update({ blocked_at: blocked ? new Date().toISOString() : null })
    .eq('id', userId)
    .select('id, blocked_at')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Removes the Auth user. Vault rows cascade with them; storage objects are
 * cleared inside the RPC. Admins and the signed-in operator are refused in
 * Postgres, not only in the button that hides the action.
 *
 * @param {string} userId
 */
export async function deleteUser(userId) {
  const { error } = await getSupabase().rpc('admin_delete_user', { target_id: userId });
  if (error) throw error;
}
