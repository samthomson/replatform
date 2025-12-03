import { useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { X, Share2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { useToast } from '@/hooks/useToast';
import { VideoActions } from './VideoActions';
import { CommentsSection } from './comments/CommentsSection';
import { useVideoEvent } from '@/hooks/useVideoEvent';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { VideoData } from '@/lib/videoData';
import { useState } from 'react';

interface VideoLightboxProps {
  video: VideoData;
  videoIndex: number;
  onClose: () => void;
}

export function VideoLightbox({ video, videoIndex, onClose }: VideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data: event, isLoading } = useVideoEvent(video.hlsUrl, videoIndex);

  useEffect(() => {
    // Small delay to ensure Dialog portal has rendered
    const timer = setTimeout(() => {
      const videoElement = videoRef.current;
      if (!videoElement) {
        console.log('No video element found');
        return;
      }

      console.log('Initializing HLS for:', video.hlsUrl);

      if (Hls.isSupported()) {
        console.log('HLS.js is supported, creating player...');
        const hls = new Hls({
          debug: true,
        });

        hls.loadSource(video.hlsUrl);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed successfully');
          videoElement.play().catch((e) => {
            console.log('Autoplay prevented:', e);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
        });

        // Cleanup function
        return () => {
          console.log('Destroying HLS instance');
          hls.destroy();
        };
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('Using native HLS support (Safari)');
        videoElement.src = video.hlsUrl;
        videoElement.addEventListener('loadedmetadata', () => {
          console.log('Video metadata loaded');
          videoElement.play().catch((e) => {
            console.log('Autoplay prevented:', e);
          });
        });
      } else {
        console.error('HLS not supported in this browser');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [video.hlsUrl]);

  const handleShare = async () => {
    // Use 1-indexed video number in URL to match UI display
    const shareUrl = `${window.location.origin}?video=${videoIndex + 1}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Video #${videoIndex + 1}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link to let others view this video',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full p-0 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" hideClose>
        <VisuallyHidden>
          <DialogTitle>Video #{videoIndex + 1}</DialogTitle>
          <DialogDescription>
            Video player with social features
          </DialogDescription>
        </VisuallyHidden>

        <div className="flex flex-col lg:flex-row h-[90vh]">
          {/* Video Player Section */}
          <div className="flex-1 bg-black relative flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>

            <video
              ref={videoRef}
              id="video"
              controls
              playsInline
              poster={video.thumbnailBlossomUrl}
              className="w-full h-full"
            />
          </div>

          {/* Info and Comments Section */}
          <div className="w-full lg:w-96 bg-neutral-50 dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
            {/* Video Info */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Video #{videoIndex + 1}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share
                    </>
                  )}
                </Button>
              </div>

              {/* Video Actions (Reactions & Repost) */}
              {!isLoading && event ? (
                <VideoActions event={event} />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-9 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
                  <div className="h-9 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
                  <div className="h-9 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto">
              {!isLoading && event ? (
                <div className="p-6">
                  <CommentsSection
                    root={event}
                    title="Comments"
                    emptyStateMessage="No comments yet"
                    emptyStateSubtitle="Be the first to comment"
                    className="bg-transparent border-0"
                  />
                </div>
              ) : (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
