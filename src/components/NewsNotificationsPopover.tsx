import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNewsNotifications } from '@/hooks/useNewsNotifications';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';

export const NewsNotificationsPopover = () => {
  const { t, language } = useTranslation();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    pushEnabled,
    requestPushPermission 
  } = useNewsNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (newsId: string, notificationId: string) => {
    markAsRead(notificationId);
    navigate('/news');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.notifications.justNow;
    if (diffMins < 60) return t.notifications.minsAgo.replace('{count}', String(diffMins));
    if (diffHours < 24) return t.notifications.hoursAgo.replace('{count}', String(diffHours));
    if (diffDays < 7) return t.notifications.daysAgo.replace('{count}', String(diffDays));
    
    const dateLocale = language === 'uk' ? 'uk-UA' : language === 'es' ? 'es-ES' : language === 'ru' ? 'ru-RU' : 'en-US';
    return date.toLocaleDateString(dateLocale);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col gap-2 p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t.notifications.title}</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7"
              >
                {t.notifications.markAllAsRead}
              </Button>
            )}
          </div>
          
          {/* Push notification toggle */}
          {!pushEnabled && 'Notification' in window && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestPushPermission}
              className="w-full text-xs"
            >
              <Bell className="h-3 w-3 mr-2" />
              {t.notifications.enablePush}
            </Button>
          )}
          
          {pushEnabled && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {t.notifications.pushEnabled}
            </div>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t.notifications.noNotifications}
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.news_id, notification.id)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex gap-2">
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
