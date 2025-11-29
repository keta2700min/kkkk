import { Play, Plus, Info } from 'lucide-react';
import { Content } from '../lib/supabase';

interface ContentCardProps {
  content: Content;
  onPlay?: () => void;
  onAddToList?: () => void;
  onInfo?: () => void;
}

export function ContentCard({ content, onPlay, onAddToList, onInfo }: ContentCardProps) {
  return (
    <div className="group relative aspect-video overflow-hidden rounded-md bg-zinc-900 transition-all duration-300 hover:scale-105 hover:z-10">
      <img
        src={content.thumbnail_url}
        alt={content.title}
        className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-40"
      />

      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="text-lg font-bold text-white mb-2">{content.title}</h3>

        <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
          <span className="px-1.5 py-0.5 border border-gray-400 rounded">{content.rating}</span>
          <span>{content.release_year}</span>
          {content.duration_minutes && (
            <span>{Math.floor(content.duration_minutes / 60)}h {content.duration_minutes % 60}m</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPlay}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white text-black rounded-md font-semibold hover:bg-gray-200 transition-colors text-sm"
          >
            <Play size={14} fill="currentColor" />
            Play
          </button>
          <button
            onClick={onAddToList}
            className="p-1.5 bg-zinc-800 text-white rounded-md border border-gray-600 hover:border-white transition-colors"
            title="Add to My List"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onInfo}
            className="p-1.5 bg-zinc-800 text-white rounded-md border border-gray-600 hover:border-white transition-colors"
            title="More Info"
          >
            <Info size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
