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
        tmdb_id: tmdbId,
        video_url: buildEmbedUrls(type, tmdbId)[0],
        embed_urls: buildEmbedUrls(type, tmdbId),
        is_featured: index === 0,
        created_at: new Date().toISOString(),
      };
    });
}

export function buildEmbedUrls(
  type: Content['type'],
  tmdbId: string,
  season = 1,
  episode = 1
): string[] {
  if (type === 'movie') {
    return [
      `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`,
      `https://vidsrc.to/embed/movie/${tmdbId}`,
      `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
      `https://vidlink.pro/movie/${tmdbId}`,
      `https://autoembed.cc/embed/movie/${tmdbId}`,
    ];
  }

  return [
    `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
    `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
    `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
    `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
    `https://autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
  ];
}
