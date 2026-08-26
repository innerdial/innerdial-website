<script>
  import { Router, Route } from 'svelte-routing';
  import Home from './pages/site/Home.svelte';
  import LazyPage from '$lib/components/LazyPage.svelte';

  let { url = '' } = $props();

  /*
    The public site is eager; the console is not. Everything under /admin brings
    the Supabase client and Chart.js with it, and a visitor reading the homepage
    should not pay for either.
  */
  const admin = {
    login: () => import('./pages/admin/Login.svelte'),
    dashboard: () => import('./pages/admin/Dashboard.svelte'),
    users: () => import('./pages/admin/Users.svelte'),
    news: () => import('./pages/admin/News.svelte'),
    tips: () => import('./pages/admin/Tips.svelte'),
  };
</script>

<Router {url}>
  <Route path="/"><Home /></Route>

  <!-- Outside the guard: it is the way back in when there is no session. -->
  <Route path="/admin/login"><LazyPage load={admin.login} /></Route>

  <Route path="/admin"><LazyPage load={admin.dashboard} guarded /></Route>
  <Route path="/admin/users"><LazyPage load={admin.users} guarded /></Route>
  <Route path="/admin/news"><LazyPage load={admin.news} guarded /></Route>
  <Route path="/admin/tips"><LazyPage load={admin.tips} guarded /></Route>
</Router>
