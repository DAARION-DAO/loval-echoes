/**
 * Sprint F3 — Crypto Subscription Types & Constants
 * 
 * Defines the crypto-first billing model for MicroDAO Leader Plan.
 * No Stripe. Accepted: DAAR, USDT, USDC, ETH.
 */

// --- Subscription Status ---

export type SubscriptionStatus =
  | 'none'
  | 'pending_payment'
  | 'active'
  | 'past_due'
  | 'expired'
  | 'cancelled'
  | 'manual_review'
  | 'founder_bypass'
  | 'guardian_bypass';

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, { uk: string; en: string; ru: string; es: string }> = {
  none: { uk: 'Без підписки', en: 'No subscription', ru: 'Без подписки', es: 'Sin suscripción' },
  pending_payment: { uk: 'Очікує оплати', en: 'Pending payment', ru: 'Ожидает оплаты', es: 'Pago pendiente' },
  active: { uk: 'Активна', en: 'Active', ru: 'Активна', es: 'Activa' },
  past_due: { uk: 'Прострочена', en: 'Past due', ru: 'Просрочена', es: 'Vencida' },
  expired: { uk: 'Закінчилась', en: 'Expired', ru: 'Истекла', es: 'Expirada' },
  cancelled: { uk: 'Скасована', en: 'Cancelled', ru: 'Отменена', es: 'Cancelada' },
  manual_review: { uk: 'Ручна перевірка', en: 'Manual review', ru: 'Ручная проверка', es: 'Revisión manual' },
  founder_bypass: { uk: 'Обхід засновника', en: 'Founder bypass', ru: 'Обход основателя', es: 'Bypass fundador' },
  guardian_bypass: { uk: 'Обхід guardian', en: 'Guardian bypass', ru: 'Обход guardian', es: 'Bypass guardian' },
};

// --- Crypto Assets ---

export type CryptoAsset = 'DAAR' | 'USDT' | 'USDC' | 'ETH';

export interface CryptoAssetInfo {
  symbol: CryptoAsset;
  name: string;
  chain: string;
  decimals: number;
  icon: string; // Lucide icon name or emoji
}

export const SUPPORTED_ASSETS: CryptoAssetInfo[] = [
  { symbol: 'DAAR', name: 'DAAR Token', chain: 'Ethereum', decimals: 18, icon: '🔷' },
  { symbol: 'USDT', name: 'Tether USD', chain: 'Ethereum', decimals: 6, icon: '💵' },
  { symbol: 'USDC', name: 'USD Coin', chain: 'Ethereum', decimals: 6, icon: '💲' },
  { symbol: 'ETH', name: 'Ethereum', chain: 'Ethereum', decimals: 18, icon: '⟠' },
];

// --- Leader Plan ---

export const LEADER_PLAN = {
  name: 'Leader Plan',
  priceUsd: 20,
  priceDaar: 2,
  daarUsdRate: 10, // 1 DAAR = 10 USDT
  period: 'month' as const,
  acceptedAssets: ['DAAR', 'USDT', 'USDC', 'ETH'] as CryptoAsset[],
  features: {
    uk: [
      'Один активний Дух Спільноти (Community Spirit Agent)',
      'RAG-контекстний пошук по документах MicroDAO',
      'Автоматизація завдань спільноти',
      'Командні звіти та підсумки',
      'API-бюджет для LLM-викликів',
    ],
    en: [
      'One active Community Spirit Agent',
      'RAG context search across MicroDAO documents',
      'Community task automation',
      'Team summaries and reports',
      'API budget for LLM calls',
    ],
    ru: [
      'Один активный Дух Сообщества (Community Spirit Agent)',
      'RAG-контекстный поиск по документам MicroDAO',
      'Автоматизация задач сообщества',
      'Командные отчёты и сводки',
      'API-бюджет для LLM-вызовов',
    ],
    es: [
      'Un agente Community Spirit activo',
      'Búsqueda contextual RAG en documentos MicroDAO',
      'Automatización de tareas comunitarias',
      'Informes y resúmenes del equipo',
      'Presupuesto API para llamadas LLM',
    ],
  },
} as const;

// --- Payment Intent ---

export type PaymentIntentStatus = 'pending' | 'submitted' | 'confirmed' | 'failed' | 'expired';

export interface PaymentIntent {
  id: string;
  subscription_id: string | null;
  user_id: string;
  amount_usd: number;
  amount_crypto: number;
  crypto_asset: CryptoAsset;
  chain: string;
  wallet_from: string | null;
  wallet_to: string | null;
  tx_hash: string | null;
  status: PaymentIntentStatus;
  created_at: string;
  confirmed_at: string | null;
  expires_at: string | null;
}

// --- Subscription ---

export interface MicroDAOSubscription {
  id: string;
  community_id: string;
  owner_user_id: string;
  plan: string;
  status: SubscriptionStatus;
  price_usd: number;
  price_daar: number;
  accepted_assets: CryptoAsset[];
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

// --- Identity Requirements ---

export type IdentityLevel = 'free' | 'member' | 'leader' | 'admin' | 'guardian';

export interface IdentityRequirement {
  email: 'required';
  telegram: 'required' | 'recommended' | 'optional';
  wallet: 'required' | 'recommended' | 'optional';
}

export const IDENTITY_REQUIREMENTS: Record<IdentityLevel, IdentityRequirement> = {
  free: { email: 'required', telegram: 'optional', wallet: 'optional' },
  member: { email: 'required', telegram: 'recommended', wallet: 'optional' },
  leader: { email: 'required', telegram: 'required', wallet: 'required' },
  admin: { email: 'required', telegram: 'required', wallet: 'required' },
  guardian: { email: 'required', telegram: 'required', wallet: 'required' },
};

// --- Subscription Status Helpers ---

export const isActiveSubscription = (status: SubscriptionStatus): boolean =>
  status === 'active' || status === 'founder_bypass' || status === 'guardian_bypass';

export const isBypassSubscription = (status: SubscriptionStatus): boolean =>
  status === 'founder_bypass' || status === 'guardian_bypass';

export const needsPayment = (status: SubscriptionStatus): boolean =>
  status === 'none' || status === 'pending_payment' || status === 'past_due' || status === 'expired';
