import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { useUserApprovalStatus } from '@/hooks/useUserApprovalStatus';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { approvalStatus, isApproved } = useUserApprovalStatus();

  // Initialize session recovery
  useSessionRecovery();

  if (authLoading || approvalStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (approvalStatus === 'rejected' || approvalStatus === 'blocked') {
    return <Navigate to="/restricted" replace />;
  }

  return <>{children}</>;
};