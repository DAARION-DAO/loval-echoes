import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Shield, CheckCircle, AlertTriangle, LogIn, Loader2 } from 'lucide-react';

export default function AcceptInvite() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMsg('No invitation token found in the link.');
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token || !user) return;
    
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await (supabase as any).rpc('accept_platform_admin_invite', {
        p_invite_token: token
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: 'Invitation accepted!',
        description: 'You are now a platform Guardian.'
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/team');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invitation. Make sure the invitation is valid and matches your signed-in email address.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full border-slate-800 bg-slate-900/10">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold">Authentication Required</CardTitle>
            <CardDescription className="text-xs">
              You must be logged in to accept a platform Guardian invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button 
              onClick={() => navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
              className="bg-indigo-600 hover:bg-indigo-550 text-indigo-100 font-semibold gap-1.5 h-10 px-6"
            >
              <LogIn className="h-4 w-4" />
              Log In / Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900/10">
        <CardHeader className="text-center">
          <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
            success 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : errorMsg 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
          }`}>
            {success ? (
              <CheckCircle className="h-6 w-6" />
            ) : errorMsg ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <Shield className="h-6 w-6" />
            )}
          </div>
          <CardTitle className="text-lg font-bold">
            {success ? 'Invitation Accepted' : 'Guardian Invitation'}
          </CardTitle>
          <CardDescription className="text-xs">
            {success 
              ? 'Redirecting to platform team page...' 
              : 'You have been invited to become a platform administrator (Guardian).'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4 pb-6">
          {errorMsg ? (
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-400 leading-relaxed">
              {errorMsg}
            </div>
          ) : !success && (
            <div className="text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-200">Signed in as: {user.email}</p>
              <p className="mt-2 text-slate-400">
                Accepting this invitation will grant your account access to platform management tools.
              </p>
            </div>
          )}

          {!success && !errorMsg && (
            <Button 
              onClick={handleAccept} 
              disabled={submitting || !token}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-550 text-indigo-100 font-bold border border-indigo-500/30 gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Accept Guardian Invitation
            </Button>
          )}

          {errorMsg && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="w-full h-10 text-xs border-slate-800"
            >
              Go to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
