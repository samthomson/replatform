import { VideoCard } from './VideoCard';
import type { VideoData } from '@/lib/videoData';

interface VideoGridProps {
  videos: VideoData[];
  onVideoClick: (index: number) => void;
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <VideoCard
          key={video.hlsUrl}
          video={video}
          index={index}
          onClick={() => onVideoClick(index)}
        />
      ))}
    </div>
  );
}
