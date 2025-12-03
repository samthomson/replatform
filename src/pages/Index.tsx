import { useState, useEffect } from 'react';
import { useSeoMeta } from '@unhead/react';
import { useSearchParams } from 'react-router-dom';
import { VideoGrid } from '@/components/VideoGrid';
import { VideoLightbox } from '@/components/VideoLightbox';
import { LoginArea } from '@/components/auth/LoginArea';
import { VIDEO_DATA } from '@/lib/videoData';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

  useSeoMeta({
    title: 'Jacob Whatever - RIP PUBLICLY',
    description: 'Video gallery',
  });

  // Handle deep linking from URL params (1-indexed in URL, 0-indexed internally)
  useEffect(() => {
    const videoParam = searchParams.get('video');
    if (videoParam) {
      const videoNumber = parseInt(videoParam, 10);
      if (!isNaN(videoNumber) && videoNumber >= 1 && videoNumber <= VIDEO_DATA.length) {
        setSelectedVideoIndex(videoNumber - 1); // Convert to 0-indexed
      }
    }
  }, [searchParams]);

  const handleVideoClick = (index: number) => {
    setSelectedVideoIndex(index);
    setSearchParams({ video: (index + 1).toString() }); // Convert to 1-indexed for URL
  };

  const handleCloseLightbox = () => {
    setSelectedVideoIndex(null);
    setSearchParams({});
  };

  const handleNavigate = (index: number) => {
    setSelectedVideoIndex(index);
    setSearchParams({ video: (index + 1).toString() });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Nothing stops this <span className="line-through">train</span> jacob
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-1">
                RIP PUBLICLY
              </p>
            </div>

            <LoginArea className="max-w-xs" />
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VideoGrid videos={VIDEO_DATA} onVideoClick={handleVideoClick} />
      </main>

      {/* Lightbox */}
      {selectedVideoIndex !== null && (
        <VideoLightbox
          video={VIDEO_DATA[selectedVideoIndex]}
          videoIndex={selectedVideoIndex}
          totalVideos={VIDEO_DATA.length}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default Index;
