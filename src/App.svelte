<script>
  import { Router, Route } from 'svelte-routing';
  import Home from './pages/site/Home.svelte';
  import Privacy from './pages/site/Privacy.svelte';
  import LazyPage from '$lib/components/LazyPage.svelte';

  let { url = '' } = $props();

  /*
    The public site is eager; everything that needs Supabase is not. The console
    brings the client and Chart.js with it, and the account area brings the
    client — a visitor reading the homepage should pay for neither.
  */
  const admin = {
    login: () => import('./pages/admin/Login.svelte'),
    dashboard: () => import('./pages/admin/Dashboard.svelte'),
    users: () => import('./pages/admin/Users.svelte'),
    news: () => import('./pages/admin/News.svelte'),
    tips: () => import('./pages/admin/Tips.svelte'),
    licenses: () => import('./pages/admin/Licenses.svelte'),
  };

  const account = {
    login: () => import('./pages/site/Login.svelte'),
    home: () => import('./pages/account/Account.svelte'),
    membership: () => import('./pages/account/Membership.svelte'),
    // Public, but it signs in and calls Supabase, so it is not in the eager bundle.
    deletion: () => import('./pages/site/DeleteAccount.svelte'),
  };
</script>

<Router {url}>
  <Route path="/"><Home /></Route>
  <Route path="/privacy"><Privacy /></Route>

  <!-- Outside the guard: it is the way back in when there is no session. -->
  <Route path="/login"><LazyPage load={account.login} /></Route>

  <Route path="/account"><LazyPage load={account.home} guard="session" /></Route>
  <Route path="/account/membership"><LazyPage load={account.membership} guard="session" /></Route>

  <!-- Unguarded: the app stores link here, and it must explain itself to someone signed out. -->
  <Route path="/delete-account"><LazyPage load={account.deletion} /></Route>

  <!-- Same reasoning as /login, for the console's own door. -->
  <Route path="/admin/login"><LazyPage load={admin.login} /></Route>

  <Route path="/admin"><LazyPage load={admin.dashboard} guard="admin" /></Route>
  <Route path="/admin/users"><LazyPage load={admin.users} guard="admin" /></Route>
  <Route path="/admin/news"><LazyPage load={admin.news} guard="admin" /></Route>
  <Route path="/admin/tips"><LazyPage load={admin.tips} guard="admin" /></Route>
  <Route path="/admin/licenses"><LazyPage load={admin.licenses} guard="admin" /></Route>
</Router>
