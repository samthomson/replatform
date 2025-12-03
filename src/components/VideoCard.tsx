import { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Play } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface VideoCardProps {
  videoUrl: string;
  index: number;
  onClick: () => void;
}

export function VideoCard({ videoUrl, index, onClick }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 0,
        maxBufferLength: 3,
        maxMaxBufferLength: 5,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError(true);
          setIsLoading(false);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
      });
      video.addEventListener('error', () => {
        setError(true);
        setIsLoading(false);
      });
    } else {
      setError(true);
      setIsLoading(false);
    }
  }, [videoUrl]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && !error) {
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
    <Card
      className="group relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20 cursor-pointer"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-0 aspect-video relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Skeleton className="w-full h-full" />
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-900/30 to-gray-900/30 text-white p-4">
            <Play className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm text-center opacity-70">Video #{index + 1}</p>
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

        {/* Play overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-6 border border-white/30">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Video number badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/20">
          #{index + 1}
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/20 to-pink-500/0"></div>
        </div>
      </CardContent>
    </Card>
  );
}
