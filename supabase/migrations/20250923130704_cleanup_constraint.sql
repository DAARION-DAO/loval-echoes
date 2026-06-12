-- Injected helper to drop constraint before it is added again in 20250923130705
ALTER TABLE public.user_approval_requests DROP CONSTRAINT IF EXISTS fk_user_approval_requests_user_id;
