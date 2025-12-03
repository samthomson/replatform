import { useState } from 'react';
import type { NostrEvent } from '@nostrify/nostrify';
import { Heart, Repeat2, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useReactions } from '@/hooks/useReactions';
import { useReposts } from '@/hooks/useReposts';
import { ZapButton } from './ZapButton';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface VideoActionsProps {
  event: NostrEvent;
}

export function VideoActions({ event }: VideoActionsProps) {
  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();

  const { reactions, hasReacted, isLoading: reactionsLoading } = useReactions(event.id);
  const { reposts, hasReposted, isLoading: repostsLoading } = useReposts(event.id);

  const [isReacting, setIsReacting] = useState(false);
  const [isReposting, setIsReposting] = useState(false);

  const handleReaction = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to react to videos',
        variant: 'destructive',
      });
      return;
    }

    if (hasReacted) {
      toast({
        description: 'You already reacted to this video',
      });
      return;
    }

    setIsReacting(true);
    createEvent(
      {
        kind: 7,
        content: '❤️',
        tags: [
          ['e', event.id],
          ['p', event.pubkey],
        ],
      },
      {
        onSuccess: () => {
          toast({
            description: 'Reaction sent!',
          });
          setIsReacting(false);
        },
        onError: () => {
          toast({
            title: 'Failed to react',
            description: 'Please try again',
            variant: 'destructive',
          });
          setIsReacting(false);
        },
      }
    );
  };

  const handleRepost = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to repost videos',
        variant: 'destructive',
      });
      return;
    }

    if (hasReposted) {
      toast({
        description: 'You already reposted this video',
      });
      return;
    }

    setIsReposting(true);
    createEvent(
      {
        kind: 6,
        content: '',
        tags: [
          ['e', event.id],
          ['p', event.pubkey],
        ],
      },
      {
        onSuccess: () => {
          toast({
            description: 'Reposted!',
          });
          setIsReposting(false);
        },
        onError: () => {
          toast({
            title: 'Failed to repost',
            description: 'Please try again',
            variant: 'destructive',
          });
          setIsReposting(false);
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handleReaction}
        disabled={isReacting || hasReacted}
        className={cn(
          'gap-2',
          hasReacted && 'text-red-600 dark:text-red-500'
        )}
      >
        <Heart
          className={cn('w-4 h-4', hasReacted && 'fill-current')}
        />
        <span className="text-sm">
          {reactionsLoading ? '...' : reactions.length > 0 ? reactions.length : 'Like'}
        </span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRepost}
        disabled={isReposting || hasReposted}
        className={cn(
          'gap-2',
          hasReposted && 'text-green-600 dark:text-green-500'
        )}
      >
        <Repeat2 className="w-4 h-4" />
        <span className="text-sm">
          {repostsLoading ? '...' : reposts.length > 0 ? reposts.length : 'Repost'}
        </span>
      </Button>

      <ZapButton event={event} variant="outline" size="sm" className="gap-2">
        <Zap className="w-4 h-4" />
        <span className="text-sm">Zap</span>
      </ZapButton>
    </div>
  );
}
