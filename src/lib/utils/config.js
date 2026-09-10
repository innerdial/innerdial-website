/** @typedef {typeof appConfig} AppConfig */

/** @type {AppConfig} */
export const appConfig = {
  appName: 'Innerdial',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  },
};

/**
 * Where supabase-js persists the session.
 *
 * It lives in this module rather than beside the client that configures it so
 * the nav can check whether a session is worth offering — see `SiteNav` — with
 * a `localStorage` read. Importing it from `$lib/supabase/client.js` would be
 * the obvious home and would also drag supabase-js into the bundle the
 * marketing page downloads, which is the one thing the split here exists to
 * prevent.
 */
export const AUTH_STORAGE_KEY = 'innerdial-web-auth';
