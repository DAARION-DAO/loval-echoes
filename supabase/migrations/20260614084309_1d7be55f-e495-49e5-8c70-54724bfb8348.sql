ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_verified_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_user_id text;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'access_tier'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN access_tier text DEFAULT 'free';
  END IF;
END $$;

-- Allow users to update their new identity columns (existing column-level GRANT on profiles is restrictive)
GRANT UPDATE (wallet_address, wallet_verified_at, telegram_username, telegram_user_id) ON public.profiles TO authenticated;

CREATE TABLE IF NOT EXISTS public.microdao_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'leader',
  status text NOT NULL DEFAULT 'none',
  price_usd numeric(10,2) DEFAULT 20.00,
  price_daar numeric(10,4) DEFAULT 2.0,
  accepted_assets text[] DEFAULT ARRAY['DAAR','USDT','USDC','ETH'],
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.microdao_subscriptions TO authenticated;
GRANT ALL ON public.microdao_subscriptions TO service_role;

CREATE INDEX IF NOT EXISTS idx_microdao_subscriptions_community ON public.microdao_subscriptions(community_id);
CREATE INDEX IF NOT EXISTS idx_microdao_subscriptions_owner ON public.microdao_subscriptions(owner_user_id);

CREATE TABLE IF NOT EXISTS public.crypto_payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.microdao_subscriptions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  amount_usd numeric(10,2),
  amount_crypto numeric(18,8),
  crypto_asset text NOT NULL,
  chain text DEFAULT 'ethereum',
  wallet_from text,
  wallet_to text,
  tx_hash text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  expires_at timestamptz
);

GRANT SELECT, INSERT ON public.crypto_payment_intents TO authenticated;
GRANT ALL ON public.crypto_payment_intents TO service_role;

CREATE INDEX IF NOT EXISTS idx_crypto_payment_intents_subscription ON public.crypto_payment_intents(subscription_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payment_intents_user ON public.crypto_payment_intents(user_id);

ALTER TABLE public.microdao_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_payment_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.microdao_subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.microdao_subscriptions FOR SELECT
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Guardians can view all subscriptions" ON public.microdao_subscriptions;
CREATE POLICY "Guardians can view all subscriptions"
  ON public.microdao_subscriptions FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own payment intents" ON public.crypto_payment_intents;
CREATE POLICY "Users can view own payment intents"
  ON public.crypto_payment_intents FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Guardians can view all payment intents" ON public.crypto_payment_intents;
CREATE POLICY "Guardians can view all payment intents"
  ON public.crypto_payment_intents FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.admin_get_subscription_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: guardian role required';
  END IF;
  RETURN json_build_object(
    'total', (SELECT count(*) FROM public.microdao_subscriptions),
    'active', (SELECT count(*) FROM public.microdao_subscriptions WHERE status = 'active'),
    'pending_payment', (SELECT count(*) FROM public.microdao_subscriptions WHERE status = 'pending_payment'),
    'past_due', (SELECT count(*) FROM public.microdao_subscriptions WHERE status = 'past_due'),
    'expired', (SELECT count(*) FROM public.microdao_subscriptions WHERE status = 'expired'),
    'cancelled', (SELECT count(*) FROM public.microdao_subscriptions WHERE status = 'cancelled'),
    'founder_bypass', (SELECT count(*) FROM public.microdao_subscriptions WHERE status = 'founder_bypass'),
    'guardian_bypass', (SELECT count(*) FROM public.microdao_subscriptions WHERE status = 'guardian_bypass'),
    'manual_review', (SELECT count(*) FROM public.microdao_subscriptions WHERE status = 'manual_review'),
    'none', (SELECT count(*) FROM public.microdao_subscriptions WHERE status = 'none')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_subscription_stats() TO authenticated;