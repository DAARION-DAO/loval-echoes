import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserApprovalStatus } from '@/hooks/useUserApprovalStatus';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { PendingApprovalPage } from '@/components/PendingApprovalPage';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { approvalStatus } = useUserApprovalStatus();
  
  // Initialize session recovery
  useSessionRecovery();

  // Show loading while checking auth and approval status
  if (authLoading || approvalStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // User not authenticated - this should be handled by router level auth
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // User is pending approval
  if (approvalStatus === 'pending') {
    return <PendingApprovalPage />;
  }

  // User is rejected
  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">Доступ запрещен</h1>
          <p className="text-muted-foreground">
            К сожалению, ваша заявка на вступление в сообщество была отклонена. 
            Вы можете попробовать подать заявку повторно позже.
          </p>
        </div>
      </div>
    );
  }

  // User is approved - show protected content
  return <>{children}</>;
};