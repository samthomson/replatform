import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

const VIDEO_PUBKEY = '2b766fdedf7091878a40fa0647fd6d838d0a921d5d3ca308c7006d43891cdc0c';
const VIDEO_KIND = 34236;

export interface VideoData {
  event: NostrEvent;
  videoUrl: string;
  thumbnailUrl: string;
}

function parseVideoEvent(event: NostrEvent): VideoData | null {
  // Find the imeta tag
  const imetaTag = event.tags.find(([name]) => name === 'imeta');
  if (!imetaTag) return null;

  let videoUrl = '';
  let thumbnailUrl = '';

  // Parse imeta tag values (format: "key value")
  for (let i = 1; i < imetaTag.length; i++) {
    const part = imetaTag[i];
    if (part.startsWith('url ')) {
      videoUrl = part.slice(4);
    } else if (part.startsWith('image ')) {
      thumbnailUrl = part.slice(6);
    }
  }

  if (!videoUrl) return null;

  return {
    event,
    videoUrl,
    thumbnailUrl,
  };
}

export function useVideos() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['videos', VIDEO_PUBKEY],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const events = await nostr.query(
        [
          {
            kinds: [VIDEO_KIND],
            authors: [VIDEO_PUBKEY],
          },
        ],
        { signal }
      );

      console.log('Fetched video events:', events.length);
      events.forEach((e, i) => {
        const dTag = e.tags.find(([name]) => name === 'd')?.[1];
        const imetaTag = e.tags.find(([name]) => name === 'imeta');
        console.log(`Event ${i}: d=${dTag}, imeta parts=${imetaTag?.length || 0}, created=${e.created_at}`);
      });

      // Parse events into video data, filter out invalid ones
      const videos = events
        .map(parseVideoEvent)
        .filter((v): v is VideoData => v !== null);

      console.log('Parsed videos:', videos.length);
      videos.forEach((v, i) => {
        console.log(`Video ${i}: url=${v.videoUrl}, thumb=${v.thumbnailUrl}`);
      });

      // Sort by created_at ascending (oldest first)
      videos.sort((a, b) => a.event.created_at - b.event.created_at);

      return videos;
    },
    staleTime: 60000, // 1 minute
  });
}
