/**
 * Sprint F3 — Identity Checklist Component
 * 
 * Shows completion status of identity requirements:
 * - Email (always required)
 * - Telegram (required/recommended/optional based on role)
 * - Wallet (required/recommended/optional based on role)
 */

import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { IDENTITY_REQUIREMENTS, type IdentityLevel } from '@/lib/subscriptionTypes';

interface IdentityChecklistProps {
  email: string | null;
  telegramUsername: string | null;
  walletAddress: string | null;
  level?: IdentityLevel;
  compact?: boolean;
}

export const IdentityChecklist = ({
  email,
  telegramUsername,
  walletAddress,
  level = 'free',
  compact = false,
}: IdentityChecklistProps) => {
  const { t } = useTranslation();
  const reqs = IDENTITY_REQUIREMENTS[level];

  const items = [
    {
      label: t.identity.emailConnected,
      connected: !!email,
      requirement: reqs.email,
    },
    {
      label: telegramUsername
        ? t.identity.telegramConnected
        : t.identity.telegramNotLinked,
      connected: !!telegramUsername,
      requirement: reqs.telegram,
    },
    {
      label: walletAddress
        ? t.identity.walletConnected
        : t.identity.walletNotConnected,
      connected: !!walletAddress,
      requirement: reqs.wallet,
    },
  ];

  const reqBadgeColor = (req: string) => {
    switch (req) {
      case 'required':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'recommended':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'optional':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getReqLabel = (req: string) => {
    switch (req) {
      case 'required': return t.identity.required;
      case 'recommended': return t.identity.recommended;
      case 'optional': return t.identity.optional;
      default: return req;
    }
  };

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-3'}>
      {!compact && (
        <h4 className="text-sm font-semibold text-slate-200">
          {t.identity.checklistTitle}
        </h4>
      )}
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {item.connected ? (
            <CheckCircle2 className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-emerald-400 flex-shrink-0`} />
          ) : item.requirement === 'required' ? (
            <AlertCircle className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-red-400 flex-shrink-0`} />
          ) : (
            <Circle className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-slate-500 flex-shrink-0`} />
          )}
          <span className={item.connected ? 'text-slate-200' : 'text-slate-400'}>
            {item.label}
          </span>
          {!compact && (
            <Badge
              variant="outline"
              className={`ml-auto text-[9px] uppercase font-bold tracking-wider ${reqBadgeColor(item.requirement)}`}
            >
              {getReqLabel(item.requirement)}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};
