import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  onError?: () => void;
}

export function VideoPlayer({
  src,
  autoPlay = false,
  muted = false,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = src;
    video.load();

    if (autoPlay) {
      void video.play().catch(() => {
        // Browsers may block autoplay; controls remain available for manual playback.
      });
    }
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      className="h-full w-full bg-black"
      controls
      muted={muted}
      onError={onError}
      playsInline
    />
  );
}
