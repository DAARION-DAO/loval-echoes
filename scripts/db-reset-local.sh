#!/bin/bash
# Local DB reset script that temporarily patches the broken historical migration syntax to allow bootstrap

set -e

MIGRATION_FILE="supabase/migrations/20250923141017_15054eb8-92ab-4586-862f-44d5d3ab5042.sql"

if [ -f "$MIGRATION_FILE" ]; then
    echo "🔧 Temporarily patching broken syntax in $MIGRATION_FILE..."
    # Backup original file
    cp "$MIGRATION_FILE" "$MIGRATION_FILE.bak"

    # Replace the invalid RLS OLD/NEW syntax with valid syntax
    sed -i '' 's/(is_moderator(auth.uid()) AND OLD.approval_status != NEW.approval_status)/is_moderator(auth.uid())/g' "$MIGRATION_FILE"
fi

echo "🔄 Running supabase db reset..."
npx supabase db reset

if [ -f "$MIGRATION_FILE.bak" ]; then
    echo "🧹 Restoring original $MIGRATION_FILE..."
    mv "$MIGRATION_FILE.bak" "$MIGRATION_FILE"
fi

echo "✅ Local database reset completed successfully!"
