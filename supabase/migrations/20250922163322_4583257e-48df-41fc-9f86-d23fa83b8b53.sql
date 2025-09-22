-- Исправляем отсутствующий внешний ключ в user_approval_requests
-- Добавляем внешний ключ к таблице profiles для JOIN запросов
ALTER TABLE user_approval_requests
ADD CONSTRAINT fk_user_approval_requests_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;