import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  X 
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { ErrorDetails } from '@/utils/errorMapping';

interface ErrorToastProps {
  error: ErrorDetails;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetailsButton?: boolean;
  className?: string;
}

export const ErrorToast = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetailsButton = true,
  className = '' 
}: ErrorToastProps) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`bg-destructive/10 border border-destructive/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-destructive text-sm">
              {error.title}
            </h4>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <p className="text-sm text-destructive/80">
            {error.message}
          </p>
          
          {showDetails && error.showDetails && (
            <div className="mt-2 p-2 bg-destructive/5 rounded text-xs font-mono text-destructive">
              <div><strong>Код:</strong> {error.code}</div>
              <div><strong>Повторяемая:</strong> {error.retryable ? 'Да' : 'Нет'}</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-destructive/10">
        <div className="flex items-center gap-2">
          {error.retryable && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {t.errors.retry}
            </Button>
          )}
          
          {showDetailsButton && error.showDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-destructive hover:bg-destructive/10 text-xs"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  {t.errors.hideDetails}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  {t.errors.showDetails}
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className="text-xs text-destructive/60 font-mono">
          {error.code}
        </div>
      </div>
    </div>
  );
};