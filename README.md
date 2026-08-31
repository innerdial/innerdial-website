# Innerdial Website

Svelte 5 + Vite corporate site (`/`) and admin console (`/admin`). Shares the Innerdial design system with the collector app.

## Commands

| Action | Command |
|--------|---------|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |

Copy `.env.example` to `.env.local` and fill in public `VITE_*` values — the same Supabase project the collector app points at. Never commit secrets.

## Admin console

| Route | Screen |
|-------|--------|
| `/admin/login` | Sign in |
| `/admin` | Dashboard — users, activity, vault totals, charts |
| `/admin/users` | Every collector; search, sort, change membership, block or delete |
| `/admin/news` | The feed behind the app's News screen |
| `/admin/tips` | The watchmaker tips on the app's dashboard |

### How access works

This is a static site, so it only ever holds the anon key — a service-role key
placed here would be served to every visitor. Privilege therefore lives in
Postgres: `public.is_admin()` reads the `admin_users` table, and every admin
policy and analytics function is keyed on it. An operator signs in with an
ordinary Innerdial account and the database decides what that account may do.

`RequireAdmin` is a convenience, not the boundary. Without a row in
`admin_users`, every query behind it returns nothing whatever the browser is
persuaded to render.

### Setting it up

1. Apply the admin migrations in `innerdial/supabase/migrations/` to the
   Supabase project, including `20260826120000_admin_console.sql` and
   `20260827120000_admin_user_moderation.sql` (block and delete). This repo
   does not own the schema — migrations live in the sibling `innerdial` repo.
2. Sign up through the collector app with the address you want to administer.
3. Grant it, once, in the Supabase SQL editor:

```sql
insert into public.admin_users (user_id, note)
select id, 'founder' from auth.users where email = 'you@example.com';
```

Further admins can be added the same way. There is deliberately no screen for
it: a console that can promote its own operators is one compromised session
away from being permanent.

See `AGENTS.md` and `DESIGN.md` for layout, conventions, and UI tokens.
