import type { Content } from './supabase';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p';
const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY as string | undefined;

interface TmdbTitle {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
}

interface TmdbResponse {
  results: TmdbTitle[];
}

export async function fetchTrendingContent(signal?: AbortSignal): Promise<Content[] | null> {
  if (!tmdbApiKey) return null;

  const url = new URL(`${TMDB_API_URL}/trending/all/week`);
  url.searchParams.set('api_key', tmdbApiKey);
  url.searchParams.set('language', 'en-US');

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as TmdbResponse;
  return payload.results
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
    .filter(item => item.poster_path && item.backdrop_path)
    .map((item, index) => {
      const type = item.media_type === 'tv' ? 'series' : 'movie';
      const tmdbId = String(item.id);
      const title = item.title ?? item.name ?? 'Untitled';
      const releaseDate = item.release_date ?? item.first_air_date ?? '';

      return {
        id: `tmdb-${type}-${tmdbId}`,
        title,
        description: item.overview || 'No description is available for this title yet.',
        type,
        release_year: releaseDate ? Number.parseInt(releaseDate.slice(0, 4), 10) : 0,
        rating: item.vote_average ? item.vote_average.toFixed(1) : 'NR',
        thumbnail_url: `${TMDB_IMAGE_URL}/w780${item.poster_path}`,
        backdrop_url: `${TMDB_IMAGE_URL}/original${item.backdrop_path}`,
        video_url: `https://vidsrc.xyz/embed/${type === 'series' ? 'tv' : 'movie'}?tmdb=${tmdbId}`,
        embed_urls: buildEmbedUrls(type, tmdbId),
        is_featured: index === 0,
        created_at: new Date().toISOString(),
      };
    });
}

function buildEmbedUrls(type: Content['type'], tmdbId: string): string[] {
    const mediaType = type === 'series' ? 'tv' : 'movie';

    return [
      `https://vidsrc.xyz/embed/${mediaType}?tmdb=${tmdbId}`,
      `https://vidsrc.to/embed/${mediaType}?tmdb=${tmdbId}`,
      `https://vidsrc.me/embed/${mediaType}?tmdb=${tmdbId}`,
      `https://vidlink.pro/${mediaType}/${tmdbId}`,
      `https://autoembed.cc/embed/${mediaType}/${tmdbId}`,
    ];
}
