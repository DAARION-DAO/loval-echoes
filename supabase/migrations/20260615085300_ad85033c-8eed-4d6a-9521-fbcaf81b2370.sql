CREATE OR REPLACE FUNCTION public.admin_approve_crypto_payment_intent(intent_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_sub_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: platform admin role required';
  END IF;

  SELECT subscription_id INTO v_sub_id
  FROM public.crypto_payment_intents
  WHERE id = intent_id;

  UPDATE public.crypto_payment_intents
  SET status = 'confirmed', confirmed_at = now()
  WHERE id = intent_id;

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

CREATE OR REPLACE FUNCTION public.admin_reject_crypto_payment_intent(intent_id uuid, reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_sub_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: platform admin role required';
  END IF;

  SELECT subscription_id INTO v_sub_id
  FROM public.crypto_payment_intents
  WHERE id = intent_id;

  UPDATE public.crypto_payment_intents
  SET status = 'rejected'
  WHERE id = intent_id;

  IF v_sub_id IS NOT NULL THEN
    UPDATE public.microdao_subscriptions
    SET status = 'cancelled', updated_at = now()
    WHERE id = v_sub_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_approve_crypto_payment_intent(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_crypto_payment_intent(uuid, text) TO authenticated;

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.microdao_subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON public.microdao_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can insert own payment intents" ON public.crypto_payment_intents;
CREATE POLICY "Users can insert own payment intents"
  ON public.crypto_payment_intents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payment intents" ON public.crypto_payment_intents;
CREATE POLICY "Users can update own payment intents"
  ON public.crypto_payment_intents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);