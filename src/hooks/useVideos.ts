import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

const VIDEO_PUBKEY = '2b766fdedf7091878a40fa0647fd6d838d0a921d5d3ca308c7006d43891cdc0c';
const VIDEO_KIND = 34326;

export interface VideoData {
  event: NostrEvent;
  videoUrl: string;
  thumbnailUrl: string;
}

function parseVideoEvent(event: NostrEvent): VideoData | null {
  // Get url tag
  const urlTag = event.tags.find(([name]) => name === 'url');
  if (!urlTag || !urlTag[1]) return null;

  // Get thumb or image tag for thumbnail
  const thumbTag = event.tags.find(([name]) => name === 'thumb');
  const imageTag = event.tags.find(([name]) => name === 'image');
  const thumbnailUrl = thumbTag?.[1] || imageTag?.[1] || '';

  return {
    event,
    videoUrl: urlTag[1],
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

      // Filter to only include events from our client
      const filteredEvents = events.filter(e => {
        const clientTag = e.tags.find(([name]) => name === 'client');
        return clientTag && clientTag[1] === 'replatform.shakespeare.wtf';
      });

      console.log('Fetched video events:', events.length, 'filtered:', filteredEvents.length);

      // Parse events into video data, filter out invalid ones
      const videos = filteredEvents
        .map(parseVideoEvent)
        .filter((v): v is VideoData => v !== null);

      // Sort by created_at ascending (oldest first)
      videos.sort((a, b) => a.event.created_at - b.event.created_at);

      return videos;
    },
    staleTime: 60000, // 1 minute
  });
}
