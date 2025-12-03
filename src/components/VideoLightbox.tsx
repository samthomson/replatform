import { useRef, useEffect, useState, useCallback } from 'react';
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

interface VideoLightboxProps {
  video: VideoData;
  videoIndex: number;
  onClose: () => void;
}

export function VideoLightbox({ video, videoIndex, onClose }: VideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [copied, setCopied] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const { toast } = useToast();
  const { data: event, isLoading } = useVideoEvent(video.hlsUrl, videoIndex);

  // Callback ref to get video element
  const setRefs = useCallback((node: HTMLVideoElement | null) => {
    console.log('Video ref callback:', node ? 'VIDEO ELEMENT' : 'NULL');
    videoRef.current = node;
    setVideoElement(node);
  }, []);

  // Initialize HLS when video element is ready
  useEffect(() => {
    const video = videoElement;
    if (!video) {
      console.log('No video element yet');
      return;
    }

    console.log('Initializing HLS for:', video);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      console.log('Destroying previous HLS instance');
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      console.log('HLS.js is supported');
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,
        capLevelToPlayerSize: true,
      });

      hls.loadSource(video.hlsUrl);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed successfully');
        videoElement.play().catch((e) => {
          console.log('Autoplay blocked (click play button):', e);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          console.error('Fatal HLS error');
        }
      });

      hlsRef.current = hls;

      return () => {
        console.log('Cleaning up HLS');
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('Using native HLS (Safari)');
      videoElement.src = video.hlsUrl;
      videoElement.addEventListener('loadedmetadata', () => {
        console.log('Metadata loaded');
        videoElement.play().catch((e) => {
          console.log('Autoplay blocked:', e);
        });
      });
    } else {
      console.error('HLS not supported');
    }
  }, [videoElement, video.hlsUrl]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?video=${videoIndex + 1}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Video #${videoIndex + 1}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link to view this video',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full p-0 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" hideClose>
        <VisuallyHidden>
          <DialogTitle>Video #{videoIndex + 1}</DialogTitle>
          <DialogDescription>Video player</DialogDescription>
        </VisuallyHidden>

        <div className="flex flex-col lg:flex-row h-[90vh]">
          {/* Video Player */}
          <div className="flex-1 bg-black relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>

            <video
              ref={setRefs}
              controls
              playsInline
              poster={video.thumbnailBlossomUrl}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-96 bg-neutral-50 dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Video #{videoIndex + 1}
                </h2>
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
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
