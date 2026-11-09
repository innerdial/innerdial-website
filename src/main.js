import { mount } from 'svelte'
import './app.css'
import { claimRecoveryLink } from '$lib/auth/recovery.js'
import App from './App.svelte'

/*
  Before the first render. A password reset email lands on the site root
  carrying its token in the fragment, and the screen that can act on it lives
  at /reset-password.
*/
claimRecoveryLink()

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
