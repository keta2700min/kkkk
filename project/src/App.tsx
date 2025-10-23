import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ContentRow } from './components/ContentRow';
import { mockContent } from './data/mockData';
import { Content } from './lib/supabase';
import { VideoPlayer } from './components/VideoPlayer';

function App() {
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [movies, setMovies] = useState<Content[]>([]);
  const [series, setSeries] = useState<Content[]>([]);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackTitle, setPlaybackTitle] = useState<string>('');
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isEmbedPlayback, setIsEmbedPlayback] = useState(false);

  useEffect(() => {
    const featured = mockContent.find(c => c.is_featured) || mockContent[0];
    setFeaturedContent(featured);

    setTrendingContent(mockContent.slice(0, 6));
    setMovies(mockContent.filter(c => c.type === 'movie'));
    setSeries(mockContent.filter(c => c.type === 'series'));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawUrl = params.get('url');
    const sanitized = sanitizePlaybackUrl(rawUrl);

    if (sanitized) {
      const providedTitle = params.get('title');
      setPlaybackTitle(providedTitle ? providedTitle : 'Now Playing');
      setPlaybackError(null);
      setIsEmbedPlayback(isEmbedUrl(sanitized));
      setPlaybackUrl(sanitized);
    }
  }, []);

  const updateUrlParam = (url: string | null) => {
    const nextUrl = new URL(window.location.href);

    if (url) {
      nextUrl.searchParams.set('url', url);
    } else {
      nextUrl.searchParams.delete('url');
    }

    window.history.replaceState({}, '', nextUrl.toString());
  };

  const handlePlay = (content: Content) => {
    const sanitized = sanitizePlaybackUrl(content.video_url);

    if (!sanitized) {
      console.warn(`No playable URL configured for "${content.title}".`);
      setPlaybackError('This title does not have a supported stream yet.');
      setPlaybackUrl(null);
      updateUrlParam(null);
      return;
    }

    setPlaybackTitle(content.title);
    setPlaybackError(null);
    setIsEmbedPlayback(isEmbedUrl(sanitized));
    setPlaybackUrl(sanitized);
    updateUrlParam(sanitized);
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
    updateUrlParam(null);
  };

  return (
    <div className="bg-black min-h-screen">
      <Navbar />

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
          contents={mockContent.slice(0, 5)}
          onPlay={handlePlay}
          onAddToList={handleAddToList}
          onInfo={handleInfo}
        />
      </div>

      {playbackUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex items-center justify-between px-6 py-4 bg-black/60">
            <div>
              <p className="text-sm text-gray-300">Streaming</p>
              <h2 className="text-lg font-semibold text-white">{playbackTitle}</h2>
            </div>
            <button
              onClick={closePlayback}
              className="rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              Close
            </button>
          </div>
          <div className="flex-1">
            {playbackError ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center text-white">
                <p className="text-xl font-semibold">Unable to load the stream.</p>
                <p className="max-w-md text-sm text-gray-300">{playbackError}</p>
                <button
                  onClick={closePlayback}
                  className="rounded bg-white px-4 py-2 font-semibold text-black transition-colors hover:bg-gray-200"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              isEmbedPlayback ? (
                <iframe
                  key={playbackUrl}
                  src={playbackUrl}
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
            )}
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
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host === 'vidsrc.xyz' || host === 'www.vidsrc.xyz';
  } catch {
    return false;
  }
}

function isDirectMediaPath(pathname: string): boolean {
  const lowered = pathname.toLowerCase();
  return ['.m3u8', '.mp4', '.webm', '.ogg'].some(ext => lowered.endsWith(ext));
}
