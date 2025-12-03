import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: string[];
  onVideoClick: (index: number) => void;
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((url, index) => (
        <VideoCard
          key={url}
          videoUrl={url}
          index={index}
          onClick={() => onVideoClick(index)}
        />
      ))}
    </div>
  );
}
