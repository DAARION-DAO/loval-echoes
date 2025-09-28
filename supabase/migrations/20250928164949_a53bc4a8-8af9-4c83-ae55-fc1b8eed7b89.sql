-- Create refresh_tokens table for secure session management
CREATE TABLE public.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_id TEXT,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON public.refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON public.refresh_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for refresh_tokens (admin only access)
CREATE POLICY "Admin can manage refresh tokens" ON public.refresh_tokens
FOR ALL USING (public.is_admin(auth.uid()));

-- Function to cleanup expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_refresh_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.refresh_tokens 
  WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
END;
$$;

-- Function to revoke user tokens (for logout)
CREATE OR REPLACE FUNCTION public.revoke_user_refresh_tokens(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.refresh_tokens 
  SET revoked_at = NOW()
  WHERE user_id = p_user_id AND revoked_at IS NULL;
END;
$$;