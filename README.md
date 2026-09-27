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
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

If Supabase is not configured, the app uses mock data for that source. When a
TMDB key is configured, the home page loads the weekly trending catalogue from
TMDB and creates VidSrc embed URLs from each title's TMDB ID.
TMDB titles also include fallback embed servers; use **Next server** in the
player overlay if the active provider is unavailable.

## Playback embeds

Set `video_url` to an HTTPS iframe URL from a supported provider. The player
opens approved embed hosts in an iframe and rejects unknown hosts; direct
`.m3u8`, `.mp4`, `.webm`, and `.ogg` URLs remain supported for self-hosted
content.

## Scripts

- `npm run dev` – start the Vite dev server
- `npm run build` – production build
- `npm run preview` – preview the build locally
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript check
- `npm run check` – lint + typecheck combo

## Node version
Requires Node.js 18+ (Vite 5 requirement).
