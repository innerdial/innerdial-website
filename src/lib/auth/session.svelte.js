import { getSupabase, isSupabaseConfigured } from '$lib/supabase/client.js';

/**
 * Admin session state.
 *
 * Being signed in and being an admin are two separate facts here. Any collector
 * with an app account can authenticate against this project; only a row in
 * `admin_users` makes the console usable, and the database enforces that
 * regardless of what this module believes. The `admin` flag exists so the UI
 * can say so plainly instead of rendering screens that fail one query at a time.
 */

/** @type {import('@supabase/supabase-js').Session | null} */
let session = $state(null);

/** Unknown until `is_admin()` answers — not false, which the guard would act on. */
let admin = $state(/** @type {boolean | null} */ (null));

/** Guards wait on this rather than redirecting off a session that is still loading. */
let ready = $state(false);

/** @type {Promise<void> | null} */
let initialising = null;

/** @type {(() => void) | null} */
let unsubscribe = null;

export function currentSession() {
  return session;
}

export function currentUser() {
  return session?.user ?? null;
}

export function isSignedIn() {
  return session !== null;
}

export function isAdmin() {
  return admin === true;
}

/**
 * `null` while the privilege check is still in flight. The guard needs the
 * difference: "not yet known" waits, "known to be false" turns someone away.
 */
export function adminStatus() {
  return admin;
}

export function isAuthReady() {
  return ready;
}

/** The name to greet an operator by, falling back to the local part of the email. */
export function operatorName() {
  const user = currentUser();
  if (!user) {
    return '';
  }

  const name = user.user_metadata?.full_name;
  if (typeof name === 'string' && name.trim()) {
    return name.trim();
  }

  return user.email?.split('@')[0] ?? '';
}

/**
 * Asks Postgres, not the client, whether this session is privileged.
 * A failure is treated as "not an admin": the console must fail closed.
 */
async function resolveAdmin() {
  if (!session) {
    admin = false;
    return;
  }

  try {
    const { data, error } = await getSupabase().rpc('is_admin');
    if (error) throw error;
    admin = data === true;
  } catch (error) {
    console.warn('[auth] admin check failed, treating session as unprivileged:', error);
    admin = false;
  }
}

async function start() {
  if (!isSupabaseConfigured) {
    ready = true;
    admin = false;
    return;
  }

  const supabase = getSupabase();

  try {
    const { data } = await supabase.auth.getSession();
    session = data?.session ?? null;
    await resolveAdmin();
  } catch (error) {
    console.warn('[auth] could not restore session:', error);
    session = null;
    admin = false;
  } finally {
    ready = true;
  }

  const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
    const changedAccount = next?.user?.id !== session?.user?.id;
    session = next;

    // A token refresh on the same account does not change privilege, and
    // re-checking on every refresh would put an RPC on a timer.
    if (changedAccount) {
      admin = null;
      resolveAdmin();
    }
  });

  unsubscribe = () => listener.subscription.unsubscribe();
}

/** Restores a persisted session and keeps it in step. Repeat calls share the first run. */
export function initAuth() {
  initialising ??= start();
  return initialising;
}

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ admin: boolean }>}
 */
export async function signIn({ email, password }) {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;

  session = data.session;
  admin = null;
  await resolveAdmin();

  return { admin: admin === true };
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;

  session = null;
  admin = false;
}
