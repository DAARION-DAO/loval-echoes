-- local migration only, do not apply remotely from Antigravity

-- 1. Create admin approval RPC
CREATE OR REPLACE FUNCTION public.admin_approve_crypto_payment_intent(intent_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_sub_id uuid;
BEGIN
  -- Security Check
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: platform admin role required';
  END IF;

  -- Get the linked subscription ID
  SELECT subscription_id INTO v_sub_id
  FROM public.crypto_payment_intents
  WHERE id = intent_id;

  -- Update payment intent status
  UPDATE public.crypto_payment_intents
  SET status = 'confirmed',
      confirmed_at = now()
  WHERE id = intent_id;

  -- Update subscription status if exists
  IF v_sub_id IS NOT NULL THEN
    UPDATE public.microdao_subscriptions
    SET status = 'active',
        current_period_start = now(),
        current_period_end = now() + interval '1 month',
        updated_at = now()
    WHERE id = v_sub_id;
  END IF;
END;
$$;

-- 2. Create admin rejection RPC
CREATE OR REPLACE FUNCTION public.admin_reject_crypto_payment_intent(intent_id uuid, reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_sub_id uuid;
BEGIN
  -- Security Check
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: platform admin role required';
  END IF;

  -- Get the linked subscription ID
  SELECT subscription_id INTO v_sub_id
  FROM public.crypto_payment_intents
  WHERE id = intent_id;

  -- Update payment intent status
  UPDATE public.crypto_payment_intents
  SET status = 'rejected'
  WHERE id = intent_id;

  -- Update subscription status if exists
  IF v_sub_id IS NOT NULL THEN
    UPDATE public.microdao_subscriptions
    SET status = 'cancelled',
        updated_at = now()
    WHERE id = v_sub_id;
  END IF;
END;
$$;

-- 3. Grants for functions
GRANT EXECUTE ON FUNCTION public.admin_approve_crypto_payment_intent(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_crypto_payment_intent(uuid, text) TO authenticated;

-- 4. Additional RLS Policies for user flows
-- RLS policies for microdao_subscriptions insert
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.microdao_subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON public.microdao_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

-- RLS policies for crypto_payment_intents insert
DROP POLICY IF EXISTS "Users can insert own payment intents" ON public.crypto_payment_intents;
CREATE POLICY "Users can insert own payment intents"
  ON public.crypto_payment_intents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for crypto_payment_intents update (for users to submit tx_hash)
DROP POLICY IF EXISTS "Users can update own payment intents" ON public.crypto_payment_intents;
CREATE POLICY "Users can update own payment intents"
  ON public.crypto_payment_intents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
