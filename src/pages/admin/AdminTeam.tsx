import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, ShieldAlert, Copy, RefreshCw, Trash2, Check, ExternalLink } from 'lucide-react';

interface GuardianProfile {
  id: string;
  telegram_username: string | null;
  wallet_address: string | null;
  approval_status: string;
  created_at: string;
}

interface AdminInvite {
  id: string;
  email: string;
  invited_role: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  invite_token: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

export default function AdminTeam() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [guardians, setGuardians] = useState<GuardianProfile[]>([]);
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load current guardians
      const { data: gData, error: gError } = await supabase
        .from('profiles')
        .select('id, telegram_username, wallet_address, approval_status, created_at')
        .eq('role', 'guardian');

      if (gError) throw gError;
      setGuardians(gData || []);

      // Load invites
      const { data: iData, error: iError } = await (supabase as any)
        .from('platform_admin_invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (iError) {
        // If table doesn't exist yet (migration not applied to remote), set empty array
        console.warn('Invites table fetch error (likely migration not applied yet):', iError);
        setInvites([]);
      } else {
        setInvites((iData as AdminInvite[]) || []);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const { data, error } = await (supabase as any).rpc('admin_create_platform_admin_invite', {
        invited_email: email.trim().toLowerCase(),
        invited_role: 'guardian'
      });

      if (error) throw error;

      toast({
        title: 'Invite created successfully',
        description: `Invitation generated for ${email}`
      });

      setEmail('');
      loadData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create invite',
        description: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const { error } = await (supabase as any).rpc('admin_revoke_platform_admin_invite', {
        invite_id: inviteId
      });

      if (error) throw error;

      toast({
        title: 'Invite revoked'
      });

      loadData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to revoke invite',
        description: err.message
      });
    }
  };

  const handleCopyLink = (invite: AdminInvite) => {
    const inviteUrl = `${getPublicSiteUrl()}/accept-invite?token=${invite.invite_token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(invite.id);
    toast({
      title: 'Link copied to clipboard'
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            {t.nav.platformTeam}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage platform guardians and invitations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="h-8">
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Reload
        </Button>
      </div>

      {/* Security Banner */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4 flex items-start gap-3 text-xs leading-relaxed text-amber-300">
          <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Security Warning:</span>
            <p>
              Platform Guardian access is extremely sensitive. Guardians can manage platform metadata, verify transactions, and approve access requests.
              By default, they cannot read private MicroDAO messages, document contents, or RAG memory segments.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Invite Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-800 bg-slate-900/10">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-400" />
                {t.pricingExtra.inviteGuardian}
              </CardTitle>
              <CardDescription className="text-[11px]">
                Enter email to invite a new platform administrator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-350">{t.pricingExtra.guardianEmail}</label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-950/40 border-slate-800 h-10 text-xs"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting || !email}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-550 text-indigo-100 font-semibold text-xs border border-indigo-500/30"
                >
                  {t.pricingExtra.createInvite}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Guardians List */}
          <Card className="border-slate-800 bg-slate-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Guardians ({guardians.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-850 text-xs">
                {guardians.map((g) => (
                  <div key={g.id} className="p-4 flex flex-col gap-1 hover:bg-slate-950/20">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        {g.telegram_username ? `@${g.telegram_username}` : 'No Telegram'}
                      </span>
                      <Badge variant="outline" className="text-[9px] border-indigo-500/30 text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5">
                        Guardian
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-450 truncate">
                      Wallet: {g.wallet_address || 'Not connected'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Invites List */}
        <div className="lg:col-span-2">
          <Card className="border-slate-800 bg-slate-900/10">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                {t.pricingExtra.pendingInvites}
              </CardTitle>
              <CardDescription className="text-xs">
                Manage sent invitations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {invites.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No invitations found. Make sure the local database migration is applied.
                </div>
              ) : (
                <div className="divide-y divide-slate-850">
                  {invites.map((invite) => {
                    const isPending = invite.status === 'pending';
                    const isAccepted = invite.status === 'accepted';
                    const isRevoked = invite.status === 'revoked';
                    const isExpired = new Date(invite.expires_at) < new Date() && isPending;
                    const displayStatus = isExpired ? 'expired' : invite.status;

                    return (
                      <div key={invite.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-950/10">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{invite.email}</span>
                            <Badge 
                              variant={
                                displayStatus === 'accepted' ? 'default' :
                                displayStatus === 'revoked' ? 'destructive' :
                                displayStatus === 'expired' ? 'outline' : 'secondary'
                              }
                              className="text-[9px] px-1.5 py-0.5 uppercase tracking-wider font-bold"
                            >
                              {displayStatus}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-slate-450 space-x-2">
                            <span>Created: {new Date(invite.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Expires: {new Date(invite.expires_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {isPending && !isExpired && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyLink(invite)}
                                className="h-8 text-[11px] gap-1 px-2.5"
                              >
                                {copiedId === invite.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy Link
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRevokeInvite(invite.id)}
                                className="h-8 text-[11px] gap-1 px-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/30"
                              >
                                <Trash2 className="h-3 w-3" />
                                Revoke
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
