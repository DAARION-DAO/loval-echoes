import { ExternalLink, HelpCircle } from 'lucide-react';
import { useBillingPlanConfig } from '@/lib/cryptoBilling';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DaarPurchaseLinkProps {
  className?: string;
}

export const DaarPurchaseLink = ({ className = '' }: DaarPurchaseLinkProps) => {
  const { t } = useTranslation();
  const { config, loading } = useBillingPlanConfig();

  const purchaseUrl = loading ? 'https://app.daarion.city/' : config.daarPurchaseUrl;

  return (
    <Card className={`border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md hover:border-indigo-500/30 transition-all ${className}`}>
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex gap-2.5 items-start">
          <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400 flex-shrink-0 mt-0.5">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-200 text-xs">
              {t.cryptoBilling.buyGetDaar}
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {t.cryptoBilling.daarRequirementDesc}
            </p>
          </div>
        </div>
        <Button 
          asChild
          className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-550 text-indigo-100 border border-indigo-500/30 h-9 font-semibold text-xs gap-1.5"
        >
          <a href={purchaseUrl} target="_blank" rel="noopener noreferrer">
            {t.cryptoBilling.openGateway}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
