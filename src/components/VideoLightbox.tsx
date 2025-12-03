import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, Share2, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { useToast } from '@/hooks/useToast';
import { VideoActions } from './VideoActions';
import { CommentsSection } from './comments/CommentsSection';
import { useVideoEvent } from '@/hooks/useVideoEvent';

interface VideoLightboxProps {
  videoUrl: string;
  videoIndex: number;
  onClose: () => void;
}

export function VideoLightbox({ videoUrl, videoIndex, onClose }: VideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { event, isLoading } = useVideoEvent(videoUrl, videoIndex);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Ignore autoplay errors
        });
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {
          // Ignore autoplay errors
        });
      });
    }
  }, [videoUrl]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?video=${videoIndex}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Video #${videoIndex + 1} - Jacob Whatever RIP Gallery`,
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
      <DialogContent className="max-w-6xl w-full p-0 bg-gray-900 border-purple-500/30 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-[90vh]">
          {/* Video Player Section */}
          <div className="flex-1 bg-black relative flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>

            <video
              ref={videoRef}
              controls
              className="w-full h-full object-contain"
              playsInline
            />
          </div>

          {/* Info and Comments Section */}
          <div className="w-full lg:w-96 bg-gradient-to-b from-gray-900 to-gray-950 border-l border-purple-500/30 flex flex-col overflow-hidden">
            {/* Video Info */}
            <div className="p-6 border-b border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Video #{videoIndex + 1}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-purple-500/30 hover:bg-purple-500/20"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Share2 className="w-4 h-4 mr-2" />
                  )}
                  {copied ? 'Copied!' : 'Share'}
                </Button>
              </div>

              <p className="text-purple-200/60 text-sm mb-4">
                Part of the Jacob Whatever memorial collection
              </p>

              {/* Video Actions (Reactions & Repost) */}
              {!isLoading && event && (
                <VideoActions event={event} />
              )}
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto">
              {!isLoading && event ? (
                <CommentsSection
                  root={event}
                  title="Comments"
                  emptyStateMessage="No comments yet"
                  emptyStateSubtitle="Be the first to share your thoughts"
                  className="h-full"
                />
              ) : (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-purple-500/20 rounded w-3/4"></div>
                    <div className="h-4 bg-purple-500/20 rounded w-1/2"></div>
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
