import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Hls from 'hls.js';
import { X, Share2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/useToast';
import { VideoActions } from './VideoActions';
import { CommentsSection } from './comments/CommentsSection';
import { useVideoEvent } from '@/hooks/useVideoEvent';
import type { VideoData } from '@/lib/videoData';

interface VideoLightboxProps {
  video: VideoData;
  videoIndex: number;
  totalVideos: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function VideoLightbox({ video: videoData, videoIndex, totalVideos, onClose, onNavigate }: VideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data: event, isLoading } = useVideoEvent(videoData.hlsUrl, videoIndex);

  const hasPrev = videoIndex > 0;
  const hasNext = videoIndex < totalVideos - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev) onNavigate(videoIndex - 1);
  }, [hasPrev, videoIndex, onNavigate]);

  const goToNext = useCallback(() => {
    if (hasNext) onNavigate(videoIndex + 1);
  }, [hasNext, videoIndex, onNavigate]);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoData.hlsUrl) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,
        capLevelToPlayerSize: true,
      });

      hls.loadSource(videoData.hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Autoplay blocked, user will click play
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error('Fatal HLS error:', data);
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = videoData.hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {
          // Autoplay blocked
        });
      });
    }
  }, [videoData.hlsUrl]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrev, goToNext]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?video=${videoIndex + 1}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Video #${videoIndex + 1}`,
          url: shareUrl,
        });
      } catch {
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-neutral-900 w-full max-w-6xl max-h-[90vh] rounded-lg overflow-hidden flex flex-col lg:flex-row">
        {/* Video Player */}
        <div className="flex-1 bg-black relative min-h-[300px] lg:min-h-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation arrows */}
          {hasPrev && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
              onClick={goToPrev}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}
          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
              onClick={goToNext}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          <video
            ref={videoRef}
            controls
            playsInline
            poster={videoData.thumbnailBlossomUrl}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 bg-neutral-50 dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden max-h-[50vh] lg:max-h-none">
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
    </div>,
    document.body
  );
}
