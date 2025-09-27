-- Add project type and docs folder to conversations table
ALTER TABLE public.conversations
  ADD COLUMN type text CHECK (type IN ('chat','project')) DEFAULT 'chat',
  ADD COLUMN docs_folder_id uuid;

-- Update existing "разработка ЖОС" conversation to be a project
UPDATE public.conversations 
SET type = 'project' 
WHERE id = '00000000-0000-0000-0000-000000000001';