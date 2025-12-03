import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';
import { useCurrentUser } from './useCurrentUser';

export function useReactions(eventId: string) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  const { data: reactions = [], isLoading } = useQuery({
    queryKey: ['reactions', eventId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [
          {
            kinds: [7], // Reaction kind
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

  const hasReacted = user
    ? reactions.some((reaction: NostrEvent) => reaction.pubkey === user.pubkey)
    : false;

  return {
    reactions,
    hasReacted,
    isLoading,
  };
}
