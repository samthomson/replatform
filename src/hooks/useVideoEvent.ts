import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';
import { useCurrentUser } from './useCurrentUser';
import { useNostrPublish } from './useNostrPublish';

// Extract video ID from URL for consistent event identification
function getVideoId(url: string): string {
  const match = url.match(/\/([a-f0-9-]+)\/playlist\.m3u8/);
  return match ? match[1] : url;
}

export function useVideoEvent(videoUrl: string, videoIndex: number) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  
  const videoId = getVideoId(videoUrl);

  return useQuery({
    queryKey: ['video-event', videoId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // First, try to find existing event with this video URL
      const events = await nostr.query(
        [
          {
            kinds: [21], // Normal video event from NIP-71
            '#r': [videoUrl],
            limit: 1,
          },
        ],
        { signal }
      );

      if (events.length > 0) {
        return events[0];
      }

      // If no event exists and user is logged in, create one
      if (user) {
        return new Promise<NostrEvent>((resolve) => {
          createEvent(
            {
              kind: 21,
              content: `Memorial video #${videoIndex + 1} from the Jacob Whatever collection`,
              tags: [
                ['title', `Jacob Whatever - Video #${videoIndex + 1}`],
                ['r', videoUrl],
                ['imeta', 
                  `url ${videoUrl}`,
                  'm application/x-mpegURL',
                  `alt Video #${videoIndex + 1} from Jacob Whatever memorial collection`
                ],
                ['t', 'memorial'],
                ['t', 'rip'],
                ['published_at', Math.floor(Date.now() / 1000).toString()],
                ['alt', `Memorial video #${videoIndex + 1}`],
              ],
            },
            {
              onSuccess: (event) => {
                resolve(event);
              },
            }
          );
        });
      }

      // If user is not logged in, create a placeholder event for UI purposes
      // This won't be published to relays
      return {
        id: videoId,
        pubkey: '0000000000000000000000000000000000000000000000000000000000000000',
        created_at: Math.floor(Date.now() / 1000),
        kind: 21,
        tags: [
          ['title', `Jacob Whatever - Video #${videoIndex + 1}`],
          ['r', videoUrl],
        ],
        content: `Memorial video #${videoIndex + 1} from the Jacob Whatever collection`,
        sig: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      } as NostrEvent;
    },
    staleTime: Infinity, // Video events don't change
  });
}
