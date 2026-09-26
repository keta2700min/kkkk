import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ContentRow } from './components/ContentRow';
import { mockContent } from './data/mockData';
import { Content } from './lib/supabase';
import { buildEmbedUrls, fetchTrendingContent } from './lib/tmdb';
import { VideoPlayer } from './components/VideoPlayer';

function App() {
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [movies, setMovies] = useState<Content[]>([]);
  const [series, setSeries] = useState<Content[]>([]);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackTitle, setPlaybackTitle] = useState('');
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isEmbedPlayback, setIsEmbedPlayback] = useState(false);
  const [playbackServers, setPlaybackServers] = useState<string[]>([]);
  const [playbackServerIndex, setPlaybackServerIndex] = useState(0);
  const [pendingSeries, setPendingSeries] = useState<Content | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    const applyCatalogue = (catalogue: Content[]) => {
      const featured = catalogue.find(c => c.is_featured) || catalogue[0];
      setFeaturedContent(featured);
      setTrendingContent(catalogue.slice(0, 6));
      setMovies(catalogue.filter(c => c.type === 'movie'));
      setSeries(catalogue.filter(c => c.type === 'series'));
    };

    void fetchTrendingContent(controller.signal)
      .then(catalogue => applyCatalogue(catalogue?.length ? catalogue : mockContent))
      .catch(error => {
        if (!controller.signal.aborted) {
          console.warn('[tmdb] Falling back to mock catalogue.', error);
          applyCatalogue(mockContent);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sanitized = sanitizePlaybackUrl(params.get('url'));

    if (!sanitized) return;

    setPlaybackTitle(params.get('title') || 'Now Playing');
    setPlaybackError(null);
    setIsEmbedPlayback(isEmbedUrl(sanitized));
    setPlaybackUrl(sanitized);
    const restoredServers = [...new Set(params.getAll('server')
      .map(sanitizePlaybackUrl)
      .filter((url): url is string => Boolean(url)))];
    if (restoredServers.length) {
      setPlaybackServers(restoredServers);
      setPlaybackServerIndex(Math.max(0, restoredServers.indexOf(sanitized)));
    }
  }, []);

  useEffect(() => {
    if (!playbackUrl || playbackServers.length || !trendingContent.length) return;

    const content = [...trendingContent, ...movies, ...series].find(item =>
      [item.video_url, ...(item.embed_urls ?? [])].includes(playbackUrl) ||
      (item.tmdb_id && item.tmdb_id === getTmdbIdFromUrl(playbackUrl))
    );
    if (!content) return;

    const { season: restoredSeason, episode: restoredEpisode } = getEpisodeFromUrl(playbackUrl);
    const knownUrls = content.tmdb_id
      ? buildEmbedUrls(content.type, content.tmdb_id, restoredSeason, restoredEpisode)
      : [content.video_url, ...(content.embed_urls ?? [])];
    const candidates = [...new Set([playbackUrl, ...knownUrls]
      .map(sanitizePlaybackUrl)
      .filter((url): url is string => Boolean(url)))];
    setPlaybackServers(candidates);
    setPlaybackServerIndex(Math.max(0, candidates.indexOf(playbackUrl)));
  }, [playbackUrl, playbackServers.length, trendingContent, movies, series]);

  const updateUrlParam = (url: string | null, title?: string, servers: string[] = []) => {
    const nextUrl = new URL(window.location.href);

    if (url) {
      nextUrl.searchParams.set('url', url);
      if (title) {
        nextUrl.searchParams.set('title', title);
      } else {
        nextUrl.searchParams.delete('title');
      }
      nextUrl.searchParams.delete('server');
      servers.forEach(server => nextUrl.searchParams.append('server', server));
    } else {
      nextUrl.searchParams.delete('url');
      nextUrl.searchParams.delete('title');
      nextUrl.searchParams.delete('server');
    }

    window.history.replaceState({}, '', nextUrl.toString());
  };

  const handlePlay = (content: Content) => {
    if (content.type === 'series') {
      setPendingSeries(content);
      setSeason(1);
      setEpisode(1);
      return;
    }

    startPlayback(content);
  };

  const startPlayback = (content: Content, selectedSeason = 1, selectedEpisode = 1) => {
    const configuredUrls = content.tmdb_id
      ? buildEmbedUrls(content.type, content.tmdb_id, selectedSeason, selectedEpisode)
      : [content.video_url, ...(content.embed_urls ?? [])];
    const candidates = configuredUrls
      .filter((url): url is string => Boolean(url))
      .map(sanitizePlaybackUrl)
      .filter((url): url is string => Boolean(url));
    const uniqueCandidates = [...new Set(candidates)];
    const sanitized = uniqueCandidates[0] ?? null;

    if (!sanitized) {
      console.warn(`No playable URL configured for "${content.title}".`);
      setPlaybackError('This title does not have a supported stream yet.');
      setPlaybackUrl(null);
      setPlaybackServers([]);
      updateUrlParam(null);
      return;
    }

    setPlaybackTitle(content.title);
    setPlaybackError(null);
    setIsEmbedPlayback(isEmbedUrl(sanitized));
    setPlaybackServers(uniqueCandidates);
    setPlaybackServerIndex(0);
    setPlaybackUrl(sanitized);
    updateUrlParam(sanitized, content.title, uniqueCandidates);
    setPendingSeries(null);
  };

  const handleAddToList = (content: Content) => {
    console.log('Adding to list:', content.title);
  };

  const handleInfo = (content: Content) => {
    console.log('Show info for:', content.title);
  };

  if (!featuredContent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const closePlayback = () => {
    setPlaybackUrl(null);
    setPlaybackError(null);
    setIsEmbedPlayback(false);
    setPlaybackServers([]);
    setPlaybackServerIndex(0);
    updateUrlParam(null);
  };

  const switchPlaybackServer = () => {
    if (playbackServers.length < 2) return;

    const nextIndex = (playbackServerIndex + 1) % playbackServers.length;
    const nextUrl = playbackServers[nextIndex];
    setPlaybackServerIndex(nextIndex);
    setPlaybackError(null);
    setIsEmbedPlayback(isEmbedUrl(nextUrl));
    setPlaybackUrl(nextUrl);
    updateUrlParam(nextUrl, playbackTitle, playbackServers);
  };

  return (
    <div className="bg-black min-h-screen">
      <Navbar />

      {pendingSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="episode-picker-title"
            className="w-full max-w-sm space-y-4 rounded-lg bg-zinc-900 p-6 text-white"
            onSubmit={event => {
              event.preventDefault();
              startPlayback(pendingSeries, season, episode);
            }}
          >
            <h2 id="episode-picker-title" className="text-xl font-semibold">Choose an episode</h2>
            <p className="text-sm text-gray-300">{pendingSeries.title}</p>
            <label className="block text-sm">
              Season
              <input
                type="number"
                min="1"
                value={season}
                onChange={event => setSeason(Math.max(1, Number(event.target.value)))}
                className="mt-1 w-full rounded bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="block text-sm">
              Episode
              <input
                type="number"
                min="1"
                value={episode}
                onChange={event => setEpisode(Math.max(1, Number(event.target.value)))}
                className="mt-1 w-full rounded bg-black px-3 py-2 text-white"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingSeries(null)}
                className="rounded px-3 py-2 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
              <button type="submit" className="rounded bg-white px-4 py-2 text-sm font-semibold text-black">
                Play episode
              </button>
            </div>
          </form>
        </div>
      )}

      <HeroBanner
        content={featuredContent}
        onPlay={() => handlePlay(featuredContent)}
        onInfo={() => handleInfo(featuredContent)}
      />

      <div className="relative -mt-32 z-10 pb-20">
        <ContentRow
          title="Trending Now"
          contents={trendingContent}
          onPlay={handlePlay}
          onAddToList={handleAddToList}
          onInfo={handleInfo}
        />

        <ContentRow
          title="Movies"
          contents={movies}
          onPlay={handlePlay}
          onAddToList={handleAddToList}
          onInfo={handleInfo}
        />

        <ContentRow
          title="TV Series"
          contents={series}
          onPlay={handlePlay}
          onAddToList={handleAddToList}
          onInfo={handleInfo}
        />

        <ContentRow
          title="Action & Adventure"
          contents={trendingContent.slice(0, 5)}
          onPlay={handlePlay}
          onAddToList={handleAddToList}
          onInfo={handleInfo}
        />
      </div>

      {(playbackUrl || playbackError) && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex items-center justify-between bg-black/60 px-6 py-4">
            <div>
              <p className="text-sm text-gray-300">Streaming</p>
              <h2 className="text-lg font-semibold text-white">{playbackTitle}</h2>
            </div>
            <div className="flex items-center gap-2">
              {playbackServers.length > 1 && (
                <button
                  type="button"
                  onClick={switchPlaybackServer}
                  className="rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  Next server ({playbackServerIndex + 1}/{playbackServers.length})
                </button>
              )}
              <button
                type="button"
                onClick={closePlayback}
                className="rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1">
            {playbackError ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center text-white">
                <p className="text-xl font-semibold">Unable to load the stream.</p>
                <p className="max-w-md text-sm text-gray-300">{playbackError}</p>
                <button
                  type="button"
                  onClick={closePlayback}
                  className="rounded bg-white px-4 py-2 font-semibold text-black transition-colors hover:bg-gray-200"
                >
                  Dismiss
                </button>
              </div>
            ) : playbackUrl ? (
              isEmbedPlayback ? (
              <iframe
                key={playbackUrl}
                src={playbackUrl}
                title={playbackTitle}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <VideoPlayer
                key={playbackUrl}
                src={playbackUrl}
                autoPlay
                onError={() =>
                  setPlaybackError(
                    'Please check that the URL is reachable and points to a supported media stream.'
                  )
                }
              />
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

function sanitizePlaybackUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl);
    const protocol = parsed.protocol.toLowerCase();

    if (protocol !== 'http:' && protocol !== 'https:') {
      return null;
    }

    if (isEmbedUrl(parsed.toString()) || isDirectMediaPath(parsed.pathname)) {
      return parsed.toString();
    }
  } catch (error) {
    console.warn('Invalid playback URL received:', error);
  }

  return null;
}

function isEmbedUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return EMBED_HOSTS.has(host) || [...EMBED_HOSTS].some(embedHost => host.endsWith(`.${embedHost}`));
  } catch {
    return false;
  }
}

const EMBED_HOSTS = new Set([
  'vidsrc.fyi',
  'vidsrc.me',
  'vidsrc.to',
  'vidsrc.cc',
  'vidsrc.xyz',
  'vidsrc.rip',
  'vidsrc.su',
  'vidsrc.vip',
  'vidsrc.net',
  'vidsrc.pro',
  'vidlink.pro',
  'videasy.to',
  '2embedstream.xyz',
  'autoembed.cc',
  'smashystream.com',
  'moviesapi.club',
  'primewire.tf',
  'filmku.stream',
  'vixsrc.to',
  'vidnest.fun',
]);

function isDirectMediaPath(pathname: string): boolean {
  const lowered = pathname.toLowerCase();
  return ['.m3u8', '.mp4', '.webm', '.ogg'].some(extension =>
    lowered.endsWith(extension)
  );
}

function getTmdbIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const queryId = parsed.searchParams.get('tmdb');
    if (queryId) return queryId;

    const segments = parsed.pathname.split('/').filter(Boolean);
    const mediaIndex = segments.findIndex(segment => segment === 'movie' || segment === 'tv');
    const pathId = mediaIndex >= 0 ? segments[mediaIndex + 1] : null;
    return pathId && /^\d+$/.test(pathId) ? pathId : null;
  } catch {
    return null;
  }
}

function getEpisodeFromUrl(url: string): { season: number; episode: number } {
  try {
    const parsed = new URL(url);
    const season = Number(parsed.searchParams.get('season'));
    const episode = Number(parsed.searchParams.get('episode'));
    if (season > 0 && episode > 0) return { season, episode };

    const segments = parsed.pathname.split('/').filter(Boolean);
    const tvIndex = segments.indexOf('tv');
    const pathSeason = Number(tvIndex >= 0 ? segments[tvIndex + 2] : 0);
    const pathEpisode = Number(tvIndex >= 0 ? segments[tvIndex + 3] : 0);
    return {
      season: pathSeason > 0 ? pathSeason : 1,
      episode: pathEpisode > 0 ? pathEpisode : 1,
    };
  } catch {
    return { season: 1, episode: 1 };
  }
}
