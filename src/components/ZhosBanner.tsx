import { Button } from '@/components/ui/button';
import { Pause, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface ZhosBannerProps {
  onPauseNode: () => void;
  className?: string;
}

export const ZhosBanner = ({ onPauseNode, className = '' }: ZhosBannerProps) => {
  const { t } = useTranslation();

  return (
    <div className={`zhos-banner p-4 rounded-lg border-2 border-dashed ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2 text-sm">
          <p className="font-medium">{t.zhosBanner.line1}</p>
          <p>{t.zhosBanner.line2}</p>
          <p className="text-xs">{t.zhosBanner.line3}</p>
        </div>
        <Button
          onClick={onPauseNode}
          variant="outline"
          size="sm"
          className="flex-shrink-0 border-zhos-banner-border hover:bg-zhos-banner-foreground/10"
        >
          <Pause className="h-4 w-4 mr-2" />
          {t.zhosBanner.pauseButton}
        </Button>
      </div>
    </div>
  );
};