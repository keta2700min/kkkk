import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Content } from '../lib/supabase';

interface HeroBannerProps {
  content: Content;
  onPlay?: () => void;
  onInfo?: () => void;
}

export function HeroBanner({ content, onPlay, onInfo }: HeroBannerProps) {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative h-[85vh] w-full">
      <div className="absolute inset-0">
        <img
          src={content.backdrop_url}
          alt={content.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-20 max-w-2xl">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
          {content.title}
        </h1>

        <div className="flex items-center gap-3 text-sm md:text-base text-gray-200 mb-6">
          <span className="px-2 py-1 border-2 border-gray-400 rounded font-semibold">
            {content.rating}
          </span>
          <span className="font-semibold">{content.release_year}</span>
          {content.duration_minutes && (
            <span className="font-semibold">
              {Math.floor(content.duration_minutes / 60)}h {content.duration_minutes % 60}m
            </span>
          )}
        </div>

        <p className="text-base md:text-lg text-gray-100 mb-8 line-clamp-3 drop-shadow-md max-w-xl">
          {content.description}
        </p>

        <div className="flex gap-4">
          <button
            onClick={onPlay}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-md font-bold text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            <Play size={24} fill="currentColor" />
            Play
          </button>
          <button
            onClick={onInfo}
            className="flex items-center gap-2 px-8 py-3 bg-gray-500/70 text-white rounded-md font-bold text-lg hover:bg-gray-500/50 transition-colors backdrop-blur-sm"
          >
            <Info size={24} />
            More Info
          </button>
        </div>
      </div>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-1/4 right-8 md:right-16 p-3 border-2 border-gray-400 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
    </div>
  );
}
