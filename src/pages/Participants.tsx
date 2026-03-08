import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Users, Clock, CheckCircle, XCircle, UserCheck } from 'lucide-react';

interface ApprovalRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  approved_by: string[];
  rejected_by: string[];
  total_existing_users: number;
  display_name: string;
  avatar_url?: string;
  email?: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  email?: string;
  approval_status: string;
  created_at: string;
}

export const Participants = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load pending requests with profile data
      const { data: rawPending, error: pendingError } = await supabase
        .from('user_approval_requests')
        .select(`
          id,
          user_id,
          status,
          created_at,
          approved_by,
          rejected_by,
          total_existing_users
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Get profile data for pending requests
      const pendingWithProfiles: ApprovalRequest[] = [];
      if (rawPending && rawPending.length > 0) {
        const userIds = rawPending.map(r => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        for (const request of rawPending) {
          const profile = profiles?.find(p => p.user_id === request.user_id);
          pendingWithProfiles.push({
            ...request,
            display_name: profile?.display_name || 'Пользователь',
            avatar_url: profile?.avatar_url ?? undefined,
            email: profile?.email ?? undefined,
          });
        }
      }

      // Load all users by status
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      console.log('All profiles loaded:', profiles);
      console.log('Approved profiles:', profiles?.filter(p => p.approval_status === 'approved'));

      setPendingRequests(pendingWithProfiles);
      setApprovedUsers(profiles?.filter(p => p.approval_status === 'approved') || []);
      setRejectedUsers(profiles?.filter(p => p.approval_status === 'rejected') || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные участников',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, decision: 'approve' | 'reject') => {
    if (!user) return;
    
    setSubmitting(requestId);
    
    try {
      const request = pendingRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Insert user's vote
      const { error: voteError } = await supabase
        .from('user_approvals')
        .insert({
          request_id: requestId,
          approver_id: user.id,
          decision,
          notes: userNotes[requestId] || null
        });

      if (voteError) {
        console.error('Vote error:', voteError);
        throw voteError;
      }

      // Get updated vote counts
      const { data: votes, error: votesError } = await supabase
        .from('user_approvals')
        .select('decision')
        .eq('request_id', requestId);

      if (votesError) {
        console.error('Votes error:', votesError);
        throw votesError;
      }

      const approveCount = votes?.filter(v => v.decision === 'approve').length || 0;
      const rejectCount = votes?.filter(v => v.decision === 'reject').length || 0;

      // Update request with vote counts
      const { error: updateError } = await supabase
        .from('user_approval_requests')
        .update({
          approved_by: Array(approveCount).fill('approved'),
          rejected_by: Array(rejectCount).fill('rejected')
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Get required approvals using new function
      const { data: requiredData, error: requiredError } = await supabase
        .rpc('calculate_required_approvals');

      if (requiredError) {
        console.error('Required approvals error:', requiredError);
        throw requiredError;
      }

      const requiredApprovals = requiredData || 1;

      // Determine final status
      let finalStatus = 'pending';
      let profileStatus: string | null = null;

      if (rejectCount > 0) {
        finalStatus = 'rejected';
        profileStatus = 'rejected';
      } else if (approveCount >= requiredApprovals) {
        finalStatus = 'approved';
        profileStatus = 'approved';
      }

      // Update request status if needed
      if (finalStatus !== 'pending' && profileStatus) {
        const { error: statusError } = await supabase
          .from('user_approval_requests')
          .update({ status: finalStatus })
          .eq('id', requestId);

        if (statusError) {
          console.error('Status error:', statusError);
          throw statusError;
        }

        // Update user's profile status
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ approval_status: profileStatus })
          .eq('user_id', request.user_id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          toast({
            title: "Ошибка обновления профиля",
            description: `Ошибка RLS: ${profileError.message}. Проверьте права доступа.`,
            variant: "destructive",
          });
          throw profileError;
        }

        console.log(`Successfully updated user ${request.user_id} to status: ${profileStatus}`);
      }

      // Clear note for this user
      setUserNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[requestId];
        return newNotes;
      });

      // Reload data
      await loadData();
      
      toast({
        title: decision === 'approve' ? 'Заявка одобрена' : 'Заявка отклонена',
        description: finalStatus !== 'pending' 
          ? `Пользователь ${finalStatus === 'approved' ? 'принят в сообщество' : 'отклонён'}`
          : `Ваш голос учтён. Требуется ${requiredApprovals - approveCount} дополнительных одобрений.`
      });

    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: 'Ошибка',
        description: `Не удалось обработать заявку: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(null);
    }
  };

  const hasUserVoted = (request: ApprovalRequest): boolean => {
    // This would need to be implemented by checking user_approvals table
    // For now, we'll return false to allow voting
    return false;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Загрузка участников..." />
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Управление участниками</h1>
        <p className="text-muted-foreground">
          Просмотр и управление заявками на вступление в сообщество
        </p>
      </div>

      <Tabs defaultValue="pending" className="h-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ожидают одобрения ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Одобренные ({approvedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Отклонённые ({rejectedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="h-[calc(100%-4rem)]">
          <ScrollArea className="h-full">
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет ожидающих заявок</h3>
                <p className="text-muted-foreground">
                  Все заявки на вступление обработаны
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.avatar_url} />
                          <AvatarFallback>
                            {request.display_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {request.display_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Подал заявку: {formatDate(request.created_at)}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Одобрили: {request.approved_by?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <XCircle className="h-4 w-4 text-red-500" />
                              Отклонили: {request.rejected_by?.length || 0}
                            </span>
                            <span className="text-muted-foreground">
                              Требуется: {request.total_existing_users} голосов
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Ожидает
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    {!hasUserVoted(request) ? (
                      <CardContent>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Комментарий (необязательно)..."
                            value={userNotes[request.id] || ''}
                            onChange={(e) => setUserNotes(prev => ({
                              ...prev,
                              [request.id]: e.target.value
                            }))}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApproval(request.id, 'approve')}
                              disabled={submitting === request.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Одобрить
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleApproval(request.id, 'reject')}
                              disabled={submitting === request.id}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Отклонить
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    ) : (
                      <CardContent>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <UserCheck className="h-4 w-4" />
                          Вы уже проголосовали по этой заявке
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="approved" className="h-[calc(100%-4rem)]">
          <ScrollArea className="h-full">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.display_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{user.display_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Вступил: {formatDate(user.created_at)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-green-700 bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Участник
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="rejected" className="h-[calc(100%-4rem)]">
          <ScrollArea className="h-full">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.display_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{user.display_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Заявка отклонена: {formatDate(user.created_at)}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Отклонён
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};