/** @typedef {typeof appConfig} AppConfig */

/** @type {AppConfig} */
export const appConfig = {
  appName: 'Innerdial',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  },
};
