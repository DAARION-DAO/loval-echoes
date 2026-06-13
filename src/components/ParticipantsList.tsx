import { useState, useEffect } from 'react';
import { Users, User, Circle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();
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

      const participantsList: Participant[] = (participantData || []).map(p => {
        const profile = p.profiles as { display_name?: string; avatar_url?: string } | null;
        const fallbackName = t.participantsExtra.userFallbackName;
        return {
          user_id: p.user_id,
          display_name: profile?.display_name || fallbackName,
          avatar_url: profile?.avatar_url,
          isOnline: onlineUsers.includes(profile?.display_name || fallbackName),
        };
      });

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
        <Button 
          variant="ghost" 
          size="sm" 
          className="touch-target h-10 px-3 flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">{t.participantsExtra.triggerButton}</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            <span className="text-xs">{onlineCount}/{totalCount}</span>
          </Badge>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[90vw] sm:w-[400px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            {t.participantsExtra.pageTitle}
          </SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t.participantsExtra.onlineCountDesc.replace('{online}', String(onlineCount)).replace('{total}', String(totalCount))}
          </p>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{t.participantsExtra.loadingText}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Online users first */}
                  {participants.filter(p => p.isOnline).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">
                        {t.participantsExtra.onlineHeader.replace('{count}', String(participants.filter(p => p.isOnline).length))}
                      </h3>
                      <div className="space-y-3">
                        {participants.filter(p => p.isOnline).map((participant) => (
                          <div
                            key={participant.user_id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors touch-target"
                          >
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={participant.avatar_url} />
                                <AvatarFallback className="text-sm bg-primary/10">
                                  {participant.display_name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{participant.display_name}</p>
                              <p className="text-xs text-green-600">{t.participantsExtra.online}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Offline users */}
                  {participants.filter(p => !p.isOnline).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">
                        {t.participantsExtra.offlineHeader.replace('{count}', String(participants.filter(p => !p.isOnline).length))}
                      </h3>
                      <div className="space-y-3">
                        {participants.filter(p => !p.isOnline).map((participant) => (
                          <div
                            key={participant.user_id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors opacity-70 touch-target"
                          >
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={participant.avatar_url} />
                                <AvatarFallback className="text-sm bg-muted/50">
                                  {participant.display_name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-muted border-2 border-background rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{participant.display_name}</p>
                              <p className="text-xs text-muted-foreground">{t.participantsExtra.notInNetwork}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {participants.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">{t.participantsExtra.noParticipants}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};