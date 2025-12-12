# Vite React + Tailwind + Supabase (Optional)

Netflix‑style UI scaffold built with Vite + React + TypeScript + Tailwind.
Supabase is **optional**; the app runs fine with mock data if you don't set env vars.

## Quickstart

```bash
npm install
npm run dev
# open the printed local URL
```

## Environment (optional)
Copy `.env.example` to `.env` and fill:

```ini
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

If these are not set, the app will run in *mock mode* and skip Supabase.

## Scripts

- `npm run dev` – start the Vite dev server
- `npm run build` – production build
- `npm run preview` – preview the build locally
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript check
- `npm run check` – lint + typecheck combo

## Node version
Requires Node.js 18+ (Vite 5 requirement).
