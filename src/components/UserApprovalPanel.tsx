import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ApprovalRequest {
  id: string;
  user_id: string;
  requested_at: string;
  status: string;
  approved_by: string[];
  rejected_by: string[];
  total_existing_users: number;
  profiles: {
    display_name: string;
    avatar_url?: string;
  } | null;
}

interface UserApprovalPanelProps {
  className?: string;
}

export const UserApprovalPanel = ({ className = '' }: UserApprovalPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadApprovalRequests();
  }, []);

  const loadApprovalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_approval_requests')
        .select(`
          id,
          user_id,
          requested_at,
          status,
          approved_by,
          rejected_by,
          total_existing_users,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (error) throw error;

      setRequests((data as any) || []);
    } catch (error) {
      console.error('Error loading approval requests:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить запросы на подтверждение',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, decision: 'approve' | 'reject') => {
    if (!user || submitting) return;

    setSubmitting(requestId);

    try {
      // Add user's approval/rejection
      const { error: approvalError } = await supabase
        .from('user_approvals')
        .insert({
          request_id: requestId,
          approver_id: user.id,
          decision,
          notes: notes[requestId] || null,
        });

      if (approvalError) throw approvalError;

      // Get current request data
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      const newApprovedBy = decision === 'approve' 
        ? [...request.approved_by, user.id]
        : request.approved_by;
      
      const newRejectedBy = decision === 'reject'
        ? [...request.rejected_by, user.id]
        : request.rejected_by;

      // Check if we have enough approvals (all existing users) or any rejection
      const shouldApprove = newApprovedBy.length === request.total_existing_users && newRejectedBy.length === 0;
      const shouldReject = newRejectedBy.length > 0;

      let newStatus = 'pending';
      if (shouldApprove) {
        newStatus = 'approved';
        
        // Update user profile to approved
        await supabase
          .from('profiles')
          .update({ approval_status: 'approved' })
          .eq('user_id', request.user_id);
          
      } else if (shouldReject) {
        newStatus = 'rejected';
        
        // Update user profile to rejected
        await supabase
          .from('profiles')
          .update({ approval_status: 'rejected' })
          .eq('user_id', request.user_id);
      }

      // Update the request
      const { error: updateError } = await supabase
        .from('user_approval_requests')
        .update({
          status: newStatus,
          approved_by: newApprovedBy,
          rejected_by: newRejectedBy,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Reload requests
      await loadApprovalRequests();

      toast({
        title: decision === 'approve' ? 'Голос засчитан' : 'Отклонение засчитано',
        description: shouldApprove 
          ? 'Пользователь одобрен всем сообществом!' 
          : shouldReject 
            ? 'Пользователь отклонен'
            : `Ваш голос учтен. Нужно ${request.total_existing_users - newApprovedBy.length} голосов для подтверждения.`,
      });

      // Clear notes
      setNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[requestId];
        return newNotes;
      });

    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать решение',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Новые участники ожидают подтверждения
          </CardTitle>
          <CardDescription>
            Для входа в сообщество новые участники должны быть единогласно одобрены существующими пользователями.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.map((request) => {
            const hasUserVoted = request.approved_by.includes(user?.id || '') || 
                               request.rejected_by.includes(user?.id || '');
            
            return (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {request.profiles?.avatar_url ? (
                        <img 
                          src={request.profiles.avatar_url} 
                          alt={request.profiles.display_name || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{request.profiles?.display_name || 'Неизвестный пользователь'}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(request.requested_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {request.approved_by.length}/{request.total_existing_users} одобрений
                    </Badge>
                    {request.rejected_by.length > 0 && (
                      <Badge variant="destructive">
                        {request.rejected_by.length} отклонений
                      </Badge>
                    )}
                  </div>
                </div>

                {!hasUserVoted && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Комментарий (необязательно)"
                      value={notes[request.id] || ''}
                      onChange={(e) => setNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                      rows={2}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproval(request.id, 'approve')}
                        disabled={submitting === request.id}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Одобрить
                      </Button>
                      
                      <Button
                        variant="destructive"
                        onClick={() => handleApproval(request.id, 'reject')}
                        disabled={submitting === request.id}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                )}

                {hasUserVoted && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {request.approved_by.includes(user?.id || '') ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Вы одобрили этого участника
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        Вы отклонили этого участника
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};