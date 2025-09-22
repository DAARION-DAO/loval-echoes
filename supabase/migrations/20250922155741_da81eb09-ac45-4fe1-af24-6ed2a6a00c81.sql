-- Create some test chats and their participants
-- First, let's create test chats for any existing user
INSERT INTO conversations (name) VALUES 
('Обсуждение проекта'),
('Технические вопросы'),
('Планирование встречи'),
('Общие вопросы'),
('Рабочий чат');

-- Now add participants for each conversation for all existing users
INSERT INTO conversation_participants (conversation_id, user_id, role)
SELECT c.id, u.id, 'owner'
FROM conversations c
CROSS JOIN auth.users u
WHERE c.name IN ('Обсуждение проекта', 'Технические вопросы', 'Планирование встречи', 'Общие вопросы', 'Рабочий чат');