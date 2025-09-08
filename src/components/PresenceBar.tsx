import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'idle' | 'offline';
}

interface PresenceBarProps {
  users: PresenceUser[];
  totalUsers: number;
  maxVisible?: number;
  className?: string;
}

export const PresenceBar = ({ 
  users, 
  totalUsers, 
  maxVisible = 3,
  className = '' 
}: PresenceBarProps) => {
  const { t } = useTranslation();
  
  const onlineUsers = users.filter(user => user.status === 'online');
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, onlineUsers.length - maxVisible);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex items-center justify-between p-3 bg-muted/30 rounded-lg border ${className}`}>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {t.online}
        </span>
        <Badge variant="secondary" className="text-xs">
          {onlineUsers.length}/{totalUsers}
        </Badge>
      </div>

      <div className="flex items-center -space-x-2">
        {visibleUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-background hover:z-10 transition-all">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-background ${getStatusColor(user.status)}`}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border-2 border-background text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ещё {remainingCount} участников онлайн</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};