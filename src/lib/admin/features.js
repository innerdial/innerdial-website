/**
 * Every feature surface in the collector app.
 *
 * Keys match routes and modules in the sibling `innerdial` repo. The Licenses
 * screen lists these so an admin can tick which ones a plan unlocks.
 *
 * @typedef {{ key: string, label: string, group: string, hint?: string }} AppFeature
 */

/** @type {AppFeature[]} */
export const APP_FEATURES = [
  { key: 'vault', label: 'Vault', group: 'Collection', hint: 'Watch collection, photos, bulk import' },
  { key: 'documents', label: 'Documents', group: 'Collection', hint: 'Invoices, warranties and papers' },
  { key: 'service', label: 'Service', group: 'Collection', hint: 'Service history and reminders' },
  { key: 'timeline', label: 'Timeline', group: 'Collection', hint: 'Collection timeline events' },
  { key: 'travel', label: 'Travel boxes', group: 'Collection', hint: 'Pack trips with selected pieces' },
  { key: 'wotd', label: 'Wear log (WOTD)', group: 'Collection', hint: 'Daily wear tracking' },
  { key: 'news', label: 'News feed', group: 'Content', hint: 'Editorial stories in the app' },
  {
    key: 'watchmaker_tips',
    label: 'Watchmaker tips',
    group: 'Content',
    hint: 'Rotating advice on the dashboard',
  },
  { key: 'moonphase', label: 'Moonphase', group: 'Tools', hint: 'Set a moonphase complication' },
  { key: 'atomic_clock', label: 'Atomic Clock', group: 'Tools', hint: 'Reference time to the second' },
  { key: 'world_time', label: 'World Time', group: 'Tools', hint: 'Second time zone on the 24-hour hand' },
  { key: 'accuracy', label: 'Accuracy', group: 'Tools', hint: 'Measure daily gain or loss' },
  { key: 'discount', label: 'Discount Calculator', group: 'Tools', hint: 'Sale prices and savings' },
  { key: 'onboarding', label: 'Personal onboarding', group: 'Membership', hint: 'Founder-led setup' },
  { key: 'price_lock', label: 'Price locked for life', group: 'Membership' },
  { key: 'data_export', label: 'Data export', group: 'Membership', hint: 'Export vault data anytime' },
];

/** @type {Set<string>} */
export const ALL_FEATURE_KEYS = new Set(APP_FEATURES.map((feature) => feature.key));

/** @param {string} key */
export function featureLabel(key) {
  return APP_FEATURES.find((feature) => feature.key === key)?.label ?? key;
}

/** Groups in display order. */
export const FEATURE_GROUPS = ['Collection', 'Content', 'Tools', 'Membership'];

/** @param {string} group */
export function featuresInGroup(group) {
  return APP_FEATURES.filter((feature) => feature.group === group);
}
