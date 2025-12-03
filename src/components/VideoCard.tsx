import { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Play } from 'lucide-react';

interface VideoCardProps {
  videoUrl: string;
  index: number;
  onClick: () => void;
}

export function VideoCard({ videoUrl, index, onClick }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Clean up any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 3,
        maxMaxBufferLength: 5,
        startLevel: 0, // Start with lowest quality for thumbnails
      });

      hlsRef.current = hls;

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setError(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          setError(true);
          setIsLoading(false);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = videoUrl;
      
      const handleLoaded = () => {
        setIsLoading(false);
        setError(false);
      };
      
      const handleError = () => {
        setError(true);
        setIsLoading(false);
      };

      video.addEventListener('loadedmetadata', handleLoaded);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoaded);
        video.removeEventListener('error', handleError);
      };
    } else {
      setError(true);
      setIsLoading(false);
    }
  }, [videoUrl]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && !error && !isLoading) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <button
      className="group relative aspect-video bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
          <div className="animate-pulse text-neutral-400 dark:text-neutral-600">
            Loading...
          </div>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-400">
          <Play className="w-12 h-12 mb-2" />
          <p className="text-sm">Video #{index + 1}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      )}

      {/* Play overlay on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <div className="bg-white/90 dark:bg-neutral-800/90 rounded-full p-4">
          <Play className="w-8 h-8 text-neutral-900 dark:text-white fill-current" />
        </div>
      </div>

      {/* Video number badge */}
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
        #{index + 1}
      </div>
    </button>
  );
}
