import { useState, useEffect } from 'react';
import { Users, User, Circle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';

interface Participant {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  isOnline?: boolean;
}

interface ParticipantsListProps {
  chatId: string;
  onlineUsers: string[];
}

export const ParticipantsList = ({ chatId, onlineUsers }: ParticipantsListProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipants();
  }, [chatId]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      
      // Get all participants for this conversation
      const { data: participantData, error } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('conversation_id', chatId);

      if (error) {
        console.error('Error loading participants:', error);
        return;
      }

      const participantsList: Participant[] = (participantData || []).map(p => ({
        user_id: p.user_id,
        display_name: (p.profiles as any)?.display_name || 'Участник',
        avatar_url: (p.profiles as any)?.avatar_url,
        isOnline: onlineUsers.includes((p.profiles as any)?.display_name || 'Участник'),
      }));

      setParticipants(participantsList);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update online status when onlineUsers change
  useEffect(() => {
    setParticipants(prev => 
      prev.map(p => ({
        ...p,
        isOnline: onlineUsers.includes(p.display_name),
      }))
    );
  }, [onlineUsers]);

  const onlineCount = participants.filter(p => p.isOnline).length;
  const totalCount = participants.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <Badge variant="secondary" className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            {onlineCount}/{totalCount}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Участники чата
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {onlineCount} из {totalCount} онлайн
            </span>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                </div>
              ) : (
                <>
                  {/* Online users first */}
                  {participants.filter(p => p.isOnline).map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <Circle className="h-3 w-3 fill-green-500 text-green-500 absolute -bottom-0.5 -right-0.5 bg-background rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.display_name}</p>
                        <p className="text-xs text-green-600">онлайн</p>
                      </div>
                    </div>
                  ))}

                  {/* Offline users */}
                  {participants.filter(p => !p.isOnline).map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 opacity-60"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <Circle className="h-3 w-3 fill-muted-foreground text-muted-foreground absolute -bottom-0.5 -right-0.5 bg-background rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.display_name}</p>
                        <p className="text-xs text-muted-foreground">не в сети</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};