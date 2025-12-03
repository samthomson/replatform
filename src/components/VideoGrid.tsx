import { VideoCard } from './VideoCard';
import { Skeleton } from './ui/skeleton';
import type { VideoData } from '@/hooks/useVideos';

interface VideoGridProps {
  videos: VideoData[];
  isLoading?: boolean;
  onVideoClick: (index: number) => void;
}

export function VideoGrid({ videos, isLoading, onVideoClick }: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-video rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <VideoCard
          key={video.event.id}
          video={video}
          index={index}
          onClick={() => onVideoClick(index)}
        />
      ))}
    </div>
  );
}
