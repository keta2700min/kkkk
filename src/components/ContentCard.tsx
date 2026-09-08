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
    <article className="group relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 shadow-lg shadow-black/20 transition-[transform,box-shadow] duration-300 hover:z-10 hover:scale-[1.04] hover:shadow-2xl hover:shadow-black/60 focus-within:z-10 focus-within:ring-2 focus-within:ring-white/80">
      <img
        src={content.thumbnail_url}
        alt={content.title}
        width="520"
        height="780"
        loading="lazy"
        className="h-full w-full object-cover transition-[transform,filter] duration-500 group-hover:scale-105 group-hover:brightness-75"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <span className="rounded-full border border-white/20 bg-black/40 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
          {content.type === 'series' ? 'Series' : 'Movie'}
        </span>
        <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-black shadow-lg">
          {content.rating}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex translate-y-2 flex-col justify-end p-4 opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-white drop-shadow-lg">
          {content.title}
        </h3>

        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/75">
          <span>{content.release_year}</span>
          {content.duration_minutes && (
            <>
              <span className="text-white/40">•</span>
              <span>{Math.floor(content.duration_minutes / 60)}h {content.duration_minutes % 60}m</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPlay}
            aria-label={`Play ${content.title}`}
            className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-black transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Play size={14} fill="currentColor" />
            Play
          </button>
          <button
            onClick={onAddToList}
            aria-label={`Add ${content.title} to My List`}
            className="min-h-10 min-w-10 rounded-lg border border-white/20 bg-black/60 p-1.5 text-white backdrop-blur-md transition-colors hover:border-white hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="Add to My List"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onInfo}
            aria-label={`More information about ${content.title}`}
            className="min-h-10 min-w-10 rounded-lg border border-white/20 bg-black/60 p-1.5 text-white backdrop-blur-md transition-colors hover:border-white hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="More Info"
          >
            <Info size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
