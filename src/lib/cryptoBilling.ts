/**
 * Sprint F3B — Crypto Billing Config & Helper Functions
 * 
 * Treasury EVM address: Polygon-only receiving wallet.
 * Purchase link: token gateway (app.daarion.city).
 */

export const DAAR_USDT_RATE = 10; // 1 DAAR = 10 USDT
export const LEADER_PLAN_USD = 20; // $20/month
export const LEADER_PLAN_DAAR = 2; // 2 DAAR/month
export const POL_USD_RATE = 0.5; // 1 POL = $0.50 (for MVP utility conversion)

export const DAAR_PURCHASE_URL =
  import.meta.env.VITE_DAAR_PURCHASE_URL || 'https://app.daarion.city/';

export const DAARION_PAYMENT_NETWORK =
  import.meta.env.VITE_DAARION_PAYMENT_NETWORK || 'polygon';

export const DAARION_TREASURY_EVM_ADDRESS =
  import.meta.env.VITE_DAARION_TREASURY_EVM_ADDRESS ||
  '0x39c8e3807B864A633bd83C34995d7A3a18d0b7e8';

export const SUPPORTED_PAYMENT_ASSETS = [
  'DAAR',
  'USDT',
  'USDC',
  'POL',
] as const;

export type SupportedPaymentAsset = typeof SUPPORTED_PAYMENT_ASSETS[number];

/**
 * Validates EVM address (simple regex check)
 */
export const isValidEvmAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validates EVM transaction hash (0x + 64 hex characters)
 */
export const isValidTxHash = (hash: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash.trim());
};

/**
 * Shortens EVM address for display: 0x1234...5678
 */
export const shortenAddress = (address: string): string => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

/**
 * Check if treasury address is correctly configured
 */
export const isTreasuryConfigured = (): boolean => {
  return isValidEvmAddress(DAARION_TREASURY_EVM_ADDRESS);
};

/**
 * Calculate amount and format display label for Leader Plan
 */
export const getLeaderPlanAmount = (asset: SupportedPaymentAsset): {
  amount: number;
  amountUsd: number;
  label: string;
} => {
  switch (asset) {
    case 'DAAR':
      return {
        amount: LEADER_PLAN_DAAR,
        amountUsd: LEADER_PLAN_USD,
        label: `${LEADER_PLAN_DAAR} DAAR`,
      };
    case 'USDT':
      return {
        amount: LEADER_PLAN_USD,
        amountUsd: LEADER_PLAN_USD,
        label: `${LEADER_PLAN_USD} USDT`,
      };
    case 'USDC':
      return {
        amount: LEADER_PLAN_USD,
        amountUsd: LEADER_PLAN_USD,
        label: `${LEADER_PLAN_USD} USDC`,
      };
    case 'POL': {
      const amountPol = LEADER_PLAN_USD / POL_USD_RATE;
      return {
        amount: amountPol,
        amountUsd: LEADER_PLAN_USD,
        label: `${amountPol} POL`,
      };
    }
  }
};
