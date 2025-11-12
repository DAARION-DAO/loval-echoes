#!/bin/bash

# Скрипт для застосування всіх міграцій до Supabase
# Використання: ./scripts/apply-migrations.sh

set -e

echo "🚀 Застосування міграцій до Supabase..."
echo ""

# Перевірка чи встановлено Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Помилка: Supabase CLI не встановлено"
    echo "Встановіть через: npm install -g supabase"
    exit 1
fi

# Перевірка чи є файл .env з SUPABASE_URL та SUPABASE_ACCESS_TOKEN
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo "⚠️  Попередження: Файл .env не знайдено"
    echo "Переконайтеся що SUPABASE_URL та SUPABASE_ACCESS_TOKEN встановлені"
fi

# Список міграцій в порядку застосування
MIGRATIONS=(
    "supabase/migrations/add_scope_to_conversations.sql"
    "supabase/migrations/add_scope_to_agents_and_files.sql"
    "supabase/migrations/create_user_integrations.sql"
    "supabase/migrations/add_scope_to_integrations.sql"
    "supabase/migrations/create_push_notification_settings.sql"
)

# Перевірка наявності файлів
echo "📋 Перевірка наявності міграцій..."
for migration in "${MIGRATIONS[@]}"; do
    if [ ! -f "$migration" ]; then
        echo "❌ Файл не знайдено: $migration"
        exit 1
    fi
    echo "✅ $migration"
done

echo ""
echo "📦 Застосування міграцій..."

# Варіант 1: Використання Supabase CLI (якщо підключено до проекту)
if supabase projects list &> /dev/null; then
    echo "Використовуємо Supabase CLI для застосування міграцій..."
    supabase db push
    echo "✅ Міграції застосовано через Supabase CLI"
else
    echo "⚠️  Supabase CLI не підключено до проекту"
    echo ""
    echo "📝 Інструкції для ручного застосування:"
    echo ""
    echo "1. Відкрийте Supabase Dashboard: https://supabase.com/dashboard"
    echo "2. Виберіть ваш проект"
    echo "3. Перейдіть в SQL Editor"
    echo "4. Скопіюйте та виконайте кожну міграцію в порядку:"
    echo ""
    for i in "${!MIGRATIONS[@]}"; do
        echo "   $((i+1)). ${MIGRATIONS[$i]}"
    done
    echo ""
    echo "АБО використайте psql напряму:"
    echo ""
    echo "psql -h <your-db-host> -U postgres -d postgres -f <migration-file>"
fi

echo ""
echo "✨ Готово!"

