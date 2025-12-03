import { useState } from 'react';
import { Play, AlertCircle } from 'lucide-react';
import type { VideoData } from '@/hooks/useVideos';

interface VideoCardProps {
  video: VideoData;
  index: number;
  onClick: () => void;
}

export function VideoCard({ video, index, onClick }: VideoCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      className="group relative aspect-video bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail Image */}
      {imageError ? (
        <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-800">
          <AlertCircle className="w-8 h-8 text-neutral-400" />
        </div>
      ) : (
        <img
          src={video.thumbnailUrl}
          alt={`Video #${index + 1}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      {/* Play overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-neutral-800/90 rounded-full p-4">
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
