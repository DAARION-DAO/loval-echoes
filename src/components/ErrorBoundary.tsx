import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { useTranslation } from '@/lib/i18n';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback = ({ error, resetError }: { error?: Error; resetError: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{t.errorBoundary.title}</CardTitle>
          <CardDescription>
            {t.errorBoundary.desc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground font-mono">
                {error.message}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={resetError} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.errorBoundary.retryBtn}
          </Button>
          <Button onClick={() => window.location.reload()} className="flex-1">
            {t.errorBoundary.refreshBtn}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export const ErrorBoundary = ({ children, fallback }: ErrorBoundaryProps) => (
  <ErrorBoundaryClass fallback={fallback}>
    {children}
  </ErrorBoundaryClass>
);