/**
 * The founding-member plans, as the site quotes them.
 *
 * The prices are set on the Razorpay plans that `razorpay-subscription` in the
 * sibling `innerdial` repo checks out against (`RAZORPAY_PLAN_ID` and
 * `RAZORPAY_YEARLY_PLAN_ID`). A marketing page and a checkout that disagree on
 * the number reads as a bait, so treat a change to either as a change to both.
 *
 * `id` is what the billing function is sent as `period`, and what
 * `subscriptions.billing_period` holds.
 *
 * @typedef {'monthly' | 'yearly'} BillingPeriod
 * @typedef {{ id: BillingPeriod, label: string, price: string, billing: string, saving: string | null, note: string }} Plan
 */

/** @type {Record<BillingPeriod, Plan>} */
export const PLANS = {
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    price: '₹499',
    billing: '/ month',
    saving: null,
    note: 'Billed every month. Cancel whenever you like.',
  },
  // Twelve months at ₹499 is ₹5,988; ₹4,999 over twelve is ₹416.58.
  yearly: {
    id: 'yearly',
    label: 'Yearly',
    price: '₹4,999',
    billing: '/ year',
    saving: 'Save ₹989',
    note: 'About ₹417 a month, billed once a year.',
  },
};

/** In the order the switch shows them. */
export const PLAN_LIST = [PLANS.monthly, PLANS.yearly];

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
