import { getSupabase } from '$lib/supabase/client.js';
import { ALL_FEATURE_KEYS } from '$lib/admin/features.js';

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
 * }} License
 */

const LICENSE_COLUMNS =
  'id, slug, name, description, is_system, sort_order, created_at, updated_at';

/** @returns {Promise<License[]>} */
export async function fetchLicenses() {
  const { data, error } = await getSupabase()
    .from('licenses')
    .select(`${LICENSE_COLUMNS}, license_features ( feature_key )`)
    .order('is_system', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalize);
}

/**
 * @param {{ name: string, slug: string, description?: string, features?: string[] }} input
 * @returns {Promise<License>}
 */
export async function createLicense({ name, slug, description = '', features = [] }) {
  const cleanSlug = slug.trim().toLowerCase();
  validateSlug(cleanSlug);
  validateFeatures(features);

  const supabase = getSupabase();

  const { data: license, error } = await supabase
    .from('licenses')
    .insert({
      name: name.trim(),
      slug: cleanSlug,
      description: description.trim(),
      sort_order: await nextSortOrder(),
    })
    .select(LICENSE_COLUMNS)
    .single();

  if (error) throw error;

  if (features.length > 0) {
    await setLicenseFeatures(license.id, features);
  }

  return { ...license, features: [...features] };
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
  return data;
}

/** @param {string} id */
export async function deleteLicense(id) {
  const { error } = await getSupabase().from('licenses').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Replaces the feature set on a license. System licenses are blocked in Postgres.
 *
 * @param {string} licenseId
 * @param {string[]} featureKeys
 */
export async function setLicenseFeatures(licenseId, featureKeys) {
  validateFeatures(featureKeys);

  const supabase = getSupabase();

  const { error: deleteError } = await supabase
    .from('license_features')
    .delete()
    .eq('license_id', licenseId);

  if (deleteError) throw deleteError;

  if (featureKeys.length === 0) return;

  const { error } = await supabase
    .from('license_features')
    .insert(featureKeys.map((feature_key) => ({ license_id: licenseId, feature_key })));

  if (error) throw error;
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
  const embedded = /** @type {{ feature_key: string }[] | null} */ (row.license_features);
  const features = (embedded ?? []).map((item) => item.feature_key).sort();

  const { license_features: _drop, ...license } = row;
  return { ...license, features };
}
