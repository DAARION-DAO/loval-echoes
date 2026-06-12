# 📋 Інструкція для ручного застосування міграцій

Якщо автоматичний скрипт не працює, виконайте міграції вручну через Supabase Dashboard.

## 🔧 Порядок застосування міграцій

### 1. Відкрийте Supabase Dashboard
- Перейдіть на https://supabase.com/dashboard
- Виберіть ваш проект
- Перейдіть в **SQL Editor**

### 2. Застосуйте міграції в такому порядку:

#### ✅ Міграція 1: `add_scope_to_conversations.sql`
Додає колонку `scope` до таблиці `conversations`

#### ✅ Міграція 2: `add_scope_to_agents_and_files.sql`
Додає колонку `scope` до таблиць `agents` та `files`

#### ✅ Міграція 3: `create_user_integrations.sql`
Створює таблицю `user_integrations` для зберігання інтеграцій користувачів

#### ✅ Міграція 4: `add_scope_to_integrations.sql`
Додає колонку `scope` до таблиці `user_integrations` та оновлює constraints

#### ✅ Міграція 5: `create_push_notification_settings.sql`
Створює таблицю `push_notification_settings` для налаштувань push-сповіщень

## 📝 Як застосувати кожну міграцію:

1. Відкрийте файл міграції (наприклад, `supabase/migrations/add_scope_to_conversations.sql`)
2. Скопіюйте весь вміст файлу
3. Вставте в SQL Editor в Supabase Dashboard
4. Натисніть **Run** або **Execute**
5. Перевірте що міграція виконалась успішно (немає помилок)
6. Перейдіть до наступної міграції

## ⚠️ Важливо:

- Застосовуйте міграції **строго в порядку** (1 → 2 → 3 → 4 → 5)
- Якщо виникне помилка, перевірте чи не застосована міграція вже (наприклад, колонка вже існує)
- Деякі міграції використовують `IF NOT EXISTS`, тому їх можна запускати кілька разів безпечно

## 🔍 Перевірка після застосування:

Після застосування всіх міграцій, перевірте що:

1. ✅ Таблиця `conversations` має колонку `scope`
2. ✅ Таблиця `agents` має колонку `scope`
3. ✅ Таблиця `files` має колонку `scope`
4. ✅ Таблиця `user_integrations` існує
5. ✅ Таблиця `push_notification_settings` існує

Можете виконати ці запити в SQL Editor:

```sql
-- Перевірка колонок
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations' AND column_name = 'scope';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agents' AND column_name = 'scope';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'files' AND column_name = 'scope';

-- Перевірка таблиць
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_integrations', 'push_notification_settings');
```

## 🐛 Якщо щось пішло не так:

1. Перевірте логи в Supabase Dashboard → Logs
2. Переконайтеся що ви маєте права на виконання SQL
3. Якщо міграція вже застосована частково, можливо потрібно відкотити зміни або виправити міграцію


