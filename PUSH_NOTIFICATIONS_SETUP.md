# Настройка Push-уведомлений

Для полноценной работы push-уведомлений необходимо настроить VAPID ключи.

## Генерация VAPID ключей

### Вариант 1: Онлайн генератор
Используйте [web-push-codelab.glitch.me](https://web-push-codelab.glitch.me/) для генерации ключей.

### Вариант 2: Node.js
```bash
npm install -g web-push
web-push generate-vapid-keys
```

### Вариант 3: Python
```python
from py_vapid import Vapid

vapid = Vapid()
vapid.generate_keys()
print("Public Key:", vapid.public_key.decode('utf-8'))
print("Private Key:", vapid.private_key.decode('utf-8'))
```

## Добавление ключей в проект

1. Сгенерируйте VAPID ключи одним из способов выше
2. Добавьте переменные окружения в Supabase:
   - `VAPID_PUBLIC_KEY` - публичный ключ
   - `VAPID_PRIVATE_KEY` - приватный ключ
   - `VAPID_SUBJECT` - ваш email или URL (например: `mailto:admin@yourapp.com`)
   - `INTERNAL_API_KEY` - случайный ключ для внутренних вызовов (сгенерируйте UUID)

3. Обновите публичный ключ в `src/hooks/useNewsNotifications.tsx`:
```typescript
const vapidPublicKey = 'ВАШ_ПУБЛИЧНЫЙ_VAPID_КЛЮЧ';
```

## Проверка работы

1. Откройте приложение в браузере
2. Нажмите на иконку колокольчика
3. Разрешите уведомления
4. Создайте новость с меткой "срочно"
5. Вы должны получить push-уведомление

## Важные замечания

- Push-уведомления работают только через HTTPS
- Service Worker регистрируется автоматически
- Подписки сохраняются в таблице `push_subscriptions`
- Для отправки push используйте edge function `push-send`

## Интеграция с новостной лентой

Push-уведомления автоматически отправляются при создании новости с тегом "срочно".
Для ручной отправки используйте:

```typescript
await supabase.functions.invoke('push-send', {
  body: {
    userId: 'user-uuid',
    title: 'Заголовок',
    body: 'Текст уведомления',
    url: '/news',
    tag: 'news-notification'
  },
  headers: {
    'x-api-key': 'INTERNAL_API_KEY'
  }
});
```