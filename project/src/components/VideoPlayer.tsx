import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  onError?: () => void;
}

export function VideoPlayer({ src, autoPlay = false, muted = false, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = src;
    video.load();

    if (autoPlay) {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay might be blocked by the browser; ignore the rejection so the
          // user can start playback manually via the UI controls.
        });
      }
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
