import { getSupabase } from '$lib/supabase/client.js';
import { ALL_FEATURE_KEYS } from '$lib/admin/features.js';

/*
  What a licence unlocks lives in `licenses.features`, a jsonb map.

  It used to be written to `license_features (license_id, feature_key)` — a
  table nothing reads. `effective_features()` resolves the map on this column,
  and both the app's membership gate and the RLS policy that decides whether a
  piece may be added read that function. Rows in the old table changed nothing
  anywhere, which is why every feature value so far had to be set by migration.

  Three kinds of key live in the map, and only the first is a tick box:

    <feature>            true    a surface the app switches on
    membership.access    true    may reach the screens that create things
    membership.badge     string  the tier name shown in the app
    vault.pieces         number  how many pieces may be held, null = unlimited

  `vault.pieces` is always written. An absent key fails closed in
  `has_vault_room()` and refuses every insert with no cap ever compared, so a
  licence created here must never leave it out; "none" is the number 0.
*/

/**
 * A product license and the app features it unlocks.
 *
 * @typedef {{
 *   id: string,
 *   slug: string,
 *   name: string,
 *   description: string,
 *   is_system: boolean,
 *   sort_order: number,
 *   created_at: string,
 *   updated_at: string,
 *   features: string[],
 *   access: boolean,
 *   vaultPieces: number | null,
 * }} License
 */

/** Access, the badge and the vault cap are not tick boxes; they have their own controls. */
export const ACCESS_KEY = 'membership.access';
export const BADGE_KEY = 'membership.badge';
export const VAULT_PIECES_KEY = 'vault.pieces';

const LICENSE_COLUMNS =
  'id, slug, name, description, is_system, sort_order, created_at, updated_at, features';

/** @returns {Promise<License[]>} */
export async function fetchLicenses() {
  const { data, error } = await getSupabase()
    .from('licenses')
    .select(LICENSE_COLUMNS)
    .order('is_system', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalize);
}

/**
 * @param {{
 *   name: string,
 *   slug: string,
 *   description?: string,
 *   features?: string[],
 *   access?: boolean,
 *   vaultPieces?: number | null,
 * }} input
 * @returns {Promise<License>}
 */
export async function createLicense({
  name,
  slug,
  description = '',
  features = [],
  access = false,
  vaultPieces = 0,
}) {
  const cleanSlug = slug.trim().toLowerCase();
  validateSlug(cleanSlug);
  validateFeatures(features);

  const cleanName = name.trim();

  const { data, error } = await getSupabase()
    .from('licenses')
    .insert({
      name: cleanName,
      slug: cleanSlug,
      description: description.trim(),
      sort_order: await nextSortOrder(),
      features: buildFeatureMap({ features, access, vaultPieces, name: cleanName }),
    })
    .select(LICENSE_COLUMNS)
    .single();

  if (error) throw error;
  return normalize(data);
}

/**
 * @param {string} id
 * @param {{ name?: string, description?: string }} patch
 */
export async function updateLicense(id, patch) {
  /** @type {Record<string, unknown>} */
  const row = {};

  if (patch.name !== undefined) row.name = patch.name.trim();
  if (patch.description !== undefined) row.description = patch.description.trim();

  const { data, error } = await getSupabase()
    .from('licenses')
    .update(row)
    .eq('id', id)
    .select(LICENSE_COLUMNS)
    .single();

  if (error) throw error;
  return normalize(data);
}

/** @param {string} id */
export async function deleteLicense(id) {
  const { error } = await getSupabase().from('licenses').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Replaces what a license unlocks. System licenses are blocked in Postgres.
 *
 * The whole map is rewritten rather than merged: a feature unticked here has to
 * disappear, and merging would leave it set forever.
 *
 * @param {string} licenseId
 * @param {{ features: string[], access: boolean, vaultPieces: number | null, name: string }} input
 */
export async function setLicenseFeatures(licenseId, { features, access, vaultPieces, name }) {
  validateFeatures(features);

  const { data, error } = await getSupabase()
    .from('licenses')
    .update({ features: buildFeatureMap({ features, access, vaultPieces, name }) })
    .eq('id', licenseId)
    .select(LICENSE_COLUMNS)
    .single();

  if (error) throw error;
  return normalize(data);
}

/**
 * @param {{ features: string[], access: boolean, vaultPieces: number | null, name: string }} input
 * @returns {Record<string, unknown>}
 */
function buildFeatureMap({ features, access, vaultPieces, name }) {
  /** @type {Record<string, unknown>} */
  const map = {};

  for (const key of features) {
    map[key] = true;
  }

  if (access) {
    map[ACCESS_KEY] = true;
  }

  // Always written: an absent key fails closed and refuses every insert.
  map[VAULT_PIECES_KEY] = vaultPieces;

  // The label the app shows follows the licence's own name, so the two cannot
  // drift into disagreeing about what a tier is called.
  map[BADGE_KEY] = name;

  return map;
}

/** @param {string} slug */
export function validateSlug(slug) {
  if (!slug) throw new Error('A slug is required.');
  if (slug === 'founder') throw new Error('The slug “founder” is reserved for the system license.');
  if (!/^[a-z][a-z0-9_]*$/.test(slug)) {
    throw new Error('Use lowercase letters, numbers, and underscores. Start with a letter.');
  }
}

/** @param {string[]} keys */
function validateFeatures(keys) {
  const unknown = keys.filter((key) => !ALL_FEATURE_KEYS.has(key));
  if (unknown.length > 0) {
    throw new Error(`Unknown feature keys: ${unknown.join(', ')}`);
  }
}

async function nextSortOrder() {
  const { data, error } = await getSupabase()
    .from('licenses')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.sort_order ?? 0) + 1;
}

/** @param {Record<string, unknown>} row */
function normalize(row) {
  const map = /** @type {Record<string, unknown>} */ (row.features ?? {});

  const features = Object.keys(map)
    .filter((key) => ALL_FEATURE_KEYS.has(key) && map[key] === true)
    .sort();

  const pieces = map[VAULT_PIECES_KEY];

  return {
    ...row,
    features,
    access: map[ACCESS_KEY] === true,
    vaultPieces: typeof pieces === 'number' ? pieces : null,
  };
}
