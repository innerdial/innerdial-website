/**
 * Presentation helpers for the console. Formatting only — nothing here decides
 * what a figure means, so a screen can render a number without first knowing
 * whether it is a count, a currency or a date.
 */

/*
  Pinned to the collector app's locale rather than the operator's browser. The
  app prints a collection's worth with CollectionValue.svelte's en-IN/INR
  formatter; a console that grouped the same figure a different way, or marked
  it in a different currency, would look like it was reporting something else.
*/
const LOCALE = 'en-IN';

const integerFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

const currencyFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dayFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });

/** @param {number | string | null | undefined} value */
export function formatCount(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? integerFormat.format(number) : '—';
}

/** @param {number | string | null | undefined} value */
export function formatCurrency(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? currencyFormat.format(number) : '—';
}

/** @param {string | null | undefined} iso */
export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date);
}

/** @param {string | Date} value */
export function formatDay(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dayFormat.format(date);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * How long ago, in the shape an operator scanning a table wants it. Falls back
 * to an absolute date past a fortnight, where "23 days ago" stops being useful.
 *
 * @param {string | null | undefined} iso
 */
export function formatRelative(iso) {
  if (!iso) return 'Never';

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';

  const elapsed = Date.now() - then;
  if (elapsed < MINUTE) return 'Just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < 14 * DAY) return `${Math.floor(elapsed / DAY)}d ago`;

  return formatDate(iso);
}

/** Turns an ISO timestamp into the value a `datetime-local` input expects. */
export function toDateTimeLocal(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  // Shifted into local time first: the input has no timezone, so an unshifted
  // ISO string would show an editor a moment they did not choose.
  const offset = date.getTimezoneOffset() * MINUTE;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** @param {string} value a `datetime-local` value */
export function fromDateTimeLocal(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
