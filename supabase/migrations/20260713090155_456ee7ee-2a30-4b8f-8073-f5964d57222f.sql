
-- 1) crypto_payment_intents: server-side price enforcement
CREATE OR REPLACE FUNCTION public.enforce_crypto_payment_intent_pricing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan RECORD;
  v_asset TEXT;
  v_expected_crypto NUMERIC;
  v_is_service BOOLEAN := (auth.role() = 'service_role');
BEGIN
  -- Service role (edge functions) bypasses client-tamper checks
  IF v_is_service THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Disallow client-side changes to price/asset/wallet/user
    IF NEW.amount_usd IS DISTINCT FROM OLD.amount_usd
       OR NEW.amount_crypto IS DISTINCT FROM OLD.amount_crypto
       OR NEW.crypto_asset IS DISTINCT FROM OLD.crypto_asset
       OR NEW.wallet_to IS DISTINCT FROM OLD.wallet_to
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.chain IS DISTINCT FROM OLD.chain THEN
      RAISE EXCEPTION 'Price, asset, wallet and owner fields are immutable on payment intents';
    END IF;
    -- Users may only update non-price fields (e.g. tx_hash). Verification/status fields
    -- must remain unchanged from client (only service role edits them).
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.verification_status IS DISTINCT FROM OLD.verification_status
       OR NEW.confirmed_at IS DISTINCT FROM OLD.confirmed_at
       OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
       OR NEW.verified_by IS DISTINCT FROM OLD.verified_by
       OR NEW.onchain_amount IS DISTINCT FROM OLD.onchain_amount
       OR NEW.block_number IS DISTINCT FROM OLD.block_number
       OR NEW.confirmations IS DISTINCT FROM OLD.confirmations
       OR NEW.tx_from IS DISTINCT FROM OLD.tx_from
       OR NEW.tx_to IS DISTINCT FROM OLD.tx_to
       OR NEW.token_contract IS DISTINCT FROM OLD.token_contract
       OR NEW.chain_id IS DISTINCT FROM OLD.chain_id THEN
      RAISE EXCEPTION 'Verification fields can only be modified by the server';
    END IF;
    RETURN NEW;
  END IF;

  -- INSERT: enforce authoritative pricing from billing_plan_configs
  SELECT * INTO v_plan
  FROM public.billing_plan_configs
  WHERE is_active = true
  ORDER BY effective_from DESC NULLS LAST, updated_at DESC NULLS LAST
  LIMIT 1;

  IF v_plan IS NULL THEN
    RAISE EXCEPTION 'No active billing plan configured';
  END IF;

  v_asset := upper(coalesce(NEW.crypto_asset, ''));

  IF NOT (v_asset = ANY (SELECT upper(a) FROM unnest(v_plan.accepted_assets) AS a)) THEN
    RAISE EXCEPTION 'Asset % is not accepted for this plan', v_asset;
  END IF;

  IF v_asset = 'DAAR' THEN
    v_expected_crypto := v_plan.price_daar;
  ELSIF v_asset IN ('USDT', 'USDC') THEN
    v_expected_crypto := v_plan.price_usd;
  ELSE
    -- POL / MATIC or other assets require a server-side rate we don't yet have
    RAISE EXCEPTION 'Asset % is not supported for self-service intents; use a stablecoin or DAAR', v_asset;
  END IF;

  -- Overwrite client-supplied values with authoritative ones
  NEW.crypto_asset := v_asset;
  NEW.amount_usd := v_plan.price_usd;
  NEW.amount_crypto := v_expected_crypto;
  NEW.wallet_to := v_plan.treasury_address;
  NEW.chain := coalesce(v_plan.payment_network, 'polygon');
  -- Never trust client to seed verified state
  NEW.status := 'pending';
  NEW.verification_status := NULL;
  NEW.confirmed_at := NULL;
  NEW.verified_at := NULL;
  NEW.verified_by := NULL;
  NEW.onchain_amount := NULL;
  NEW.block_number := NULL;
  NEW.confirmations := NULL;
  NEW.tx_from := NULL;
  NEW.tx_to := NULL;
  NEW.token_contract := NULL;
  NEW.chain_id := NULL;
  NEW.tx_hash := NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crypto_payment_intents_enforce_pricing ON public.crypto_payment_intents;
CREATE TRIGGER trg_crypto_payment_intents_enforce_pricing
BEFORE INSERT OR UPDATE ON public.crypto_payment_intents
FOR EACH ROW EXECUTE FUNCTION public.enforce_crypto_payment_intent_pricing();

-- 2) community_members: prevent self-promotion to owner of arbitrary communities
DROP POLICY IF EXISTS "Owner can insert self during onboarding" ON public.community_members;

CREATE POLICY "Owner can insert self during onboarding"
ON public.community_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    public.is_community_admin(auth.uid(), community_id)
    OR (
      role = 'owner'
      AND status = 'approved'
      AND NOT EXISTS (
        SELECT 1 FROM public.community_members cm
        WHERE cm.community_id = community_members.community_id
          AND cm.role = 'owner'
      )
    )
  )
);
