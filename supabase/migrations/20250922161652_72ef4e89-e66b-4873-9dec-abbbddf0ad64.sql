-- Удаление тестовых мокап-чатов без пользователей
DELETE FROM conversation_participants WHERE conversation_id IN (
  SELECT id FROM conversations WHERE user_id IS NULL
);

DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE user_id IS NULL
);

DELETE FROM conversations WHERE user_id IS NULL;