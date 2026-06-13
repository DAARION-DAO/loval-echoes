import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useTranslation } from '@/lib/i18n';

interface PushNotificationSettings {
  news_enabled: boolean;
  chat_notifications: string[]; // Array of chat IDs
}

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<PushNotificationSettings>({
    news_enabled: true,
    chat_notifications: [],
  });

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

  // Register Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration.scope);
      
      await navigator.serviceWorker.ready;
      setServiceWorkerReady(true);
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration error:', error);
      return null;
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (registration: ServiceWorkerRegistration) => {
    if (!user) return false;

    try {
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

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
      return true;
    } catch (error: unknown) {
      console.error('Push subscription error:', error);
      return false;
    }
  }, [user]);

  // Автоматический запрос разрешения при первом загрузке
  const requestPermissionAutomatically = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    // Проверяем, запрашивали ли мы уже разрешение
    const hasRequestedBefore = localStorage.getItem('push-permission-requested') === 'true';
    
    // Если разрешение уже запрошено или отклонено, не запрашиваем снова
    if (hasRequestedBefore || Notification.permission !== 'default') {
      setPermissionStatus(Notification.permission);
      return Notification.permission === 'granted';
    }

    try {
      // Показываем дружелюбное сообщение перед запросом
      const shouldRequest = await new Promise<boolean>((resolve) => {
        // Можно показать toast или модальное окно
        // Для автоматического запроса просто разрешаем
        setTimeout(() => resolve(true), 1000); // Небольшая задержка для UX
      });

      if (!shouldRequest) return false;

      // Запрашиваем разрешение
      const permission = await Notification.requestPermission();
      localStorage.setItem('push-permission-requested', 'true');
      setPermissionStatus(permission);

      if (permission === 'granted') {
        const registration = await registerServiceWorker();
        if (registration) {
          await subscribeToPush(registration);
          toast({
            title: t.pushNotifications.enabledTitle,
            description: t.pushNotifications.enabledTabDesc,
          });
          return true;
        }
      } else if (permission === 'denied') {
        toast({
          title: t.pushNotifications.permissionDeniedTitle,
          description: t.pushNotifications.permissionDeniedDesc,
          variant: 'destructive',
        });
      }

      return false;
    } catch (error: unknown) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [registerServiceWorker, subscribeToPush, toast, t]);

  // Ручной запрос разрешения
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: t.pushNotifications.notSupportedTitle,
        description: t.pushNotifications.notSupportedDesc,
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem('push-permission-requested', 'true');
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        toast({
          title: t.pushNotifications.permissionDeniedTitle,
          description: t.pushNotifications.permissionDeniedDesc,
          variant: 'destructive',
        });
        return false;
      }

      const registration = await registerServiceWorker();
      if (!registration) {
        toast({
          title: t.pushNotifications.swRegistrationFailedTitle,
          description: t.pushNotifications.swRegistrationFailedDesc,
          variant: 'destructive',
        });
        return false;
      }

      const success = await subscribeToPush(registration);
      if (success) {
        toast({
          title: t.pushNotifications.enabledTitle,
          description: t.pushNotifications.enabledDesc,
        });
      }
      return success;
    } catch (error: unknown) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: t.pushNotifications.disabledTitle,
        description: t.pushNotifications.disabledDesc,
        variant: 'destructive',
      });
      return false;
    }
  }, [registerServiceWorker, subscribeToPush, toast, t]);

  // Загрузка настроек push-уведомлений (localStorage)
  const loadSettings = useCallback(async () => {
    if (!user) return;

    try {
      const saved = localStorage.getItem(`push_settings_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved) as PushNotificationSettings;
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Error loading push settings:', error);
    }
  }, [user]);

  // Сохранение настроек (localStorage)
  const saveSettings = useCallback(async (newSettings: Partial<PushNotificationSettings>) => {
    if (!user) return false;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      localStorage.setItem(`push_settings_${user.id}`, JSON.stringify(updatedSettings));

      setSettings(updatedSettings);
      toast({
        title: t.pushNotifications.settingsSavedTitle,
        description: t.pushNotifications.settingsSavedDesc,
      });
      return true;
    } catch (error) {
      console.error('Error saving push settings:', error);
      toast({
        title: t.pushNotifications.settingsSaveFailedTitle,
        description: t.pushNotifications.settingsSaveFailedDesc,
        variant: 'destructive',
      });
      return false;
    }
  }, [user, settings, toast, t]);

  // Инициализация при загрузке
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      // Регистрируем Service Worker
      await registerServiceWorker();

      // Проверяем текущий статус разрешения
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
        
        if (Notification.permission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setPushEnabled(!!subscription);
        } else if (Notification.permission === 'default') {
          // Автоматически запрашиваем разрешение при первом загрузке
          await requestPermissionAutomatically();
        }
      }

      // Загружаем настройки
      await loadSettings();
    };

    init();
  }, [user, registerServiceWorker, requestPermissionAutomatically, loadSettings]);

  return {
    pushEnabled,
    permissionStatus,
    serviceWorkerReady,
    settings,
    requestPermission,
    saveSettings,
    loadSettings,
  };
}


