-- Create billing_plan_configs table
CREATE TABLE IF NOT EXISTS public.billing_plan_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL UNIQUE,
  price_usd numeric NOT NULL,
  price_daar numeric NOT NULL,
  daar_usdt_rate numeric NOT NULL,
  accepted_assets text[] NOT NULL,
  payment_network text NOT NULL,
  treasury_address text NOT NULL,
  daar_purchase_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  effective_from timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default row for leader plan
INSERT INTO public.billing_plan_configs (
  plan_key,
  price_usd,
  price_daar,
  daar_usdt_rate,
  accepted_assets,
  payment_network,
  treasury_address,
  daar_purchase_url,
  is_active
) VALUES (
  'leader',
  20,
  2,
  10,
  ARRAY['DAAR', 'USDT', 'USDC', 'POL'],
  'polygon',
  '0x39c8e3807B864A633bd83C34995d7A3a18d0b7e8',
  'https://app.daarion.city/',
  true
) ON CONFLICT (plan_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.billing_plan_configs ENABLE ROW LEVEL SECURITY;

-- Enable Policies
CREATE POLICY "Anyone can read billing plan configs"
  ON public.billing_plan_configs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Platform guardians can manage billing configs"
  ON public.billing_plan_configs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'guardian'
    )
  );

-- RPC to get active config
CREATE OR REPLACE FUNCTION public.get_active_billing_plan_config(
  p_plan_key text DEFAULT 'leader'
)
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
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.plan_key,
    c.price_usd,
    c.price_daar,
    c.daar_usdt_rate,
    c.accepted_assets,
    c.payment_network,
    c.treasury_address,
    c.daar_purchase_url,
    c.is_active,
    c.effective_from
  FROM public.billing_plan_configs c
  WHERE c.plan_key = p_plan_key 
    AND c.is_active = true
  LIMIT 1;
END;
$$;

-- RPC to update config
CREATE OR REPLACE FUNCTION public.admin_update_billing_plan_config(
  p_plan_key text,
  p_price_usd numeric,
  p_price_daar numeric,
  p_daar_usdt_rate numeric,
  p_accepted_assets text[],
  p_payment_network text,
  p_treasury_address text,
  p_daar_purchase_url text,
  p_is_active boolean
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_role text;
BEGIN
  -- Security check: caller must be a platform guardian
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'guardian' THEN
    RAISE EXCEPTION 'Unauthorized: guardian role required';
  END IF;

  -- Input Validation
  IF p_price_usd <= 0 OR p_price_daar <= 0 OR p_daar_usdt_rate <= 0 THEN
    RAISE EXCEPTION 'Prices and rates must be greater than zero';
  END IF;

  IF NOT (p_treasury_address ~ '^0x[a-fA-F0-9]{40}$') THEN
    RAISE EXCEPTION 'Invalid EVM treasury address';
  END IF;

  IF p_payment_network IS DISTINCT FROM 'polygon' THEN
    RAISE EXCEPTION 'Only Polygon network is supported at this time';
  END IF;

  -- Update or insert config
  INSERT INTO public.billing_plan_configs (
    plan_key,
    price_usd,
    price_daar,
    daar_usdt_rate,
    accepted_assets,
    payment_network,
    treasury_address,
    daar_purchase_url,
    is_active,
    updated_by,
    updated_at
  ) VALUES (
    p_plan_key,
    p_price_usd,
    p_price_daar,
    p_daar_usdt_rate,
    p_accepted_assets,
    p_payment_network,
    p_treasury_address,
    p_daar_purchase_url,
    p_is_active,
    auth.uid(),
    now()
  )
  ON CONFLICT (plan_key) DO UPDATE
  SET
    price_usd = EXCLUDED.price_usd,
    price_daar = EXCLUDED.price_daar,
    daar_usdt_rate = EXCLUDED.daar_usdt_rate,
    accepted_assets = EXCLUDED.accepted_assets,
    payment_network = EXCLUDED.payment_network,
    treasury_address = EXCLUDED.treasury_address,
    daar_purchase_url = EXCLUDED.daar_purchase_url,
    is_active = EXCLUDED.is_active,
    updated_by = auth.uid(),
    updated_at = now();

  -- Log action
  INSERT INTO public.audit_logs (
    user_id,
    action,
    target_type,
    details
  ) VALUES (
    auth.uid(),
    'billing_plan_config_updated',
    'billing_plan_configs',
    jsonb_build_object(
      'plan_key', p_plan_key,
      'price_usd', p_price_usd,
      'price_daar', p_price_daar,
      'daar_usdt_rate', p_daar_usdt_rate,
      'accepted_assets', p_accepted_assets,
      'payment_network', p_payment_network,
      'treasury_address', p_treasury_address,
      'daar_purchase_url', p_daar_purchase_url,
      'is_active', p_is_active
    )
  );
END;
$$;
