import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface OnlineUser {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  email?: string;
}

interface OnlineUsersBarProps {
  maxVisible?: number;
  className?: string;
}

export const OnlineUsersBar: React.FC<OnlineUsersBarProps> = ({ 
  maxVisible = 6,
  className = "" 
}) => {
  const { t } = useTranslation();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [totalOnline, setTotalOnline] = useState(0);

  useEffect(() => {
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;

    const setupPresence = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Get user profile for display
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, email')
          .eq('user_id', user.id)
          .single();

        // Create presence channel
        presenceChannel = supabase.channel('online_users', {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        // Track current user's presence
        presenceChannel.on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const users: OnlineUser[] = [];
          
          for (const userId in state) {
            const userPresences = state[userId];
            if (userPresences.length > 0) {
              const presence = userPresences[0] as Record<string, unknown>;
              users.push({
                user_id: userId,
                display_name: (presence.display_name as string) || t.participantsExtra.userFallbackName,
                avatar_url: presence.avatar_url as string | undefined,
                email: presence.email as string | undefined,
              });
            }
          }
          
          setOnlineUsers(users);
          setTotalOnline(users.length);
        });

        presenceChannel.on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: unknown[] }) => {
          console.log('User joined:', key, newPresences);
        });

        presenceChannel.on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: unknown[] }) => {
          console.log('User left:', key, leftPresences);
        });

        // Subscribe to channel
        presenceChannel.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            // Track user presence
            await presenceChannel.track({
              user_id: user.id,
              display_name: profile?.display_name || user.email?.split('@')[0] || t.participantsExtra.userFallbackName,
              avatar_url: profile?.avatar_url,
              email: profile?.email || user.email,
              online_at: new Date().toISOString(),
            });
          }
        });

      } catch (error) {
        console.error('Error setting up presence:', error);
      }
    };

    setupPresence();

    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, []);

  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, totalOnline - maxVisible);

  if (totalOnline === 0) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Users className="h-4 w-4" />
        <span className="text-sm">{t.chatsExtra.onlineCount.replace('{count}', '0')}</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <Users className="h-4 w-4 text-muted-foreground" />
        
        <div className="flex items-center gap-1">
          {visibleUsers.map((user) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger>
                <Avatar className="h-6 w-6 border-2 border-primary/20">
                  <AvatarImage src={user.avatar_url} alt={user.display_name} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {getUserInitials(user.display_name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                {user.display_name} ({t.participantsExtra.online})
              </TooltipContent>
            </Tooltip>
          ))}
          
          {remainingCount > 0 && (
            <Badge variant="secondary" className="h-6 px-2 text-xs">
              +{remainingCount}
            </Badge>
          )}
        </div>
        
        <span className="text-sm text-muted-foreground">
          {t.chatsExtra.onlineCount.replace('{count}', String(totalOnline))}
        </span>
      </div>
    </TooltipProvider>
  );
};

const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};