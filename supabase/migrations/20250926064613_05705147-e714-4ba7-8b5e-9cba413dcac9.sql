-- Create news feed table
CREATE TABLE public.news_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_agent boolean DEFAULT false,
  reply_to_id uuid REFERENCES news_feed(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on news_feed
ALTER TABLE public.news_feed ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all news feed messages
CREATE POLICY "Authenticated users can view news feed" 
ON public.news_feed 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert their own messages
CREATE POLICY "Users can insert their own news feed messages" 
ON public.news_feed 
FOR INSERT 
WITH CHECK (auth.uid() = author_id OR is_agent = true);

-- Add news push settings to profiles
ALTER TABLE public.profiles 
ADD COLUMN news_push_enabled boolean DEFAULT true;

-- Add trigger for updated_at
CREATE TRIGGER update_news_feed_updated_at
BEFORE UPDATE ON public.news_feed
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for news_feed table
ALTER publication supabase_realtime ADD TABLE public.news_feed;