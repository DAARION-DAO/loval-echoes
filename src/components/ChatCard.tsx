import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  MessageSquare, 
  Clock, 
  Pin, 
  GitBranch,
  Edit2,
  Trash2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ru, uk, es, enUS } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n';
import { Chat } from '@/utils/difyClient';
import { NavLink } from 'react-router-dom';

interface ChatCardProps {
  chat: Chat;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  className?: string;
}

export const ChatCard = ({ 
  chat, 
  onRename, 
  onDelete, 
  onPin, 
  className = '' 
}: ChatCardProps) => {
  const { t, language } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const locales: Record<string, any> = { ru, uk, es, en: enUS };
      const locale = locales[language] || enUS;
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale 
      });
    } catch {
      return '';
    }
  };

  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <NavLink 
            to={`/chats/${chat.id}`} 
            className="flex-1 min-w-0 space-y-2"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate hover:text-primary transition-colors">
                {chat.name}
              </h3>
              {chat.forked_from_chat && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  <GitBranch className="h-3 w-3" />
                  <span>{t.branch}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(chat.updated_at)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>0</span> {/* TODO: Реальный счетчик сообщений */}
              </div>
            </div>
          </NavLink>

          {(isHovered || onRename || onDelete || onPin) && (
            <div className={`transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">{t.actions}</span>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-48">
                  {onPin && (
                    <DropdownMenuItem onClick={() => onPin(chat.id)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {chat.is_pinned ? t.chats.unpin : t.chats.pin}
                    </DropdownMenuItem>
                  )}
                  
                  {onRename && (
                    <DropdownMenuItem onClick={() => onRename(chat.id)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      {t.chats.rename}
                    </DropdownMenuItem>
                  )}
                  
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(chat.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.delete}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};