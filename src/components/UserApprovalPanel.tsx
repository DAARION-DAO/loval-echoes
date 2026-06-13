import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

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
    email?: string;
  } | null;
}

interface UserApprovalPanelProps {
  className?: string;
}

export const UserApprovalPanel = ({ requests: propRequests, className = '' }: { requests?: ApprovalRequest[], className?: string }) => {
  const { t, language } = useTranslation();
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
      // First check if user is approved to see any requests  
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('approval_status')
        .eq('user_id', user.id)
        .maybeSingle();

      // Only approved users can see approval requests (admin check is in RLS)
      if (!userProfile || userProfile.approval_status !== 'approved') {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Step 1: Fix any data inconsistencies automatically
      try {
        await supabase.rpc('fix_approval_inconsistencies');
      } catch (fixError) {
        console.warn('Could not auto-fix inconsistencies:', fixError);
        // Continue loading requests even if auto-fix fails
      }

      // Step 2: Load pending requests
      const { data, error } = await supabase
        .from('user_approval_requests')
        .select(`
          id,
          user_id,
          requested_at,
          status,
          approved_by,
          rejected_by,
          total_existing_users
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (error) {
        // If RLS blocks access, just return empty results
        if (error.code === 'PGRST116' || error.message?.includes('row-level security')) {
          console.log('RLS blocked access to approval requests - user may not be admin');
          setRequests([]);
          return;
        }
        console.error('Database error loading requests:', error);
        throw error;
      }

      // Step 3: Load profile data for each request separately
      let requestsWithProfiles: ApprovalRequest[] = [];
      
      if (data && data.length > 0) {
        const userIds = data.map(req => req.user_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url, email')
          .in('user_id', userIds);
        
        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          // Continue without profiles if needed
        }
        
        requestsWithProfiles = data.map(request => ({
          ...request,
          profiles: profiles?.find(profile => profile.user_id === request.user_id) || null
        }));
      }

      console.log(`Loaded ${requestsWithProfiles?.length || 0} pending approval requests`);
      setRequests(requestsWithProfiles || []);

      // Step 3: Check for any remaining inconsistencies and warn user
      try {
        const { data: inconsistencies, error: inconsError } = await supabase
          .from('approval_inconsistencies')
          .select('*');
        
        if (!inconsError && inconsistencies && inconsistencies.length > 0) {
          console.warn('Data inconsistencies detected:', inconsistencies);
          toast({
            title: t.userApprovalPanel.attentionTitle,
            description: t.userApprovalPanel.inconsistenciesDesc.replace('{count}', String(inconsistencies.length)),
            variant: 'destructive',
          });
        }
      } catch (inconsError) {
        console.warn('Could not check for inconsistencies:', inconsError);
      }

    } catch (error: any) {
      console.error('Error loading approval requests:', error);
      toast({
        title: t.userApprovalPanel.loadErrorTitle,
        description: t.userApprovalPanel.loadErrorDesc.replace('{error}', error.message || ''),
        variant: 'destructive',
      });
      setRequests([]);
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

      if (approvalError) {
        console.error('Vote error:', approvalError);
        throw approvalError;
      }

      // Get current request data
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Get all votes for this request
      const { data: votes, error: votesError } = await supabase
        .from('user_approvals')
        .select('decision')
        .eq('request_id', requestId);

      if (votesError) {
        console.error('Votes error:', votesError);
        throw votesError;
      }

      const approvals = votes.filter(vote => vote.decision === 'approve').length;
      const rejections = votes.filter(vote => vote.decision === 'reject').length;

      // Update request with vote counts
      const { error: updateError } = await supabase
        .from('user_approval_requests')
        .update({
          approved_by: Array(approvals).fill('approved'),
          rejected_by: Array(rejections).fill('rejected')
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
      
      let finalStatus: string | null = null;
      let profileStatus: string | null = null;

      if (approvals >= requiredApprovals) {
        finalStatus = 'approved';
        profileStatus = 'approved';
      } else if (rejections >= requiredApprovals) {
        finalStatus = 'rejected';
        profileStatus = 'rejected';
      }

      if (finalStatus && profileStatus) {
        // Update the request status
        const { error: statusError } = await supabase
          .from('user_approval_requests')
          .update({ status: finalStatus })
          .eq('id', requestId);

        if (statusError) {
          console.error('Status error:', statusError);
          throw statusError;
        }

        // Update the user's profile status via admin RPC (column-level RLS forbids direct update)
        const { error: profileError } = await supabase.rpc('admin_set_approval_status', {
          p_user_id: request.user_id,
          p_status: profileStatus,
        });

        if (profileError) {
          console.error('Profile update error:', profileError);
          toast({
            title: t.userApprovalPanel.updateProfileErrorTitle,
            description: t.userApprovalPanel.updateProfileErrorDesc.replace('{error}', profileError.message),
            variant: "destructive",
          });
          throw profileError;
        }

        console.log(`Successfully updated user ${request.user_id} to status: ${profileStatus}`);
      }

      // Reload requests
      await loadApprovalRequests();

      toast({
        title: decision === 'approve' ? t.userApprovalPanel.voiceApprovedTitle : t.userApprovalPanel.voiceRejectedTitle,
        description: finalStatus === 'approved'
          ? t.userApprovalPanel.userApprovedDesc 
          : finalStatus === 'rejected'
            ? t.userApprovalPanel.userRejectedDesc
            : t.userApprovalPanel.voteRegisteredDesc.replace('{count}', String(requiredApprovals - approvals)),
      });

      // Clear notes
      setNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[requestId];
        return newNotes;
      });

    } catch (error: any) {
      console.error('Error processing approval:', error);
      toast({
        title: t.userApprovalPanel.actionErrorTitle,
        description: t.userApprovalPanel.actionErrorDesc.replace('{error}', error.message || ''),
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
            {t.userApprovalPanel.panelTitle}
          </CardTitle>
          <CardDescription>
            {t.userApprovalPanel.panelDesc}
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
                    <div>
                      <div className="font-medium">{request.profiles?.display_name || t.userApprovalPanel.unknownUser}</div>
                      {request.profiles?.email && (
                        <div className="text-sm text-muted-foreground">{request.profiles.email}</div>
                      )}
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(request.requested_at).toLocaleDateString(language === 'ru' ? 'ru-RU' : (language === 'uk' ? 'uk-UA' : (language === 'es' ? 'es-ES' : 'en-US')))}
                      </div>
                    </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {t.userApprovalPanel.approvalsCount.replace('{count}', String(request.approved_by.length)).replace('{total}', String(request.total_existing_users))}
                    </Badge>
                    {request.rejected_by.length > 0 && (
                      <Badge variant="destructive">
                        {t.userApprovalPanel.rejectionsCount.replace('{count}', String(request.rejected_by.length))}
                      </Badge>
                    )}
                  </div>
                </div>

                {!hasUserVoted && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder={t.userApprovalPanel.commentPlaceholder}
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
                        {t.userApprovalPanel.approveBtn}
                      </Button>
                      
                      <Button
                        variant="destructive"
                        onClick={() => handleApproval(request.id, 'reject')}
                        disabled={submitting === request.id}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        {t.userApprovalPanel.rejectBtn}
                      </Button>
                    </div>
                  </div>
                )}

                {hasUserVoted && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {request.approved_by.includes(user?.id || '') ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {t.userApprovalPanel.alreadyApproved}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        {t.userApprovalPanel.alreadyRejected}
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