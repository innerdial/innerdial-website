# Innerdial Website — Agent Instructions

Svelte 5 + Vite site. `/` is the public corporate website. `/admin` is the admin console. The collector mobile app and database schema live in the sibling `innerdial` repo.

Ship production-grade code: clear, focused, secure, and easy to review. Prefer small diffs and explicit error handling over clever shortcuts.

## Commands

| Action | Command |
|--------|---------|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |

## Layout

- `src/pages/site/` — public marketing screens (`/` and future site routes)
- `src/pages/admin/` — admin console screens under `/admin`
- `src/lib/components/` — shared UI
- `src/lib/admin/` — console data access, one module per domain (`stats`, `users`, `news`, `tips`)
- `src/lib/auth/` — admin session and the `is_admin()` check
- `src/lib/supabase/` — client and error phrasing
- `src/lib/utils/` — small shared helpers (`config.js`, `format.js`)
- Register routes in `src/App.svelte` (`svelte-routing`)

Schema changes belong in `innerdial/supabase/migrations/`, not this repo.

## Hard rules

- Prefer `$lib/...` imports; import concrete modules (no re-export-only `index.js` barrels)
- Use Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`) for new UI state
- Style with CSS variables from `src/app.css`; follow `DESIGN.md` — do not invent accent colors
- Env: only `import.meta.env.VITE_*` in client code (copy `.env.example` → `.env.local`)
- Never commit secrets or service-role keys; no empty `catch` / silent failure
- Keep `/` for the corporate site; nest admin screens under `/admin`
- Load admin screens through `LazyPage` — the console's Supabase and Chart.js
  chunks must not land in the bundle a marketing visitor downloads
- Admin privilege is an RLS matter, never a client one: guard with
  `public.is_admin()` in Postgres and treat `RequireAdmin` as UX only
- Ask before adding dependencies

## Where detail lives

- Code quality: `.cursor/rules/code-quality.mdc`
- Project layout: `.cursor/rules/project-structure.mdc`
- UI tokens: `.cursor/rules/design-system.mdc`, `DESIGN.md`, `src/app.css`
- Svelte/JS patterns: `.cursor/rules/svelte-conventions.mdc`
