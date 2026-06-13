-- Sprint F3 — Identity & Crypto Subscription Foundation
-- LOCAL MIGRATION ONLY — DO NOT APPLY REMOTELY FROM ANTIGRAVITY
--
-- Adds identity fields to profiles (wallet, telegram)
-- Creates subscription and payment intent tables for crypto-first billing

-- ============================================================
-- 1. Identity columns on profiles
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_verified_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_username text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_user_id text;

-- access_tier may already exist if added via invitation_codes flow;
-- safe to add if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'access_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN access_tier text DEFAULT 'free';
  END IF;
END $$;

-- ============================================================
-- 2. MicroDAO Subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS microdao_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'leader',
  status text NOT NULL DEFAULT 'none',
  -- status: none | pending_payment | active | past_due | expired | cancelled | manual_review | founder_bypass | guardian_bypass
  price_usd numeric(10,2) DEFAULT 20.00,
  price_daar numeric(10,4) DEFAULT 2.0,
  accepted_assets text[] DEFAULT ARRAY['DAAR','USDT','USDC','ETH'],
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for quick lookup by community
CREATE INDEX IF NOT EXISTS idx_microdao_subscriptions_community
  ON microdao_subscriptions(community_id);

-- Index for owner lookups
CREATE INDEX IF NOT EXISTS idx_microdao_subscriptions_owner
  ON microdao_subscriptions(owner_user_id);

-- ============================================================
-- 3. Crypto Payment Intents
-- ============================================================

CREATE TABLE IF NOT EXISTS crypto_payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES microdao_subscriptions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  amount_usd numeric(10,2),
  amount_crypto numeric(18,8),
  crypto_asset text NOT NULL,
  chain text DEFAULT 'ethereum',
  wallet_from text,
  wallet_to text,
  tx_hash text,
  status text NOT NULL DEFAULT 'pending',
  -- status: pending | submitted | confirmed | failed | expired
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  expires_at timestamptz
);

-- Index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_crypto_payment_intents_subscription
  ON crypto_payment_intents(subscription_id);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_crypto_payment_intents_user
  ON crypto_payment_intents(user_id);

-- ============================================================
-- 4. RLS Policies
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE microdao_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_payment_intents ENABLE ROW LEVEL SECURITY;

-- Subscriptions: owner can read their own
CREATE POLICY "Users can view own subscriptions"
  ON microdao_subscriptions FOR SELECT
  USING (owner_user_id = auth.uid());

-- Subscriptions: guardians can read all
CREATE POLICY "Guardians can view all subscriptions"
  ON microdao_subscriptions FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Payment intents: user can read their own
CREATE POLICY "Users can view own payment intents"
  ON crypto_payment_intents FOR SELECT
  USING (user_id = auth.uid());

-- Payment intents: guardians can read all
CREATE POLICY "Guardians can view all payment intents"
  ON crypto_payment_intents FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================================
-- 5. Admin RPCs for subscription overview
-- ============================================================

CREATE OR REPLACE FUNCTION admin_get_subscription_stats()
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
    'total', (SELECT count(*) FROM microdao_subscriptions),
    'active', (SELECT count(*) FROM microdao_subscriptions WHERE status = 'active'),
    'pending_payment', (SELECT count(*) FROM microdao_subscriptions WHERE status = 'pending_payment'),
    'past_due', (SELECT count(*) FROM microdao_subscriptions WHERE status = 'past_due'),
    'expired', (SELECT count(*) FROM microdao_subscriptions WHERE status = 'expired'),
    'cancelled', (SELECT count(*) FROM microdao_subscriptions WHERE status = 'cancelled'),
    'founder_bypass', (SELECT count(*) FROM microdao_subscriptions WHERE status = 'founder_bypass'),
    'guardian_bypass', (SELECT count(*) FROM microdao_subscriptions WHERE status = 'guardian_bypass'),
    'manual_review', (SELECT count(*) FROM microdao_subscriptions WHERE status = 'manual_review'),
    'none', (SELECT count(*) FROM microdao_subscriptions WHERE status = 'none')
  );
END;
$$;
