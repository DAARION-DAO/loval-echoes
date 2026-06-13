import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface NewsNotification {
  id: string;
  news_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function useNewsNotifications() {
  const [notifications, setNotifications] = useState<NewsNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Регистрация Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration.scope);
      
      // Wait until SW is active
      await navigator.serviceWorker.ready;
      setServiceWorkerReady(true);
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration error:', error);
      return null;
    }
  }, []);

  // Подписка на push-уведомления
  const subscribeToPush = useCallback(async (registration: ServiceWorkerRegistration) => {
    if (!user) return false;

    try {
      // Проверяем существующую подписку
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Создаем новую подписку
        // ВАЖНО: Здесь нужен публичный VAPID ключ
        // Для демо используем заглушку, в production нужен настоящий ключ
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // Save subscription on server
      const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);

      const { error } = await supabase.functions.invoke('push-subscribe', {
        body: {
          action: 'subscribe',
          subscription: subscription.toJSON(),
          deviceId,
        },
      });

      if (error) throw error;

      setPushEnabled(true);
      toast({
        title: t.notifications.pushEnabledTitle,
        description: t.notifications.pushEnabledDesc,
      });

      return true;
    } catch (error: unknown) {
      console.error('Push subscription error:', error);
      toast({
        title: t.notifications.enablePushErrorTitle,
        description: t.notifications.enablePushErrorDesc,
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast, t]);

  // Helper для конвертации VAPID ключа
  const urlBase64ToUint8Array = (base64String: string): BufferSource => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Request push notification permission
  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: t.notifications.notSupportedTitle,
        description: t.notifications.notSupportedDesc,
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: t.notifications.permissionDeniedTitle,
          description: t.notifications.permissionDeniedDesc,
          variant: 'destructive',
        });
        return false;
      }

      // Register Service Worker
      const registration = await registerServiceWorker();
      if (!registration) {
        toast({
          title: t.notifications.swRegisterErrorTitle,
          description: t.notifications.swRegisterErrorDesc,
          variant: 'destructive',
        });
        return false;
      }

      // Subscribe to push
      return await subscribeToPush(registration);
      
    } catch (error: unknown) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: t.notifications.generalErrorTitle,
        description: t.notifications.generalErrorDesc,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Show browser push notification
  const showPushNotification = useCallback((title: string, message: string) => {
    if (!pushEnabled || Notification.permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'news-notification',
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        navigate('/news');
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    } catch (error) {
      console.error('Error showing push notification:', error);
    }
  }, [pushEnabled, navigate]);

  // Инициализация Service Worker при загрузке
  useEffect(() => {
    const init = async () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const registration = await registerServiceWorker();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setPushEnabled(!!subscription);
        }
      }
    };
    init();
  }, [registerServiceWorker]);

  // Load notifications
  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('news_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error loading news notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const channel = supabase
      .channel(`news-notifications-realtime-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as NewsNotification;
          
          // Show browser push notification first
          showPushNotification(
            t.notifications.newUrgentMessage,
            newNotification.message
          );

          // Then show interactive toast with action button
          toast({
            title: t.notifications.newUrgentMessage,
            description: newNotification.message,
            duration: 5000,
            action: (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/news')}
              >
                {t.notifications.viewBtn}
              </Button>
            )
          });

          // Update state
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, t, toast, navigate, showPushNotification]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('news_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('news_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
    pushEnabled,
    requestPushPermission
  };
}
