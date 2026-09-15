/**
 * The founding-member plan, as the site quotes it.
 *
 * This mirrors `src/lib/membership/plan.js` in the sibling `innerdial` repo,
 * which is what the app's own Membership screen reads. The two are separate
 * bundles and cannot share a module, so the price is stated in both — a
 * marketing page and a checkout that disagree on the number reads as a bait,
 * so treat a change to either as a change to both.
 */

export const PLAN_PRICE = '₹499';
export const PLAN_BILLING = '/ month';
export const PLAN_TRIAL_NOTE = '14-day free trial · Export your data anytime';

/**
 * What the membership includes, in the order the app's Membership screen lists
 * it.
 *
 * @type {{ id: string, label: string, detail: string }[]}
 */
export const PLAN_FEATURES = [
  {
    id: 'unlimited',
    label: 'Unlimited pieces in your vault',
    detail: 'No tier that caps the collection at ten and asks for more at eleven.',
  },
  {
    id: 'papers',
    label: 'Invoices, warranties & papers — filed',
    detail: 'Every document attached to the piece it belongs to, not a folder somewhere.',
  },
  {
    id: 'service',
    label: 'Service history & reminders',
    detail: 'What was done, by whom, and when the next one falls due.',
  },
  {
    id: 'timeline',
    label: 'Your collection timeline',
    detail: 'Acquisitions, services and milestones, in the order they happened.',
  },
  {
    id: 'onboarding',
    label: 'Personal onboarding with the founder',
    detail: 'Your collection entered properly, once, with someone on the line.',
  },
  {
    id: 'locked',
    label: 'Price locked for life · Export anytime',
    detail: 'What you pay today is what you pay in ten years. Your data leaves when you do.',
  },
];
