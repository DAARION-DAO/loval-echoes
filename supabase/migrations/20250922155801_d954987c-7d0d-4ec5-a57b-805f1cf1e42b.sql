-- Create test chats with proper role values
-- First delete any test data if it exists
DELETE FROM conversation_participants WHERE conversation_id IN (
  SELECT id FROM conversations WHERE name IN ('Обсуждение проекта', 'Технические вопросы', 'Планирование встречи', 'Общие вопросы', 'Рабочий чат')
);
DELETE FROM conversations WHERE name IN ('Обсуждение проекта', 'Технические вопросы', 'Планирование встречи', 'Общие вопросы', 'Рабочий чат');

-- Create test conversations
INSERT INTO conversations (name) VALUES 
('Обсуждение проекта'),
('Технические вопросы'),
('Планирование встречи'),
('Общие вопросы'),
('Рабочий чат');

-- Add participants with 'member' role (which should be valid based on the default)
INSERT INTO conversation_participants (conversation_id, user_id, role)
SELECT c.id, u.id, 'member'
FROM conversations c
CROSS JOIN auth.users u
WHERE c.name IN ('Обсуждение проекта', 'Технические вопросы', 'Планирование встречи', 'Общие вопросы', 'Рабочий чат');