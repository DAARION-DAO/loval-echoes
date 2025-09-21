-- Enable full replica identity for messages table for complete row data in realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;