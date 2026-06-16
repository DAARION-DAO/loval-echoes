-- local migration only, do not apply remotely from Antigravity

-- Add verification metadata columns to crypto_payment_intents
ALTER TABLE public.crypto_payment_intents
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unchecked',
  ADD COLUMN IF NOT EXISTS verification_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_error text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by text,
  ADD COLUMN IF NOT EXISTS block_number bigint,
  ADD COLUMN IF NOT EXISTS tx_from text,
  ADD COLUMN IF NOT EXISTS tx_to text,
  ADD COLUMN IF NOT EXISTS onchain_amount numeric;

-- Unique constraint on tx_hash for confirmed intents to block double spending
CREATE UNIQUE INDEX IF NOT EXISTS crypto_payment_intents_confirmed_tx_hash_unique
  ON public.crypto_payment_intents (tx_hash)
  WHERE status = 'confirmed' AND tx_hash IS NOT NULL;
