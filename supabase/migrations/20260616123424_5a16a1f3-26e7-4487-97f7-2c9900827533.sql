-- F4C: Guardian-managed Billing Plan Configuration
CREATE TABLE IF NOT EXISTS public.billing_plan_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL,
  price_usd numeric(12,4) NOT NULL,
  price_daar numeric(20,8) NOT NULL,
  daar_usdt_rate numeric(20,8) NOT NULL,
  accepted_assets text[] NOT NULL DEFAULT ARRAY['DAAR','USDT','USDC','POL']::text[],
  payment_network text NOT NULL DEFAULT 'polygon',
  treasury_address text NOT NULL,
  daar_purchase_url text,
  is_active boolean NOT NULL DEFAULT true,
  effective_from timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_plan_configs TO authenticated;
GRANT ALL ON public.billing_plan_configs TO service_role;

ALTER TABLE public.billing_plan_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guardians can read all billing plan configs"
  ON public.billing_plan_configs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Guardians can insert billing plan configs"
  ON public.billing_plan_configs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Guardians can update billing plan configs"
  ON public.billing_plan_configs FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Guardians can delete billing plan configs"
  ON public.billing_plan_configs FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_billing_plan_configs_active
  ON public.billing_plan_configs (plan_key, is_active, effective_from DESC);

CREATE TRIGGER update_billing_plan_configs_updated_at
  BEFORE UPDATE ON public.billing_plan_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: read the currently active config for a plan (any authenticated user)
CREATE OR REPLACE FUNCTION public.get_active_billing_plan_config(p_plan_key text DEFAULT 'leader')
RETURNS TABLE (
  id uuid,
  plan_key text,
  price_usd numeric,
  price_daar numeric,
  daar_usdt_rate numeric,
  accepted_assets text[],
  payment_network text,
  treasury_address text,
  daar_purchase_url text,
  is_active boolean,
  effective_from timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.plan_key, c.price_usd, c.price_daar, c.daar_usdt_rate,
         c.accepted_assets, c.payment_network, c.treasury_address,
         c.daar_purchase_url, c.is_active, c.effective_from
  FROM public.billing_plan_configs c
  WHERE c.plan_key = p_plan_key AND c.is_active = true
  ORDER BY c.effective_from DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_billing_plan_config(text) TO authenticated, anon;

-- RPC: guardian-only update -> snapshot a new active config row
CREATE OR REPLACE FUNCTION public.admin_update_billing_plan_config(
  p_plan_key text,
  p_price_usd numeric,
  p_price_daar numeric,
  p_daar_usdt_rate numeric,
  p_accepted_assets text[],
  p_payment_network text,
  p_treasury_address text,
  p_daar_purchase_url text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_new_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: guardian role required';
  END IF;

  UPDATE public.billing_plan_configs
  SET is_active = false, updated_at = now()
  WHERE plan_key = p_plan_key AND is_active = true;

  INSERT INTO public.billing_plan_configs (
    plan_key, price_usd, price_daar, daar_usdt_rate,
    accepted_assets, payment_network, treasury_address, daar_purchase_url,
    is_active, effective_from, updated_by
  ) VALUES (
    p_plan_key, p_price_usd, p_price_daar, p_daar_usdt_rate,
    COALESCE(p_accepted_assets, ARRAY['DAAR','USDT','USDC','POL']::text[]),
    COALESCE(p_payment_network, 'polygon'),
    p_treasury_address, p_daar_purchase_url,
    true, now(), auth.uid()
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_billing_plan_config(text, numeric, numeric, numeric, text[], text, text, text) TO authenticated;

-- Seed default Leader plan
INSERT INTO public.billing_plan_configs (
  plan_key, price_usd, price_daar, daar_usdt_rate,
  accepted_assets, payment_network, treasury_address, daar_purchase_url, is_active
)
SELECT 'leader', 20, 2, 10,
  ARRAY['DAAR','USDT','USDC','POL']::text[],
  'polygon',
  '0x39c8e3807B864A633bd83C34995d7A3a18d0b7e8',
  'https://app.daarion.city/',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.billing_plan_configs WHERE plan_key = 'leader'
);