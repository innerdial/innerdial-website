<script>
  import { Router, Route } from 'svelte-routing';
  import Home from './pages/site/Home.svelte';
  import Admin from './pages/admin/Admin.svelte';

  let { url = '' } = $props();
</script>

<Router {url}>
  <Route path="/"><Home /></Route>
  <Route path="/admin"><Admin /></Route>
</Router>
