import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Eye, Pause } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface PrinciplesBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export const PrinciplesBanner = ({ onDismiss, className = '' }: PrinciplesBannerProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('zhos-principles-banner-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('zhos-principles-banner-dismissed', 'true');
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 space-y-2">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
            {t.principlesTitle}
          </h3>
          
          <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
              <span>{t.principleNeutral}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              <span>{t.principleVisible}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Pause className="h-3 w-3" />
              <span>{t.principlePause}</span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Закрыть</span>
        </Button>
      </div>
    </div>
  );
};