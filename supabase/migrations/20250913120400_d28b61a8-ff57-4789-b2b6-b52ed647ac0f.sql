-- Add is_archived column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT FALSE;