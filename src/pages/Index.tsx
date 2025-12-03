import { useState, useEffect } from 'react';
import { useSeoMeta } from '@unhead/react';
import { useSearchParams } from 'react-router-dom';
import { VideoGrid } from '@/components/VideoGrid';
import { VideoLightbox } from '@/components/VideoLightbox';
import { LoginArea } from '@/components/auth/LoginArea';

const VIDEO_URLS = [
  'https://stream.divine.video/bda36984-1014-472e-8002-69426d96241a/playlist.m3u8',
  'https://stream.divine.video/396eaaf0-2393-4d3f-a431-4d1d6adb0535/playlist.m3u8',
  'https://stream.divine.video/be53cbeb-2fbc-4f2e-8a62-0079404bc500/playlist.m3u8',
  'https://stream.divine.video/497b443b-f3b0-4223-bfb5-72eef14e83a4/playlist.m3u8',
  'https://stream.divine.video/9bbbb70c-104f-49cf-ba9c-97e8fb73053b/playlist.m3u8',
  'https://stream.divine.video/b3c8851a-8eda-4a86-9b40-a17ae473fb92/playlist.m3u8',
  'https://stream.divine.video/445e927a-1e7b-42a5-96a2-cef2e3da130a/playlist.m3u8',
  'https://stream.divine.video/d09588f7-6678-4bcf-8189-1cbfd5332083/playlist.m3u8',
  'https://stream.divine.video/4bb8b2ae-1464-4ff7-a5e4-56da4dd3f8de/playlist.m3u8',
  'https://stream.divine.video/923e7d7a-3d5e-43f3-8790-ecd246c641f1/playlist.m3u8',
  'https://stream.divine.video/39521878-188a-40bf-8e07-aabffef4df18/playlist.m3u8',
  'https://stream.divine.video/2966af19-1fbf-4b5a-a18a-159536e411c4/playlist.m3u8',
  'https://stream.divine.video/b99010fd-4672-47d5-bc5b-f5a70dc22af6/playlist.m3u8',
  'https://stream.divine.video/6c7d0c4d-cd10-41c6-b85b-f172a2392638/playlist.m3u8',
  'https://stream.divine.video/71203c2c-cdd1-4dcd-a45e-bb994a9c5b74/playlist.m3u8',
  'https://stream.divine.video/0b1f751a-bb82-45c8-99cc-02df2f71e0c4/playlist.m3u8',
  'https://stream.divine.video/92a56b37-4db7-4b20-ba7b-f18b485f6070/playlist.m3u8',
  'https://stream.divine.video/91f93dee-f346-48bf-8f6e-ca5816d8b556/playlist.m3u8',
  'https://stream.divine.video/ddae4090-7405-4932-a55d-7f1b07add4a3/playlist.m3u8',
  'https://stream.divine.video/5f9baeac-5ba7-4a2e-8798-712708283dd9/playlist.m3u8',
  'https://stream.divine.video/4a6970ee-153b-47f5-af67-566941bd37d6/playlist.m3u8',
  'https://stream.divine.video/bbc58d8e-2a36-4ce5-8a27-055da24f2c19/playlist.m3u8',
  'https://stream.divine.video/2d5afc1b-bd8c-475a-ab4a-ed931205ec3f/playlist.m3u8',
  'https://stream.divine.video/ef1c1b02-989c-48ad-a9b1-d3379fbdb5ee/playlist.m3u8',
  'https://stream.divine.video/41bb6d09-3a41-459f-99e4-aa22ddcf511c/playlist.m3u8',
  'https://stream.divine.video/97fb8586-9813-4601-b027-e9bd0a595a69/playlist.m3u8',
  'https://stream.divine.video/69c5a667-2a89-4283-a2fe-e00b9605d0dc/playlist.m3u8',
  'https://stream.divine.video/61402de5-74da-4259-a69f-7bb21d0f471a/playlist.m3u8',
  'https://stream.divine.video/15535672-be67-423d-b26e-49936c00143f/playlist.m3u8',
  'https://stream.divine.video/d96c1bc8-867b-4381-8f29-1bde423748ac/playlist.m3u8',
  'https://stream.divine.video/97ca8069-dc83-4131-8f2e-e045f06e354e/playlist.m3u8',
  'https://stream.divine.video/9e4258d3-e397-4dbf-9db3-9f9801338139/playlist.m3u8',
  'https://stream.divine.video/da85cc09-d1f1-42d2-8917-cb42bd7cddf1/playlist.m3u8',
  'https://stream.divine.video/4c67f43a-c2ff-4cfe-a57d-b2db09197629/playlist.m3u8',
  'https://stream.divine.video/5744af14-1d72-42e3-8b4b-dc02406f96a2/playlist.m3u8',
  'https://stream.divine.video/0536c7e5-bc85-4e49-a0ad-4a56589294c0/playlist.m3u8',
  'https://stream.divine.video/41a8a5e5-43b0-41b3-ab13-da6f7f9f6310/playlist.m3u8',
  'https://stream.divine.video/7da0ac42-3ece-437d-b9b0-e232bee87d4d/playlist.m3u8',
  'https://stream.divine.video/581e8b6c-aa59-4a6a-bd61-89a99cead9f7/playlist.m3u8',
];

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

  useSeoMeta({
    title: 'Jacob Whatever - RIP PUBLICLY',
    description: 'Video gallery',
  });

  // Handle deep linking from URL params
  useEffect(() => {
    const videoParam = searchParams.get('video');
    if (videoParam) {
      const index = parseInt(videoParam, 10);
      if (!isNaN(index) && index >= 0 && index < VIDEO_URLS.length) {
        setSelectedVideoIndex(index);
      }
    }
  }, [searchParams]);

  const handleVideoClick = (index: number) => {
    setSelectedVideoIndex(index);
    setSearchParams({ video: index.toString() });
  };

  const handleCloseLightbox = () => {
    setSelectedVideoIndex(null);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                JACOB WHATEVER
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
        <VideoGrid videos={VIDEO_URLS} onVideoClick={handleVideoClick} />
      </main>

      {/* Lightbox */}
      {selectedVideoIndex !== null && (
        <VideoLightbox
          videoUrl={VIDEO_URLS[selectedVideoIndex]}
          videoIndex={selectedVideoIndex}
          onClose={handleCloseLightbox}
        />
      )}
    </div>
  );
};

export default Index;
