import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ApprovalStatus {
  approved_count: number;
  total_required: number;
  rejected_count: number;
}

export const PendingApprovalPage = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadApprovalStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('user_approval_requests')
          .select('approved_by, rejected_by, total_existing_users')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .single();

        if (error) {
          console.error('Error loading approval status:', error);
          return;
        }

        if (data) {
          setStatus({
            approved_count: data.approved_by?.length || 0,
            total_required: data.total_existing_users,
            rejected_count: data.rejected_by?.length || 0,
          });
        }
      } catch (error) {
        console.error('Error loading approval status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApprovalStatus();

    // Subscribe to changes
    const subscription = supabase
      .channel('approval_status')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'user_approval_requests',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          loadApprovalStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Card className="w-96">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Main Status Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Ваша заявка рассматривается</CardTitle>
            <CardDescription>
              Существующие участники сообщества рассматривают вашу заявку на вступление
            </CardDescription>
          </CardHeader>
          
          {status && (
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {status.approved_count}/{status.total_required}
                </div>
                <div className="text-sm text-muted-foreground">
                  одобрений получено
                </div>
              </div>

              {status.rejected_count > 0 && (
                <div className="text-center p-3 bg-destructive/10 rounded-lg">
                  <div className="text-destructive font-medium">
                    К сожалению, ваша заявка была отклонена
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Вы можете попробовать подать заявку повторно позже
                  </div>
                </div>
              )}

              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((status.approved_count / status.total_required) * 100, 100)}%` 
                  }}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Система одобрения</div>
                  <div className="text-sm text-muted-foreground">
                    Для вступления требуется единогласное одобрение всех участников
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Безопасность сообщества</div>
                  <div className="text-sm text-muted-foreground">
                    Этот процесс помогает поддерживать качество и безопасность общения
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Пожалуйста, ожидайте решения участников сообщества. 
          Вы получите уведомление о результате.
        </div>
      </div>
    </div>
  );
};