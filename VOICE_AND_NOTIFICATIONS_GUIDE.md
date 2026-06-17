# Голосовые звонки и Push-уведомления

## 🔊 Text-to-Speech (TTS)

### Озвучивание сообщений агента
- На каждом сообщении агента есть кнопка **Play** (▶️)
- Нажмите на неё, чтобы озвучить текст
- Используется OpenAI TTS API (модель tts-1, голос alloy)

### Голосовой режим в чате
1. Нажмите кнопку "Voice Mode" в интерфейсе чата
2. Агент автоматически озвучит свои ответы
3. Нажмите кнопку Stop, чтобы остановить воспроизведение

## 🔔 Push-уведомления

### Включение уведомлений
1. Откройте настройки уведомлений.
2. Нажмите явную кнопку включения push-уведомлений.
3. Нажмите "Разрешить" в браузере.
4. Уведомления подпишутся для текущего устройства.

### Отправка срочных новостей
1. Перейдите в Новостную ленту
2. Напишите сообщение
3. Нажмите "Отправить всем" или Ctrl+Enter
4. Все пользователи получат push-уведомление

### Технические детали
- **Service Worker**: `/sw.js`
- **Подписки**: Хранятся в таблице `push_subscriptions`
- **Отправка**: Через edge function `push-send`

## 🎙️ Voice Activity Detection (VAD)

### Автоматическая отправка
- **Порог тишины**: 10 (амплитуда)
- **Длительность тишины**: 2.5 секунды
- Запись автоматически останавливается после 2.5 сек тишины
- Сообщение автоматически отправляется в Voice Mode

### Визуальная индикация
- Зелёная полоса показывает уровень звука во время записи
- Индикатор тишины появляется при низком уровне

## 🔧 Настройка Edge Functions

### TTS API
```typescript
// supabase/functions/tts-api/index.ts
// Использует OpenAI TTS API
model: 'tts-1'
voice: 'alloy'
format: 'mp3'
```

### Push Send API
```typescript
// supabase/functions/push-send/index.ts
// Принимает:
// - Внутренние вызовы (x-api-key)
// - Авторизованные вызовы (Bearer token)
```

### News Reply API
```typescript
// supabase/functions/news-reply/index.ts
// Автоматически отправляет push всем пользователям
// Вызывает push-send внутренне
```

## 📝 Примеры использования

### Отправка push-уведомления
```typescript
// Из Edge Function (внутренний вызов)
await fetch(`${SUPABASE_URL}/functions/v1/push-send`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': SUPABASE_SERVICE_ROLE_KEY,
  },
  body: JSON.stringify({
    title: '📢 Срочная новость',
    body: 'Текст уведомления',
    url: '/news',
  }),
});
```

### Озвучивание текста
```typescript
// Из компонента
const result = await difyClient.textToSpeech('Привет, мир!');
const audioBlob = new Blob(
  [Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))],
  { type: result.contentType }
);
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
await audio.play();
```

## ⚠️ Требования

### Браузер
- Push-уведомления: Chrome 50+, Firefox 44+, Safari 16+
- Web Audio API: Все современные браузеры

### Разрешения
- Микрофон (для голосовых звонков и записи)
- Уведомления (для push-уведомлений)

### Секреты Supabase
- `OPENAI_API_KEY` - для TTS
- `DIFY_API_KEY` - для агента
- `SUPABASE_SERVICE_ROLE_KEY` - для внутренних вызовов
