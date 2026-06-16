import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export interface BillingPlanConfig {
  priceUsd: number;
  priceDaar: number;
  daarUsdtRate: number;
  acceptedAssets: SupportedPaymentAsset[];
  paymentNetwork: string;
  treasuryAddress: string;
  daarPurchaseUrl: string;
  isActive: boolean;
}

export const useBillingPlanConfig = (planKey = 'leader') => {
  const [config, setConfig] = useState<BillingPlanConfig>({
    priceUsd: LEADER_PLAN_USD,
    priceDaar: LEADER_PLAN_DAAR,
    daarUsdtRate: DAAR_USDT_RATE,
    acceptedAssets: [...SUPPORTED_PAYMENT_ASSETS],
    paymentNetwork: DAARION_PAYMENT_NETWORK,
    treasuryAddress: DAARION_TREASURY_EVM_ADDRESS,
    daarPurchaseUrl: DAAR_PURCHASE_URL,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let active = true;
    const fetchConfig = async () => {
      try {
        const { data, error: fetchError } = await (supabase as any).rpc(
          'get_active_billing_plan_config',
          { p_plan_key: planKey }
        );

        if (fetchError) throw fetchError;

        if (data && data.length > 0 && active) {
          const item = data[0];
          setConfig({
            priceUsd: Number(item.price_usd),
            priceDaar: Number(item.price_daar),
            daarUsdtRate: Number(item.daar_usdt_rate),
            acceptedAssets: item.accepted_assets as SupportedPaymentAsset[],
            paymentNetwork: item.payment_network,
            treasuryAddress: item.treasury_address,
            daarPurchaseUrl: item.daar_purchase_url,
            isActive: item.is_active,
          });
        }
      } catch (err: any) {
        console.warn('[useBillingPlanConfig] Failed to load config from database, using local constants fallback:', err);
        if (active) {
          setError(err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchConfig();
    return () => {
      active = false;
    };
  }, [planKey]);

  return { config, loading, error };
};

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
export const getLeaderPlanAmount = (
  asset: SupportedPaymentAsset,
  customConfig?: {
    priceUsd: number;
    priceDaar: number;
    daarUsdtRate: number;
  }
): {
  amount: number;
  amountUsd: number;
  label: string;
} => {
  const usdPrice = customConfig?.priceUsd ?? LEADER_PLAN_USD;
  const daarPrice = customConfig?.priceDaar ?? LEADER_PLAN_DAAR;

  switch (asset) {
    case 'DAAR':
      return {
        amount: daarPrice,
        amountUsd: usdPrice,
        label: `${daarPrice} DAAR`,
      };
    case 'USDT':
      return {
        amount: usdPrice,
        amountUsd: usdPrice,
        label: `${usdPrice} USDT`,
      };
    case 'USDC':
      return {
        amount: usdPrice,
        amountUsd: usdPrice,
        label: `${usdPrice} USDC`,
      };
    case 'POL': {
      const amountPol = usdPrice / POL_USD_RATE;
      return {
        amount: amountPol,
        amountUsd: usdPrice,
        label: `${amountPol} POL`,
      };
    }
  }
};
