import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Share2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/useToast';
import { VideoActions } from './VideoActions';
import { CommentsSection } from './comments/CommentsSection';
import type { VideoData } from '@/hooks/useVideos';

interface VideoLightboxProps {
  video: VideoData;
  videoIndex: number;
  totalVideos: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function VideoLightbox({ video: videoData, videoIndex, totalVideos, onClose, onNavigate }: VideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // The event is already available from the video data
  const event = videoData.event;

  const hasPrev = videoIndex > 0;
  const hasNext = videoIndex < totalVideos - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev) onNavigate(videoIndex - 1);
  }, [hasPrev, videoIndex, onNavigate]);

  const goToNext = useCallback(() => {
    if (hasNext) onNavigate(videoIndex + 1);
  }, [hasNext, videoIndex, onNavigate]);

  // Set video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoData.videoUrl) return;

    video.src = videoData.videoUrl;
    video.load();

    video.play().catch(() => {
      // Autoplay blocked, user will click play
    });
  }, [videoData.videoUrl]);

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
            poster={videoData.thumbnailUrl}
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

            <VideoActions event={event} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <CommentsSection
                root={event}
                title="Comments"
                emptyStateMessage="No comments yet"
                emptyStateSubtitle="Be the first to comment"
                className="bg-transparent border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
