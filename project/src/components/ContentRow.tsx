import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { Content } from '../lib/supabase';
import { ContentCard } from './ContentCard';

interface ContentRowProps {
  title: string;
  contents: Content[];
  onPlay?: (content: Content) => void;
  onAddToList?: (content: Content) => void;
  onInfo?: (content: Content) => void;
}

export function ContentRow({ title, contents, onPlay, onAddToList, onInfo }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? rowRef.current.scrollLeft - scrollAmount
        : rowRef.current.scrollLeft + scrollAmount;

      rowRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (contents.length === 0) return null;

  return (
    <div className="relative group px-8 md:px-16 lg:px-20 mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h2>

      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            aria-label="Scroll left"
          >
            <ChevronLeft size={40} />
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {contents.map((content) => (
            <div key={content.id} className="flex-none w-64 md:w-80">
              <ContentCard
                content={content}
                onPlay={() => onPlay?.(content)}
                onAddToList={() => onAddToList?.(content)}
                onInfo={() => onInfo?.(content)}
              />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            aria-label="Scroll right"
          >
            <ChevronRight size={40} />
          </button>
        )}
      </div>
    </div>
  );
}
