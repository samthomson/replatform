import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';
import { useCurrentUser } from './useCurrentUser';

export function useReposts(eventId: string) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  const { data: reposts = [], isLoading } = useQuery({
    queryKey: ['reposts', eventId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query both kind 6 (repost) and kind 16 (generic repost)
      const events = await nostr.query(
        [
          {
            kinds: [6, 16],
            '#e': [eventId],
            limit: 500,
          },
        ],
        { signal }
      );

      return events;
    },
    enabled: !!eventId && eventId !== '0000000000000000000000000000000000000000000000000000000000000000',
  });

  const hasReposted = user
    ? reposts.some((repost: NostrEvent) => repost.pubkey === user.pubkey)
    : false;

  return {
    reposts,
    hasReposted,
    isLoading,
  };
}
