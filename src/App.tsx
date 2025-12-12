import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ContentRow } from './components/ContentRow';
import { mockContent } from './data/mockData';
import { Content } from './lib/supabase';

function App() {
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [movies, setMovies] = useState<Content[]>([]);
  const [series, setSeries] = useState<Content[]>([]);

  useEffect(() => {
    const featured = mockContent.find(c => c.is_featured) || mockContent[0];
    setFeaturedContent(featured);

    setTrendingContent(mockContent.slice(0, 6));
    setMovies(mockContent.filter(c => c.type === 'movie'));
    setSeries(mockContent.filter(c => c.type === 'series'));
  }, []);

  const handlePlay = (content: Content) => {
    console.log('Playing:', content.title);
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
    </div>
  );
}

export default App;
