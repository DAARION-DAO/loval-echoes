// Service Worker для push-уведомлений
const CACHE_NAME = 'zhos-push-v1';

// Обработка установки
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  self.skipWaiting();
});

// Обработка активации
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Очистка старых кешей
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
    ])
  );
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  try {
    const data = event.data?.json() || {};
    const { title, body, icon, badge, url, tag, data: customData } = data;

    const options = {
      body: body || 'Новое уведомление',
      icon: icon || '/favicon.ico',
      badge: badge || '/favicon.ico',
      tag: tag || 'default',
      data: {
        url: url || '/',
        customData,
      },
      requireInteraction: false,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    };

    event.waitUntil(
      self.registration.showNotification(title || '📢 Новое сообщение', options)
    );
  } catch (error) {
    console.error('[SW] Error processing push notification:', error);
    
    // Показываем fallback уведомление
    event.waitUntil(
      self.registration.showNotification('Новое уведомление', {
        body: 'У вас новое сообщение',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      })
    );
  }
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Проверяем, есть ли уже открытое окно
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Если нет, открываем новое окно
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Обработка закрытия уведомлений
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker script loaded');