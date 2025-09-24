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

  // Enhanced mobile debugging
  console.log('🔍 ProtectedRoute Debug:', {
    user: user ? { id: user.id, email: user.email } : null,
    authLoading,
    approvalStatus,
    userAgent: navigator.userAgent,
    isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
  });

  // Show loading while checking auth and approval status
  if (authLoading || approvalStatus === 'loading') {
    console.log('⏳ ProtectedRoute: Loading...', { authLoading, approvalStatus });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // User not authenticated - this should be handled by router level auth
  if (!user) {
    console.log('❌ ProtectedRoute: No user found');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // User is pending approval
  if (approvalStatus === 'pending') {
    console.log('⏸️ ProtectedRoute: User pending approval');
    return <PendingApprovalPage />;
  }

  // User is rejected
  if (approvalStatus === 'rejected') {
    console.log('🚫 ProtectedRoute: User rejected');
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
  console.log('✅ ProtectedRoute: User is approved, showing content', {
    userId: user.id,
    approvalStatus,
    isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
  });
  return <>{children}</>;
};