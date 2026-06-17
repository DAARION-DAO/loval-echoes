-- F3C.1: Server-side Polygon Payment Verifier — verification metadata + unique tx_hash protection
ALTER TABLE public.crypto_payment_intents
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unchecked',
  ADD COLUMN IF NOT EXISTS verification_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_error text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by text,
  ADD COLUMN IF NOT EXISTS chain_id integer,
  ADD COLUMN IF NOT EXISTS block_number bigint,
  ADD COLUMN IF NOT EXISTS tx_from text,
  ADD COLUMN IF NOT EXISTS tx_to text,
  ADD COLUMN IF NOT EXISTS token_contract text,
  ADD COLUMN IF NOT EXISTS onchain_amount numeric,
  ADD COLUMN IF NOT EXISTS confirmations integer;

-- Unique index: block double-spends by ensuring a tx_hash can confirm at most one intent
CREATE UNIQUE INDEX IF NOT EXISTS crypto_payment_intents_confirmed_tx_hash_unique
  ON public.crypto_payment_intents (tx_hash)
  WHERE status = 'confirmed' AND tx_hash IS NOT NULL;