-- Create default "разработка ЖОС" project
INSERT INTO public.conversations (id, name, description, is_group_chat, user_id, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'разработка ЖОС',
  'Основной проект по разработке живой операционной системы',
  true,
  null,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Add all approved users as participants to the default project
INSERT INTO public.conversation_participants (conversation_id, user_id, role)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  p.user_id,
  CASE 
    WHEN p.created_at = (SELECT MIN(p2.created_at) FROM profiles p2 WHERE p2.approval_status = 'approved') THEN 'admin'
    ELSE 'member'
  END
FROM public.profiles p 
WHERE p.approval_status = 'approved'
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Create some initial kanban cards for the project
INSERT INTO public.kanban_cards (project_id, title, description, column_type, position, created_by)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Настройка аутентификации', 'Исправить проблемы с входом в систему', 'progress', 0, (SELECT user_id FROM profiles WHERE approval_status = 'approved' ORDER BY created_at LIMIT 1)),
  ('00000000-0000-0000-0000-000000000001', 'Kanban доска', 'Реализовать полнофункциональную Kanban доску', 'done', 0, (SELECT user_id FROM profiles WHERE approval_status = 'approved' ORDER BY created_at LIMIT 1)),
  ('00000000-0000-0000-0000-000000000001', 'Web3 интеграция', 'Добавить DAAR/DAARION токены для наград', 'backlog', 0, (SELECT user_id FROM profiles WHERE approval_status = 'approved' ORDER BY created_at LIMIT 1)),
  ('00000000-0000-0000-0000-000000000001', 'Мультисиг подписи', 'Интеграция с MetaMask для назначения исполнителей', 'backlog', 1, (SELECT user_id FROM profiles WHERE approval_status = 'approved' ORDER BY created_at LIMIT 1)),
  ('00000000-0000-0000-0000-000000000001', 'Оптимизация UI/UX', 'Улучшить пользовательский интерфейс', 'todo', 0, (SELECT user_id FROM profiles WHERE approval_status = 'approved' ORDER BY created_at LIMIT 1))
ON CONFLICT (id) DO NOTHING;