-- Enable full replica identity for news_notifications to ensure realtime updates include all columns
ALTER TABLE public.news_notifications REPLICA IDENTITY FULL;